import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = (await request.json()) as {
      nama_kategori?: string;
      deskripsi?: string;
    };
    const { nama_kategori, deskripsi } = body;

    if (!nama_kategori) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    await prisma.kategori.update({
      where: { id_kategori: id },
      data: { nama_kategori, deskripsi: deskripsi || null },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Kategori berhasil diperbarui",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Gagal memperbarui kategori" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Cek apakah kategori masih dipakai
    const used = await prisma.pengaduan.count({ where: { id_kategori: id } });
    if (used > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${used} laporan`,
        },
        { status: 400 },
      );
    }

    await prisma.kategori.delete({ where: { id_kategori: id } });
    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Gagal menghapus kategori" },
      { status: 500 },
    );
  }
}
