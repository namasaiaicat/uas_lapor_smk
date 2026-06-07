'use client';

import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  BarChart3,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface SummaryStats {
  dailyRevenue: number;
  dailyTrend: number;
  monthlyRevenue: number;
  totalRevenue: number;
  topProduct: string;
  topProductQty: number;
}

interface SectionCardsProps {
  stats: SummaryStats;
}

export function SectionCards({ stats }: SectionCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-2 px-4 lg:px-6">
      {/* Card 1: Laporan Harian */}
      <div className="rounded-xl border bg-card border-accent/40 p-4 md:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <Calendar className="size-5 md:size-8" />
            </div>
            <Badge
              variant={stats.dailyTrend >= 0 ? 'default' : 'destructive'}
              className="py-0.5 px-1.5 text-[10px] md:text-xs font-semibold gap-0.5"
            >
              {stats.dailyTrend >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {stats.dailyTrend >= 0 ? `+${stats.dailyTrend}%` : `${stats.dailyTrend}%`}
            </Badge>
          </div>
          <div>
            <p className="text-sm md:text-xl font-medium text-muted-foreground">Laporan Harian</p>
            <h3 className="text-base md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mt-1 truncate">
              {formatCurrency(stats.dailyRevenue)}
            </h3>
          </div>
        </div>
        <div className="text-[11px] md:text-sm text-muted-foreground mt-3 md:mt-4 border-t pt-2 border-accent/20">
          Bandingkan dengan kemarin
        </div>
      </div>

      {/* Card 2: Laporan Bulanan */}
      <div className="rounded-xl border bg-card border-accent/40 p-4 md:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <BarChart3 className="size-5 md:size-8" />
            </div>
            <Badge
              variant="outline"
              className="py-0.5 px-1.5 text-[10px] md:text-xs font-medium text-primary border-primary/30 bg-primary/5"
            >
              Bulan Ini
            </Badge>
          </div>
          <div>
            <p className="text-sm md:text-xl font-medium text-muted-foreground">Laporan Bulanan</p>
            <h3 className="text-base md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mt-1 truncate">
              {formatCurrency(stats.monthlyRevenue)}
            </h3>
          </div>
        </div>
        <div className="text-[11px] md:text-sm text-muted-foreground mt-3 md:mt-4 border-t pt-2 border-accent/20">
          Akumulasi omset berjalan
        </div>
      </div>

      {/* Card 3: Total Penjualan */}
      <div className="rounded-xl border bg-card border-accent/40 p-4 md:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <Wallet className="size-5 md:size-8" />
            </div>
            <Badge variant="secondary" className="py-0.5 px-1.5 text-[10px] md:text-xs font-mono">
              All-Time
            </Badge>
          </div>
          <div>
            <p className="text-sm md:text-xl font-medium text-muted-foreground">Total Penjualan</p>
            <h3 className="text-base md:text-2xl lg:text-3xl font-bold tracking-tight text-primary mt-1 truncate">
              {formatCurrency(stats.totalRevenue)}
            </h3>
          </div>
        </div>
        <div className="text-[11px] md:text-sm text-muted-foreground mt-3 md:mt-4 border-t pt-2 border-accent/20">
          Data yang sudah dihapus permanen tidak akan dihitung
        </div>
      </div>

      {/* Card 4: Produk Terlaris */}
      <div className="rounded-xl border bg-card border-accent/40 p-4 md:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 md:p-3 bg-primary/10 text-primary rounded-xl">
              <TrendingUp className="size-5 md:size-8" />
            </div>
            <Badge
              variant="secondary"
              className="py-0.5 px-1.5 text-[10px] md:text-xs font-semibold shrink-0"
            >
              {stats.topProductQty} Pcs
            </Badge>
          </div>
          <div>
            <p className="text-sm md:text-xl font-medium text-muted-foreground">Produk Terlaris</p>
            <h3
              className="text-base md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mt-1 truncate"
              title={stats.topProduct}
            >
              {stats.topProduct}
            </h3>
          </div>
        </div>
        <div className="text-[11px] md:text-sm text-muted-foreground mt-3 md:mt-4 border-t pt-2 border-accent/20">
          Kuantitas order tertinggi
        </div>
      </div>
    </div>
  );
}
