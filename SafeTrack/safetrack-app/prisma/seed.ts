import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "david@safetrack.demo" },
    update: {},
    create: {
      email: "david@safetrack.demo",
      passwordHash,
      name: "David",
      trustedContacts: {
        create: [
          { name: "Mom", phone: "+234-800-000-0001", relation: "Parent" },
          { name: "Brother", phone: "+234-800-000-0002", relation: "Sibling" },
        ],
      },
    },
  });

  console.log("Seeded demo user:", user.email, "(password: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
