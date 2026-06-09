"use client";

import { FileText, Clock, RefreshCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  // Kosongkan parameter di sini
  const [stats, setStats] = useState({
    totalAduan: 0,
    totalPending: 0,
    totalProses: 0,
    totalSelesai: 0,
  });

  useEffect(() => {
    fetch("/api/pengaduan/stats")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setStats(res.data);
      });
  }, []);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-2">
      {/* Card 1: Total Pelaporan */}
      <Card className="flex flex-col justify-between border-accent/60 shadow-xs">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <FileText className="size-5 md:size-7" />
            </div>
          </div>
          <div className="space-y-1">
            <CardDescription className="text-xs md:text-xl font-medium text-muted-foreground mb-3 tracking-wide">
              Total Laporan
            </CardDescription>
            <CardTitle className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate">
              {stats.totalAduan}
              <span className="text-sm pl-2 md:text-lg font-medium text-muted-foreground">
                Laporan
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="text-[11px] md:text-lg text-muted-foreground pt-2 border-t border-accent/20">
          <span className="truncate">Semua laporan masuk</span>
        </CardFooter>
      </Card>

      {/* Card 2: Total Pending */}
      <Card className="flex flex-col justify-between border-accent/60 shadow-xs">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <Clock className="size-5 md:size-7" />
            </div>
          </div>
          <div className="space-y-1">
            <CardDescription className="text-xs md:text-xl font-medium text-muted-foreground mb-3 tracking-wide">
              Total Pending
            </CardDescription>
            <CardTitle className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate">
              {stats.totalPending}
              <span className="text-sm pl-2 md:text-lg font-medium text-muted-foreground">
                Laporan
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="text-[11px] md:text-lg text-muted-foreground pt-2 border-t border-accent/20">
          <span className="truncate">Menunggu Verifikasi</span>
        </CardFooter>
      </Card>

      {/* Card 3: Total Proses */}
      <Card className="flex flex-col justify-between border-accent/60 shadow-xs">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <RefreshCw className="size-5 md:size-7" />
            </div>
          </div>
          <div className="space-y-1">
            <CardDescription className="text-xs md:text-xl font-medium text-muted-foreground mb-3 tracking-wide">
              Total Proses
            </CardDescription>
            <CardTitle className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate">
              {stats.totalProses}
              <span className="text-sm pl-2 md:text-lg font-medium text-muted-foreground">
                Laporan
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="text-[11px] md:text-lg text-muted-foreground pt-2 border-t border-accent/20">
          <span className="truncate">Laporan sedang dalam Proses</span>
        </CardFooter>
      </Card>

      {/* Card 4: Total Selesai */}
      <Card className="flex flex-col justify-between border-accent/60 shadow-xs">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <CheckCircle className="size-5 md:size-7" />
            </div>
          </div>
          <div className="space-y-1">
            <CardDescription className="text-xs md:text-xl font-medium text-muted-foreground mb-3 tracking-wide">
              Total Selesai
            </CardDescription>
            <CardTitle className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate">
              {stats.totalSelesai}
              <span className="text-sm pl-2 md:text-lg font-medium text-muted-foreground">
                Laporan
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="text-[11px] md:text-lg text-muted-foreground pt-2 border-t border-accent/20">
          <span className="truncate">Laporan telah selesai</span>
        </CardFooter>
      </Card>
    </div>
  );
}
