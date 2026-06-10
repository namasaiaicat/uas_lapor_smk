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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_lengkap, nis_nip, username, password } = body;

    if (!username || !password || !nama_lengkap || !nis_nip) {
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
