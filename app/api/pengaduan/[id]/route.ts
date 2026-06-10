import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type PengaduanStatus = "Pending" | "Proses" | "Selesai";

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
    const body = (await request.json()) as {
      status?: string;
      feedback_admin?: string;
    };
    const { status, feedback_admin } = body;

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

    if (existingPengaduan.status !== status) {
      const lastLog = await prisma.logStatusPengaduan.findFirst({
        orderBy: { id_log: "desc" },
        select: { id_log: true },
      });

      let nextId = "LOG0000001";
      if (lastLog) {
        const lastNumber = parseInt(lastLog.id_log.replace("LOG", ""), 10);
        const nextNumberString = String(lastNumber + 1).padStart(7, "0");
        nextId = `LOG${nextNumberString}`;
      }

      await prisma.logStatusPengaduan.create({
        data: {
          id_log: nextId,
          id_pengaduan: id,
          status_lama: existingPengaduan.status,
          status_baru: status,
          tgl_perubahan: new Date(),
        },
      });
    }

    await prisma.pengaduan.update({
      where: { id_pengaduan: id },
      data: {
        status: status as PengaduanStatus,
        ...(feedback_admin !== undefined && { feedback_admin }),
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

export async function PATCH(
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
      message: "Laporan pengaduan berhasil dinonaktifkan (Soft Delete)!",
    });
  } catch (error) {
    console.error("Prisma PATCH Soft Delete Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal menghapus laporan pengaduan via PATCH",
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
          message:
            "Akses ditolak. Hanya Admin yang dapat menghapus permanen laporan!",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    await prisma.pengaduan.delete({
      where: { id_pengaduan: id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Laporan pengaduan berhasil dihapus permanen dari database!",
    });
  } catch (error) {
    console.error("Prisma Delete Pengaduan Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal menghapus permanen laporan pengaduan",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Akses ditolak. Hanya Admin yang dapat memulihkan laporan!",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    const existing = await prisma.pengaduan.findFirst({
      where: { id_pengaduan: id, is_deleted: 1 },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Laporan tidak ditemukan di recycle bin." },
        { status: 404 },
      );
    }

    await prisma.pengaduan.update({
      where: { id_pengaduan: id },
      data: { is_deleted: 0 },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Laporan berhasil dipulihkan!",
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal memulihkan laporan",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
