import { PrismaClient, Role, SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);
  const superAdminEmail = "superadmin@yashinfosystems.com";
  const businessAdminEmail = "admin@reviewboost.ai";

  const business = await prisma.business.upsert({
    where: { slug: "reviewboost-demo-business" },
    update: {},
    create: {
      name: "ReviewBoost Demo Business",
      slug: "reviewboost-demo-business",
      category: "Hotel",
      address: "Lucknow, Uttar Pradesh",
      city: "Lucknow",
      settings: {
        create: {
          brandTone: "Warm, professional and hospitality-focused"
        }
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

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: "Super Admin",
      password,
      role: Role.SUPER_ADMIN,
      businessId: null
    },
    create: {
      name: "Super Admin",
      email: superAdminEmail,
      password,
      role: Role.SUPER_ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: businessAdminEmail },
    update: {
      name: "Business Admin",
      password,
      role: Role.BUSINESS_ADMIN,
      businessId: business.id
    },
    create: {
      name: "Business Admin",
      email: businessAdminEmail,
      password,
      role: Role.BUSINESS_ADMIN,
      businessId: business.id
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
