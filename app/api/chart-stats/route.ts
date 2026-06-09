import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// 1. Definisikan tipe status yang valid sesuai Enum/String di DB kamu
type PengaduanStatus = "Pending" | "Proses" | "Selesai";

// 2. Interface untuk struktur data per hari
interface DailyStats {
  Pending: number;
  Proses: number;
  Selesai: number;
}

// 3. Interface hasil akhir yang dikirim ke Recharts di frontend
interface ChartDataResponse {
  date: string;
  Pending: number;
  Proses: number;
  Selesai: number;
}

export async function GET(request: NextRequest) {
  try {
    // Amankan Route
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Hitung mundur 90 hari
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const pengaduans = await prisma.pengaduan.findMany({
      where: {
        is_deleted: 0,
        created_at: {
          gte: ninetyDaysAgo,
        },
      },
      select: {
        created_at: true,
        status: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // 4. Wadah penampung dipetakan dengan tipe Record yang ketat
    const dailyDataMap: Record<string, DailyStats> = {};

    pengaduans.forEach((p) => {
      const dateKey = new Date(p.created_at).toISOString().split("T")[0];

      // Paksa type-casting aman dari string DB ke type PengaduanStatus
      const status = p.status as PengaduanStatus;

      if (!dailyDataMap[dateKey]) {
        dailyDataMap[dateKey] = { Pending: 0, Proses: 0, Selesai: 0 };
      }

      // Pastikan status yang masuk sesuai dengan key yang ada di DailyStats
      if (status === "Pending" || status === "Proses" || status === "Selesai") {
        dailyDataMap[dateKey][status] += 1;
      }
    });

    // 5. Array map yang menghasilkan tipe data ChartDataResponse[] secara otomatis
    const chartData: ChartDataResponse[] = Object.keys(dailyDataMap).map(
      (date) => ({
        date,
        Pending: dailyDataMap[date].Pending,
        Proses: dailyDataMap[date].Proses,
        Selesai: dailyDataMap[date].Selesai,
      }),
    );

    return NextResponse.json({ success: true, data: chartData });
  } catch (error) {
    console.error("Chart Data Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
