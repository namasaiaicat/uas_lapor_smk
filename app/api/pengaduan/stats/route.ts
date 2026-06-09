import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

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
    const baseWhere: Prisma.PengaduanWhereInput = { is_deleted: 0 };

    if (role === "siswa") {
      baseWhere.id_user = id_user;
    }

    const [totalAduan, totalPending, totalProses, totalSelesai] =
      await Promise.all([
        prisma.pengaduan.count({ where: baseWhere }),
        prisma.pengaduan.count({ where: { ...baseWhere, status: "Pending" } }),
        prisma.pengaduan.count({ where: { ...baseWhere, status: "Proses" } }),
        prisma.pengaduan.count({ where: { ...baseWhere, status: "Selesai" } }),
      ]);

    return NextResponse.json({
      success: true,
      data: { totalAduan, totalPending, totalProses, totalSelesai },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error" },
      { status: 500 },
    );
  }
}
