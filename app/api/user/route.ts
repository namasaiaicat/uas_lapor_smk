import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { UserRole, Users } from "@prisma/client";
import bcrypt from "bcryptjs";

interface ApiResponse {
  success: boolean;
  data?: Users[];
  pagination?: {
    total: number;
    pages: number;
    currentPage: number;
  };
  message?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") || "10", 10) || 10;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // PASTIKAN: Menggunakan nama_lengkap, bukan name!
    const whereClause = search
      ? {
          OR: [
            { nama_lengkap: { contains: search } },
            { username: { contains: search } },
          ],
        }
      : {};

    // Ambil data dan hitung total secara bersamaan
    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip: skip,
        take: limit,
        where: whereClause,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.users.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total: totalUsers,
        pages: totalPages,
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Prisma GET Error Detail:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal Mengambil data dari server",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_lengkap, nis_nip, username, password, no_telp } = body;

    if (!username || !password || !nama_lengkap || !nis_nip || !no_telp) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Field Wajib Wajib Diisi!",
        },
        { status: 400 },
      );
    }

    const lastUser = await prisma.users.findFirst({
      orderBy: { id_user: "desc" },
    });

    let nextUserId = "USR001";
    if (lastUser) {
      const lastNumber = parseInt(lastUser.id_user.replace("USR", ""), 10);
      nextUserId = `USR${String(lastNumber + 1).padStart(3, "0")}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        id_user: nextUserId,
        nis_nip,
        nama_lengkap,
        username,
        password: hashedPassword,
        role: "siswa",
        is_active: 0,
        no_telp,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "User Berhasil Ditambahkan",
      data: [newUser],
    });
  } catch (error) {
    console.error("Prisma Error Create: ", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Error tidak diketahui",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
