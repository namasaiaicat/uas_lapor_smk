"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// 1. Konfigurasi warna chart disesuaikan dengan tema status aduan
const chartConfig = {
  pending: {
    label: "Pending",
    color: "#f59e0b", // Amber
  },
  proses: {
    label: "Diproses",
    color: "#a855f7", // Purple
  },
  selesai: {
    label: "Selesai",
    color: "#10b981", // Emerald
  },
} satisfies ChartConfig;

// 2. Ketatkan interface data yang diterima dari backend anti-any
interface ChartDataItem {
  date: string;
  Pending: number;
  Proses: number;
  Selesai: number;
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Mengambil data riil dari route baru pengaduan chart
  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/chart-stats");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setChartData(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat chart database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      setTimeRange("7d");
    });
  }, [isMobile]);

  // Memfilter data berdasarkan pilihan rentang hari
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return [];

    const referenceDate = new Date();
    let daysToSubtract = 90;

    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date();
    startDate.setDate(referenceDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [chartData, timeRange]);

  if (loading) {
    return <div className="h-[350px] rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <Card className="@container/card border-accent/40 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-base md:text-lg font-semibold">
            Grafik Tren Pengaduan
          </CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Visualisasi kuantitas laporan masuk berdasarkan status penanganan
            </span>
            <span className="@[540px]/card:hidden">
              Status laporan 90 hari terakhir
            </span>
          </CardDescription>
        </div>

        {/* Kontrol Filter Waktu */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 Bulan</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Hari</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Hari</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="flex w-32 @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="3 Bulan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">3 Bulan</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="7d">7 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.pending.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.pending.color}
                  stopOpacity={0.0}
                />
              </linearGradient>
              <linearGradient id="fillProses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.proses.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.proses.color}
                  stopOpacity={0.0}
                />
              </linearGradient>
              <linearGradient id="fillSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.selesai.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.selesai.color}
                  stopOpacity={0.0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted/40"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--muted-foreground))",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={
                <ChartTooltipContent
                  // Gunakan formatter bawaan Shadcn untuk baris data di dalam tooltip
                  formatter={(value, name) => (
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <span className="text-muted-foreground font-normal">
                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                          name}
                        :
                      </span>
                      {value} Laporan
                    </div>
                  )}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />

            {/* 3 Layer Area Grafik Berlapis secara Elegan */}
            <Area
              dataKey="Pending"
              type="monotone"
              fill="url(#fillPending)"
              stroke={chartConfig.pending.color}
              strokeWidth={2}
              stackId="1"
            />
            <Area
              dataKey="Proses"
              type="monotone"
              fill="url(#fillProses)"
              stroke={chartConfig.proses.color}
              strokeWidth={2}
              stackId="1"
            />
            <Area
              dataKey="Selesai"
              type="monotone"
              fill="url(#fillSelesai)"
              stroke={chartConfig.selesai.color}
              strokeWidth={2}
              stackId="1"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
