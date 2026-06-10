"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Pengaduan {
  id_pengaduan: string;
  judul_laporan: string;
  isi_laporan: string;
  tgl_kejadian: string;
  status: string;
  user?: { nama_lengkap: string };
  kategori?: { nama_kategori: string };
}

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [pengaduans, setPengaduans] = useState<Pengaduan[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });
        const res = await fetch(`/api/pengaduan?${params.toString()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setPengaduans(json.data);
      } catch (err) {
        console.error("Gagal fetch data aduan:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border font-semibold text-base px-4 py-4"
          >
            Pending
          </Badge>
        );
      case "Proses":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-700 border-purple-300 font-semibold text-base px-4 py-4"
          >
            Proses
          </Badge>
        );
      case "Selesai":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold text-base px-4 py-4"
          >
            Selesai
          </Badge>
        );
      case "Ditolak":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-300 font-semibold text-base px-4 py-4"
          >
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Badge lebih kecil khusus mobile card
  const getStatusBadgeMobile = (status: string) => {
    const map: Record<string, string> = {
      Pending: "bg-amber-100 text-amber-800 border-amber-200",
      Proses: "bg-purple-100 text-purple-700 border-purple-300",
      Selesai: "bg-emerald-100 text-emerald-700 border-emerald-300",
      Ditolak: "bg-red-100 text-red-700 border-red-300",
    };
    return (
      <span
        className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full border font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <SiteHeader
        header={[
          { title: isAdmin ? "Dashboard Admin" : "Pendataan Pelaporan" },
        ]}
      />
      <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
        <SectionCards />

        {isAdmin && (
          <div className="animate-in fade-in duration-300">
            <ChartAreaInteractive />
          </div>
        )}

        <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
          {/* ── Header card ── */}
          <div className="p-5 flex items-center justify-between gap-3">
            <Input
              placeholder="Cari judul laporan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
            <Link href="pengaduan">
              <Button className="h-10 border text-primary cursor-pointer bg-accent font-semibold text-base px-6">
                Lihat Detail
              </Button>
            </Link>
          </div>

          {/* ── Tabel desktop ── */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/40 border">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Judul Laporan</TableHead>
                  {isAdmin && <TableHead>Pelapor</TableHead>}
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tanggal Kejadian</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="h-24 text-center text-muted-foreground animate-pulse"
                    >
                      Memuat data pengaduan...
                    </TableCell>
                  </TableRow>
                ) : pengaduans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada data pengaduan ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  pengaduans.map((p) => (
                    <TableRow
                      key={p.id_pengaduan}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-semibold">
                        {p.id_pengaduan}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {p.judul_laporan}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>{p.user?.nama_lengkap || "-"}</TableCell>
                      )}
                      <TableCell>{p.kategori?.nama_kategori || "-"}</TableCell>
                      <TableCell>
                        {new Date(p.tgl_kejadian).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(p.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Card mobile ── */}
          <div className="md:hidden divide-y">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground animate-pulse">
                Memuat data pengaduan...
              </div>
            ) : pengaduans.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Tidak ada data pengaduan ditemukan.
              </div>
            ) : (
              pengaduans.map((p) => (
                <div
                  key={p.id_pengaduan}
                  className="p-4 flex flex-col gap-2 odd:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-base truncate">
                        {p.judul_laporan}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {p.id_pengaduan}
                      </p>
                    </div>
                    {getStatusBadgeMobile(p.status)}
                  </div>
                  {isAdmin && p.user?.nama_lengkap && (
                    <p className="text-sm text-muted-foreground">
                      Pelapor:{" "}
                      <span className="text-foreground font-medium">
                        {p.user.nama_lengkap}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{p.kategori?.nama_kategori || "-"}</span>
                    <span>·</span>
                    <span>
                      {new Date(p.tgl_kejadian).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
          >
            Sebelumnya
          </Button>
          <div className="text-sm font-medium">Halaman {page}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={pengaduans.length < limit || loading}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    </>
  );
}
