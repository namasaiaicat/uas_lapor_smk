import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.kategori.findMany({
      orderBy: {
        nama_kategori: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Prisma Category Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kategori",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { nama_kategori, deskripsi } = await req.json();

  const lastKategori = await prisma.kategori.findFirst({
    orderBy: { id_kategori: "desc" },
  });

  let nextId = "KTG01";

  if (lastKategori) {
    const lastNumber = parseInt(lastKategori.id_kategori.replace("KTG", ""));
    const nextNumber = lastNumber + 1;

    nextId = `KTG${String(nextNumber).padStart(2, "0")}`;
  }

  const dataBaru = await prisma.kategori.create({
    data: {
      id_kategori: nextId,
      nama_kategori,
      deskripsi,
    },
  });

  return NextResponse.json(dataBaru);
}
