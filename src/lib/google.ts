import { ConnectionStatus, Platform, ReviewStatus } from "@prisma/client";
import { analyzeReview } from "@/lib/ai";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const GOOGLE_SCOPE = "https://www.googleapis.com/auth/business.manage";

export function getGoogleOAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    response_type: "code",
    scope: GOOGLE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      grant_type: "authorization_code"
    })
  });
  if (!response.ok) throw new Error(`Google token exchange failed: ${await response.text()}`);
  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
  }>;
}

export async function saveGoogleConnection(businessId: string, code: string) {
  const token = await exchangeGoogleCode(code);
  return prisma.platformConnection.upsert({
    where: { businessId_platform: { businessId, platform: Platform.GOOGLE } },
    update: {
      accessToken: encryptSecret(token.access_token),
      refreshToken: token.refresh_token ? encryptSecret(token.refresh_token) : undefined,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
      tokenType: token.token_type,
      scope: token.scope,
      status: ConnectionStatus.CONNECTED,
      isActive: true
    },
    create: {
      businessId,
      platform: Platform.GOOGLE,
      accountName: "Google Business Profile",
      accessToken: encryptSecret(token.access_token),
      refreshToken: encryptSecret(token.refresh_token),
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
      tokenType: token.token_type,
      scope: token.scope,
      status: ConnectionStatus.CONNECTED,
      isActive: true,
      credentialsJson: {}
    }
  });
}

export async function getGoogleAccessToken(businessId: string) {
  const connection = await prisma.platformConnection.findUnique({
    where: { businessId_platform: { businessId, platform: Platform.GOOGLE } }
  });
  if (!connection?.accessToken) throw new Error("Google is not connected for this business.");

  const hasValidToken = connection.expiresAt && connection.expiresAt.getTime() > Date.now() + 60_000;
  if (hasValidToken) return decryptSecret(connection.accessToken) as string;

  const refreshToken = decryptSecret(connection.refreshToken);
  if (!refreshToken) throw new Error("Google refresh token is missing. Reconnect Google.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  if (!response.ok) {
    await prisma.platformConnection.update({ where: { id: connection.id }, data: { status: ConnectionStatus.EXPIRED, isActive: false } });
    throw new Error(`Google token refresh failed: ${await response.text()}`);
  }

  const token = await response.json() as { access_token: string; expires_in: number; token_type?: string; scope?: string };
  await prisma.platformConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: encryptSecret(token.access_token),
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
      tokenType: token.token_type || connection.tokenType,
      scope: token.scope || connection.scope,
      status: ConnectionStatus.CONNECTED,
      isActive: true
    }
  });
  return token.access_token;
}

async function googleFetch<T>(businessId: string, url: string, init?: RequestInit) {
  const accessToken = await getGoogleAccessToken(businessId);
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });
  if (!response.ok) throw new Error(`Google API error: ${response.status} ${await response.text()}`);
  return response.json() as Promise<T>;
}

export async function fetchGoogleAccounts(businessId: string) {
  return googleFetch<{ accounts?: Array<{ name: string; accountName?: string; type?: string }> }>(
    businessId,
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
  );
}

export async function fetchGoogleLocations(businessId: string, accountName: string) {
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,metadata`;
  return googleFetch<{ locations?: Array<{ name: string; title?: string; metadata?: { placeId?: string }; storefrontAddress?: { locality?: string; addressLines?: string[] } }> }>(businessId, url);
}

export async function saveGoogleLocationMapping(input: {
  businessId: string;
  accountName: string;
  locationName: string;
  title?: string;
  placeId?: string;
  city?: string;
  address?: string;
}) {
  const slug = (input.title || input.locationName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const location = await prisma.location.upsert({
    where: { businessId_slug: { businessId: input.businessId, slug } },
    update: {
      googleAccountName: input.accountName,
      googleLocationName: input.title,
      googleLocationId: input.locationName,
      googlePlaceId: input.placeId
    },
    create: {
      businessId: input.businessId,
      name: input.title || input.locationName,
      slug,
      address: input.address || "",
      city: input.city || "",
      googleAccountName: input.accountName,
      googleLocationName: input.title,
      googleLocationId: input.locationName,
      googlePlaceId: input.placeId
    }
  });

  await prisma.platformConnection.update({
    where: { businessId_platform: { businessId: input.businessId, platform: Platform.GOOGLE } },
    data: {
      googleAccountName: input.accountName,
      googleLocationName: input.title,
      googleLocationId: input.locationName,
      externalAccountId: input.accountName,
      status: ConnectionStatus.CONNECTED,
      isActive: true
    }
  });
  return location;
}

function normalizeGoogleRating(starRating?: string) {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5
  };
  return starRating ? map[starRating] || null : null;
}

export async function syncGoogleReviews(businessId: string, locationId?: string) {
  const connection = await prisma.platformConnection.findUnique({
    where: { businessId_platform: { businessId, platform: Platform.GOOGLE } }
  });
  const location = locationId
    ? await prisma.location.findFirst({ where: { id: locationId, businessId } })
    : await prisma.location.findFirst({ where: { businessId, googleLocationId: { not: null } } });
  const googleLocationId = location?.googleLocationId || connection?.googleLocationId;
  if (!googleLocationId) throw new Error("Select a Google location before syncing reviews.");

  const data = await googleFetch<{ reviews?: Array<{ name: string; reviewId?: string; reviewer?: { displayName?: string }; starRating?: string; comment?: string; updateTime?: string; reviewReply?: unknown }> }>(
    businessId,
    `https://mybusiness.googleapis.com/v4/${googleLocationId}/reviews`
  );

  const saved = [];
  for (const review of data.reviews || []) {
    const rating = normalizeGoogleRating(review.starRating);
    const reviewText = review.comment || "";
    const analysis = await analyzeReview(reviewText, rating);
    const externalReviewId = review.reviewId || review.name;
    saved.push(await prisma.review.upsert({
      where: { businessId_platform_externalReviewId: { businessId, platform: Platform.GOOGLE, externalReviewId } },
      update: {
        reviewerName: review.reviewer?.displayName,
        rating,
        reviewText,
        language: analysis.language,
        sentiment: analysis.sentiment,
        status: review.reviewReply ? ReviewStatus.REPLIED : ReviewStatus.PENDING_REPLY
      },
      create: {
        businessId,
        locationId: location?.id,
        platform: Platform.GOOGLE,
        externalReviewId,
        reviewerName: review.reviewer?.displayName,
        rating,
        reviewText,
        language: analysis.language,
        sentiment: analysis.sentiment,
        issueCategory: analysis.issueCategory,
        status: review.reviewReply ? ReviewStatus.REPLIED : ReviewStatus.PENDING_REPLY,
        source: "google"
      }
    }));
  }
  return saved;
}

export async function postGoogleReviewReply(businessId: string, googleLocationId: string, externalReviewId: string, replyText: string) {
  return googleFetch<{ comment: string; updateTime?: string }>(
    businessId,
    `https://mybusiness.googleapis.com/v4/${googleLocationId}/reviews/${externalReviewId}/reply`,
    { method: "PUT", body: JSON.stringify({ comment: replyText }) }
  );
}
