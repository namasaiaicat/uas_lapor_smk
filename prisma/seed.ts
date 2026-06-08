import "dotenv/config";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Kembali mengimpor dari lib proyekmu

async function main() {
  console.log("Memulai proses seeding...");

  // Gunakan upsert seperti pola proyek lamamu agar aman dari error duplikasi data
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.users.upsert({
    where: { id_user: "USR001" }, // Mencari berdasarkan id_user
    update: {
      nis_nip: "123456",
      nama_lengkap: "Admin Lapor SMK",
      username: "admin",
      password: hashedPassword,
      role: UserRole.admin,
      // Kita isi updated_at secara manual jika datanya ternyata melakukan update
      updated_at: new Date(),
    },
    create: {
      id_user: "USR001",
      nis_nip: "123456",
      nama_lengkap: "Admin Lapor SMK",
      username: "admin",
      password: hashedPassword,
      role: UserRole.admin,
    },
  });

  // 2. Tambah/Update Data Siswa
  const siswa = await prisma.users.upsert({
    where: { id_user: "USR002" },
    update: {
      nis_nip: "654321",
      nama_lengkap: "Budi Setiawan",
      username: "budi",
      password: hashedPassword,
      role: UserRole.siswa,
      updated_at: new Date(),
    },
    create: {
      id_user: "USR002",
      nis_nip: "654321",
      nama_lengkap: "Budi Setiawan",
      username: "budi",
      password: hashedPassword,
      role: UserRole.siswa,
    },
  });

  console.log("✅ Seeded users:", { admin, siswa });
  console.log("Proses seeding selesai dengan sukses!");

  const kategoriFasilitas = await prisma.kategori.create({
    data: {
      id_kategori: "KTG01",
      nama_kategori: "Fasilitas Sekolah",
      deskripsi: "Laporan terkait kerusakan sarana dan prasarana sekolah",
    },
  });

  const kategoriKebersihan = await prisma.kategori.create({
    data: {
      id_kategori: "KTG02",
      nama_kategori: "Kebersihan",
      deskripsi:
        "Laporan mengenai lingkungan sekolah yang kotor atau kurang terawat",
    },
  });

  console.log("✅ Data Kategori berhasil ditambahkan!");
  console.log("✨ Proses seeding selesai dengan sukses!");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
