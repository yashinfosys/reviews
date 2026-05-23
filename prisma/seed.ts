import { PrismaClient, Platform, Role, SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const business = await prisma.business.upsert({
    where: { slug: "royal-orchid-lucknow" },
    update: {},
    create: {
      name: "Royal Orchid Lucknow",
      slug: "royal-orchid-lucknow",
      category: "Hotel",
      address: "Hazratganj, Lucknow",
      city: "Lucknow",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      website: "https://example.com",
      googleReviewLink: "https://search.google.com/local/writereview?placeid=demo",
      tripadvisorLink: "https://www.tripadvisor.com/",
      bookingLink: "https://www.booking.com/",
      zomatoLink: "https://www.zomato.com/",
      swiggyLink: "https://www.swiggy.com/",
      settings: {
        create: {
          brandTone: "Premium, attentive and guest-first"
        }
      },
      seoKeywords: {
        create: [
          { keyword: "best hotel in Lucknow" },
          { keyword: "family restaurant" },
          { keyword: "rooftop dining" }
        ]
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.PRO,
          qrLimit: 50,
          aiUsageLimit: 5000,
          reviewLimit: 5000
        }
      }
    }
  });

  const location = await prisma.location.upsert({
    where: { businessId_slug: { businessId: business.id, slug: "hazratganj" } },
    update: {},
    create: {
      businessId: business.id,
      name: "Hazratganj Branch",
      slug: "hazratganj",
      address: "Hazratganj, Lucknow",
      city: "Lucknow"
    }
  });

  await prisma.user.upsert({
    where: { email: "super@reviewboost.ai" },
    update: {},
    create: {
      name: "Super Admin",
      email: "super@reviewboost.ai",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@reviewboost.ai" },
    update: {},
    create: {
      name: "Business Admin",
      email: "admin@reviewboost.ai",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: business.id
    }
  });

  await prisma.review.createMany({
    data: [
      {
        businessId: business.id,
        locationId: location.id,
        platform: Platform.GOOGLE,
        reviewerName: "Ananya Sharma",
        rating: 5,
        reviewText: "Great stay, very polite staff and clean rooms.",
        language: "English",
        sentiment: "positive",
        status: "PENDING_REPLY",
        source: "google"
      },
      {
        businessId: business.id,
        locationId: location.id,
        platform: Platform.ZOMATO,
        reviewerName: "Rahul Verma",
        rating: 3,
        reviewText: "Food was good but service was slow during dinner.",
        language: "English",
        sentiment: "mixed",
        status: "ESCALATED",
        source: "manual"
      }
    ],
    skipDuplicates: true
  });

  await prisma.qRCode.upsert({
    where: { id: "demo-room-204" },
    update: {},
    create: {
      id: "demo-room-204",
      businessId: business.id,
      locationId: location.id,
      qrType: "Room",
      label: "Room 204",
      destinationUrl: "/r/royal-orchid-lucknow/hazratganj/room/204"
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
