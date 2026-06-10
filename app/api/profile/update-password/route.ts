import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Sesuaikan dengan jalur file authOptions milikmu

export async function PUT(request: NextRequest) {
  try {
    // 1. Ambil session user yang sedang login secara aman di server
    const session = await getServerSession(authOptions);

    // Jika tidak ada session, block akses
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi Anda telah berakhir, silakan login kembali.",
        },
        { status: 401 },
      );
    }

    // Ambil ID user dari session (pastikan type/id user sudah didaftarkan di callbacks session next-auth)
    const userId = session.user.id_user;

    const body = await request.json();
    const { password_lama, password_baru, konfirmasi_password } = body;

    if (!password_lama || !password_baru || !konfirmasi_password) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi!" },
        { status: 400 },
      );
    }

    if (password_baru !== konfirmasi_password) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi password baru tidak cocok!" },
        { status: 400 },
      );
    }

    // 2. Ambil data user dari database
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan!" },
        { status: 404 },
      );
    }

    // 3. Validasi password lama
    const isMatch = await bcrypt.compare(password_lama, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Password lama yang Anda masukkan salah!" },
        { status: 400 },
      );
    }

    // 4. Hash password baru dan simpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password_baru, salt);

    await prisma.users.update({
      where: { id_user: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password Anda berhasil diperbarui!",
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
