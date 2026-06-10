import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type PengaduanStatus = "A" | "Proses" | "Selesai";
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Validasi Sesi & Hak Akses (Hanya Admin yang boleh mengaktifkan/nonaktifkan user)
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            "Akses ditolak. Hanya Admin yang dapat memperbarui status user!",
        },
        { status: 403 },
      );
    }

    // 2. Ambil ID User dan Request Body
    const { id } = await params;
    const body = (await request.json()) as { is_active?: number };
    const { is_active } = body;

    // Validasi input wajib ada nilai 0 atau 1
    if (is_active === undefined || ![0, 1].includes(is_active)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Status is_active (0 atau 1) wajib dikirim!",
        },
        { status: 400 },
      );
    }

    // 3. Cek apakah user yang mau di-update datanya eksis
    const existingUser = await prisma.users.findFirst({
      where: { id_user: id, is_deleted: 0 },
    });

    if (!existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User tidak ditemukan atau telah dihapus.",
        },
        { status: 404 },
      );
    }

    // 4. Eksekusi Update status ke database
    await prisma.users.update({
      where: { id_user: id },
      data: {
        is_active: is_active,
      },
    });

    const statusTeks = is_active === 1 ? "Aktif" : "Nonaktif";

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Status pengguna ${existingUser.nama_lengkap} berhasil diubah menjadi ${statusTeks}!`,
    });
  } catch (error) {
    console.error("Prisma Update Status User Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal memperbarui status pengguna",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
