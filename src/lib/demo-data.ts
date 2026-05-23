import type { GuestSuggestions } from "@/lib/ai";

export const demoBusiness = {
  id: "demo-business",
  name: "Royal Orchid Lucknow",
  slug: "royal-orchid-lucknow",
  category: "Hotel",
  city: "Lucknow",
  address: "Hazratganj, Lucknow",
  welcomeMessage: "Thank you for visiting. Your honest feedback helps us improve.",
  googleReviewLink: "https://search.google.com/local/writereview?placeid=demo",
  tripadvisorLink: "https://www.tripadvisor.com/",
  bookingLink: "https://www.booking.com/",
  zomatoLink: "https://www.zomato.com/",
  swiggyLink: "https://www.swiggy.com/",
  developerBranding: "Designed & Developed by Yash Infosystems",
  settings: { brandTone: "Premium, attentive and guest-first" },
  seoKeywords: [
    { keyword: "best hotel in Lucknow" },
    { keyword: "family restaurant" },
    { keyword: "rooftop dining" }
  ],
  locations: [{ id: "demo-location", name: "Hazratganj Branch", slug: "hazratganj", city: "Lucknow", address: "Hazratganj, Lucknow" }]
};

export const demoReviews = [
  {
    id: "demo-review-1",
    platform: "GOOGLE",
    reviewerName: "Ananya Sharma",
    rating: 5,
    reviewText: "Great stay, very polite staff and clean rooms.",
    language: "English",
    sentiment: "positive",
    status: "PENDING_REPLY",
    replies: []
  },
  {
    id: "demo-review-2",
    platform: "ZOMATO",
    reviewerName: "Rahul Verma",
    rating: 3,
    reviewText: "Food was good but service was slow during dinner.",
    language: "English",
    sentiment: "mixed",
    status: "ESCALATED",
    replies: []
  }
];

export const demoTickets = [
  {
    id: "demo-ticket-1",
    guestName: "Rahul Verma",
    priority: "Medium",
    status: "OPEN",
    reviewText: "Food was good but service was slow during dinner."
  }
];

export const demoQrCodes = [
  {
    id: "demo-qr-1",
    businessId: demoBusiness.id,
    label: "Room 204",
    qrType: "Room",
    destinationUrl: "/r/royal-orchid-lucknow/room/204",
    scanCount: 18,
    isActive: true
  }
];

export function isDemoMode() {
  return false;
}

export function demoGuestSuggestions(feedbackText: string): GuestSuggestions {
  return {
    shortEnglish: `We had a genuine experience at ${demoBusiness.name}. ${feedbackText}`,
    detailedSeoEnglish: `${demoBusiness.name} offered a comfortable visit in Lucknow. ${feedbackText}`,
    hindi: `${demoBusiness.name} में हमारा अनुभव वास्तविक और अच्छा रहा। ${feedbackText}`,
    hinglish: `${demoBusiness.name} ka experience kaafi accha raha. ${feedbackText}`
  };
}
