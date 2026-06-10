import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

export async function GET() {
  try {
    const kategoris = await prisma.kategori.findMany({
      orderBy: { nama_kategori: "asc" },
    });
    return NextResponse.json({ success: true, data: kategoris });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data kategori" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      nama_kategori?: string;
      deskripsi?: string;
    };
    const { nama_kategori, deskripsi } = body;

    if (!nama_kategori) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    // Generate ID
    const last = await prisma.kategori.findFirst({
      orderBy: { id_kategori: "desc" },
    });
    let nextId = "KTG01";
    if (last) {
      const num = parseInt(last.id_kategori.replace("KTG", ""), 10);
      nextId = `KTG${String(num + 1).padStart(2, "0")}`;
    }

    const kategori = await prisma.kategori.create({
      data: {
        id_kategori: nextId,
        nama_kategori,
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: kategori,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan kategori" },
      { status: 500 },
    );
  }
}
