import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "superadmin@yashinfosystems.com" },
    update: {
      name: "Yash Infosystems Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
      businessId: null
    },
    create: {
      name: "Yash Infosystems Super Admin",
      email: "superadmin@yashinfosystems.com",
      passwordHash,
      role: Role.SUPER_ADMIN
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
