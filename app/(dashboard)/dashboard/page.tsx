"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback } from "react";
import {
  type Transaction,
  type Pagination,
  type TransactionFilters,
} from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ChartAreaInteractive = dynamic(
  () =>
    import("@/components/chart-area-interactive").then(
      (m) => m.ChartAreaInteractive,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] rounded-xl bg-muted/30 animate-pulse" />
    ),
  },
);

const TransactionDataTable = dynamic(
  () => import("@/components/data-table").then((m) => m.TransactionDataTable),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-xl bg-muted/30 animate-pulse" />
    ),
  },
);
interface SummaryStats {
  dailyRevenue: number;
  dailyTrend: number;
  monthlyRevenue: number;
  totalRevenue: number;
  topProduct: string;
  topProductQty: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
}

export default function DashboardPage() {
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [stats, setStats] = useState<SummaryStats>({
    dailyRevenue: 0,
    dailyTrend: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    topProduct: "Memuat...",
    topProductQty: 0,
  });

  const [data, setData] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [filters, setFilters] = useState<TransactionFilters>({
    kasir: "",
    dateStart: "",
    dateEnd: "",
  });
  const [loading, setLoading] = useState(true);

  // ── Low stock ──
  useEffect(() => {
    let isMounted = true;
    fetch("/api/low-stock")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && isMounted) setLowStockItems(json.data);
      })
      .catch((err) => console.error("Gagal memuat low stock:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Stats awal (sekali load) ──
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/transactions?page=1&limit=1");
        const json = await res.json();
        if (json.success && json.stats) setStats(json.stats);
      } catch (error) {
        console.error("Gagal memuat statistik:", error);
      }
    };
    fetchStats();
  }, []);

  // ── Fetch transaksi ──
  const fetchTransactions = useCallback(
    async (page: number, limit: number, f: TransactionFilters) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (f.kasir) params.append("kasir", f.kasir);
        if (f.dateStart) params.append("dateStart", f.dateStart);
        if (f.dateEnd) params.append("dateEnd", f.dateEnd);

        const res = await fetch(`/api/transactions?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          setData(json.data);
          setPagination({
            total: json.pagination.total,
            page: json.pagination.page,
            limit: json.pagination.limit,
            pages: json.pagination.pages,
          });
          if (json.stats) setStats(json.stats);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ── Trigger fetch setiap page, limit, atau filter berubah ──
  useEffect(() => {
    const triggerFetch = async () => {
      await fetchTransactions(pagination.page, pagination.limit, filters);
    };
    triggerFetch();
  }, [pagination.page, pagination.limit, filters, fetchTransactions]);

  function handleFilterChange(newFilters: TransactionFilters) {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }));
  }

  function handlePageSizeChange(limit: number) {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }

  return (
    <>
      <SiteHeader header={[{ title: "Dashboard" }]} />
      <div className="flex flex-1 flex-col min-h-0">
        <div className="px-7">
          {lowStockItems.length > 0 && (
            <Alert
              variant="destructive"
              className="border-amber-600 bg-amber-100 text-amber-900 shadow-sm animate-in fade-in-50 duration-300"
            >
              <TriangleAlertIcon className="size-5 text-amber-600" />
              <div className="ml-2">
                <AlertTitle className="text-base font-bold">
                  Peringatan: Stok Produk Menipis!
                </AlertTitle>
                <AlertDescription className="text-sm text-amber-800/90 mt-0.5">
                  Beberapa produk berikut sudah berada di bawah batas minimum:{" "}
                  <span className="font-semibold underline decoration-amber-500/50">
                    {lowStockItems
                      .map((item) => `${item.name} (Sisa ${item.stock} Pcs)`)
                      .join(", ")}
                  </span>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-0 md:gap-6 md:py-6">
            <SectionCards stats={stats} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <TransactionDataTable
              data={data}
              pagination={pagination}
              filters={filters}
              onFilterChange={handleFilterChange}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
