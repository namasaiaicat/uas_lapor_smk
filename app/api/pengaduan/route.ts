import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

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
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Kamu belum login / tidak terautentikasi" },
        { status: 401 },
      );
    }

    const { id_user, role } = session.user;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const whereClause: Prisma.PengaduanWhereInput = {
      is_deleted: 0,
    };

    if (role === "siswa") {
      whereClause.id_user = id_user;
    }

    if (search) {
      whereClause.judul_laporan = { contains: search };
    }

    const pengaduans = await prisma.pengaduan.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            nama_lengkap: true,
            nis_nip: true,
          },
        },
        kategori: {
          select: {
            nama_kategori: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: pengaduans,
    });
  } catch (error) {
    console.error("Prisma GET Pengaduan Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal mengambil data pengaduan",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Kamu wajib login untuk membuat laporan" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      id_kategori?: string;
      judul_laporan?: string;
      isi_laporan?: string;
      tgl_kejadian?: string;
      foto?: string;
    };

    const { id_kategori, judul_laporan, isi_laporan, tgl_kejadian, foto } =
      body;

    if (!id_kategori || !judul_laporan || !isi_laporan || !tgl_kejadian) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            "Semua kolom (Kategori, Judul, Isi Laporan, & Tanggal) wajib diisi!",
        },
        { status: 400 },
      );
    }

    const lastPengaduan = await prisma.pengaduan.findFirst({
      orderBy: { id_kategori: "desc" },
    });

    let nextId = "PGD000001";

    if (lastPengaduan) {
      const lastNumber = parseInt(
        lastPengaduan.id_pengaduan.replace("PGD", ""),
      );
      const nextNumber = lastNumber + 1;

      nextId = `PGD${String(nextNumber).padStart(6, "0")}`;
    }

    const newPengaduan = await prisma.pengaduan.create({
      data: {
        id_pengaduan: nextId,
        id_user: session.user.id_user,
        id_kategori: id_kategori,
        judul_laporan: judul_laporan,
        isi_laporan: isi_laporan,
        tgl_kejadian: new Date(tgl_kejadian),
        foto: foto || null,
        status: "Pending",
        is_deleted: 0,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Laporan pengaduan kamu berhasil dikirim!",
      data: newPengaduan,
    });
  } catch (error) {
    console.error("Prisma POST Pengaduan Error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal mengirim laporan pengaduan",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
