import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, Prisma } from "@prisma/client";

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
    const { id } = await params;

    const body = await request.json();
    const { nama_lengkap, username, password, role, nis_nip } = body;

    if (!nama_lengkap || !username || !role || !nis_nip) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            "Data update tidak boleh ada yang kosong (nama_lengkap, username, role, nis_nip wajib diisi).",
        },
        { status: 400 },
      );
    }

    const updateData: Prisma.UsersUpdateInput = {
      nama_lengkap,
      username,
      role: role as UserRole,
      nis_nip,
    };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await prisma.users.update({
      where: { id_user: id },
      data: updateData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `User "${updatedUser.nama_lengkap}" berhasil diperbarui!`,
    });
  } catch (error) {
    console.error("Prisma Update Error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            "Gagal memperbarui user. Username atau NIS/NIP sudah terdaftar oleh pengguna lain!",
        },
        { status: 400 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal memperbarui data user pada server",
        error: errorMessage,
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
    const { id } = await params;

    await prisma.users.delete({
      where: { id_user: id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "User berhasil dihapus secara permanen!",
    });
  } catch (error) {
    console.error("Prisma Delete Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Gagal menghapus User dari database",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
