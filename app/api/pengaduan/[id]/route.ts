import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PengaduanStatus } from "@prisma/client";

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
        {
          success: false,
          message: "Akses ditolak. Hanya Admin yang dapat memperbarui status!",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    const { status } = body;

    if (!status) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Status baru wajib dikirim!" },
        { status: 400 },
      );
    }

    const existingPengaduan = await prisma.pengaduan.findFirst({
      where: { id_pengaduan: id, is_deleted: 0 },
    });

    if (!existingPengaduan) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Data pengaduan tidak ditemukan atau telah dihapus.",
        },
        { status: 404 },
      );
    }

    await prisma.pengaduan.update({
      where: { id_pengaduan: id },
      data: {
        status: status as PengaduanStatus,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Status laporan berhasil diperbarui menjadi ${status}!`,
    });
  } catch (error) {
    console.error("Prisma Update Status Pengaduan Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal memperbarui status pengaduan",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
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
        {
          success: false,
          message: "Akses ditolak. Hanya Admin yang dapat menghapus laporan!",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    await prisma.pengaduan.update({
      where: { id_pengaduan: id },
      data: {
        is_deleted: 1,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Laporan pengaduan berhasil dihapus dari sistem!",
    });
  } catch (error) {
    console.error("Prisma Delete Pengaduan Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal menghapus laporan pengaduan",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
