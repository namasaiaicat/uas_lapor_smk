import "dotenv/config";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Kembali mengimpor dari lib proyekmu

async function main() {
  console.log("Memulai proses seeding...");

  // Gunakan upsert seperti pola proyek lamamu agar aman dari error duplikasi data
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.users.upsert({
    where: { id_user: "USR001" },
    update: {},
    create: {
      id_user: "USR001",
      nis_nip: "123456",
      nama_lengkap: "Administrator SMK",
      username: "admin",
      password: hashedPassword,
      role: UserRole.admin,
    },
  });

  const siswa = await prisma.users.upsert({
    where: { id_user: "USR002" },
    update: {},
    create: {
      id_user: "USR002",
      nis_nip: "123456",
      nama_lengkap: "Siswa SMK",
      username: "siswa",
      password: hashedPassword,
      role: UserRole.siswa,
    },
  });

  console.log("✅ Seeded users:", { admin, siswa });
  console.log("Proses seeding selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
