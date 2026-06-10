import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Pengaduan, Prisma } from "@prisma/client";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id_user, role } = session.user;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const whereClause: Prisma.PengaduanWhereInput = { is_deleted: 1 };

    if (role === "siswa") {
      whereClause.id_user = id_user;
    }

    if (search) {
      whereClause.OR = [
        {
          judul_laporan: {
            contains: search,
          },
        },
        {
          kategori: {
            nama_kategori: {
              contains: search,
            },
          },
        },
      ];
    }

    const pengaduans = await prisma.pengaduan.findMany({
      where: whereClause,
      include: {
        user: { select: { nama_lengkap: true, nis_nip: true } },
        kategori: { select: { nama_kategori: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Mengembalikan array aman untuk .map() di frontend tabel
    return NextResponse.json({ success: true, data: pengaduans });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}
