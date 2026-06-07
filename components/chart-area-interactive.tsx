'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Penyesuaian nama label grafik yang merepresentasikan data kasir Anda
const chartConfig = {
  revenue: {
    label: 'Statistik',
  },
  desktop: {
    label: 'Pendapatan (Rp)',
    color: 'var(--primary)',
  },
  mobile: {
    label: 'Volume Produk (Pcs)',
    color: 'hsl(var(--chart-2))', // Berikan warna sekunder dari shadcn ui theme Anda
  },
} satisfies ChartConfig;

interface ChartDataItem {
  date: string;
  desktop: number;
  mobile: number;
  displayItems: number;
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');
  const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);

  // Mengambil data riil dari database
  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await fetch('/api/chart-stats');
        const json = await res.json();
        if (json.success) {
          setChartData(json.data);
        }
      } catch (err) {
        console.error('Gagal memuat chart database:', err);
      }
    };
    fetchChartData();
  }, []);

  React.useEffect(() => {
    queueMicrotask(() => {
      setTimeRange('7d');
    });
  }, [isMobile]);

  // Memfilter data berdasarkan pilihan dropdown/toggle secara dinamis dari hari ini
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return [];

    const referenceDate = new Date(); // Dinamis menggunakan hari ini
    let daysToSubtract = 90;

    if (timeRange === '30d') daysToSubtract = 30;
    else if (timeRange === '7d') daysToSubtract = 7;

    const startDate = new Date();
    startDate.setDate(referenceDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [chartData, timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Grafik Analisis Penjualan</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Visualisasi omset pendapatan dan volume produk terjual
          </span>
          <span className="@[540px]/card:hidden">Omset & volume penjualan</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 Bulan Terakhir</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Hari Terakhir</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Hari Terakhir</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih rentang waktu"
            >
              <SelectValue placeholder="3 Bulan Terakhir" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 Bulan Terakhir
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 Hari Terakhir
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 Hari Terakhir
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={{
                stroke: 'hsl(var(--muted-foreground))',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                  }}
                  formatter={(value, name, props) => {
                    // Custom formatting pada tooltip agar memunculkan rupiah asli & nominal qty asli
                    if (name === 'desktop') {
                      return (
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <span className="text-muted-foreground font-normal">Omset:</span>
                          {formatCurrency(Number(value))}
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <span className="text-muted-foreground font-normal">Terjual:</span>
                        {props.payload.displayItems} Pcs
                      </div>
                    );
                  }}
                  indicator="dot"
                />
              }
            />
            {/* Ubah stackId agar tidak menumpuk ke atas (bertumpuk merusak keaslian angka rupiah), melainkan overlay elegan */}
            <Area
              dataKey="mobile"
              type="monotone"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              strokeWidth={2}
            />
            <Area
              dataKey="desktop"
              type="monotone"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
