"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Trash2,
  Loader2,
  FileText,
  Info,
  Proportions,
  Recycle,
  ArchiveRestore,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";

// ─── Types ────────────────────────────────────────────────────────────────────

type PengaduanStatus = "Pending" | "Proses" | "Ditolak" | "Selesai";

interface Pengaduan {
  id_pengaduan: string;
  tgl_kejadian: string;
  judul_laporan: string;
  isi_laporan: string;
  foto: string;
  status: PengaduanStatus;
  is_deleted: number;
  user: {
    nama_lengkap: string;
    nis_nip: string;
  };
  kategori: {
    nama_kategori: string;
  };
}

const statusColor = (status: PengaduanStatus): string => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Proses":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Ditolak":
      return "bg-red-100 text-red-800 border-red-200";
    case "Selesai":
      return "bg-green-100 text-green-800 border-green-200";
  }
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// ─── Component ────────────────────────────────────────────────────────────────

export default function PengaduanPage() {
  const [pengaduans, setPengaduans] = useState<Pengaduan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState<Pengaduan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

  // ── Fetch pengaduan ──────────────────────────────────────────────────────────

  const fetchPengaduan = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/pengaduan/recyclebin${params}`);
      const json = await res.json();
      if (json.success) setPengaduans(json.data);
      else toast.error(json.message ?? "Gagal memuat data");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPengaduan(), 0);
    return () => clearTimeout(timer);
  }, [fetchPengaduan]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/pengaduan/${deleteTarget}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setPengaduans((prev) =>
          prev.filter((p) => p.id_pengaduan !== deleteTarget),
        );
      } else {
        toast.error(json.message ?? "Gagal menghapus");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      const res = await fetch(`/api/pengaduan/${restoreTarget}`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setPengaduans((prev) =>
          prev.filter((p) => p.id_pengaduan !== restoreTarget),
        );
      } else {
        toast.error(json.message ?? "Gagal memulihkan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setRestoreTarget(null);
    }
  };
  return (
    <div>
      <SiteHeader header={[{ title: "Manajemen Penghapusan" }]} />
      <div className="p-6 space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-lg md:text-2xl font-semibold mb-2 flex items-center gap-3">
            <Proportions />
            Manajemen Penghapusan
          </h1>
          <p className="text-muted-foreground text-base mt-1">
            Kelola seluruh laporan pengaduan siswa
          </p>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari judul laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Tabel ── */}
        <div className="hidden md:block w-full overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4 w-70">ID Pengaduan</TableHead>
                <TableHead className="w-70">Pelapor</TableHead>
                <TableHead className="w-90">Judul</TableHead>
                <TableHead className="w-90">Kategori</TableHead>
                <TableHead className="w-90">Tgl Kejadian</TableHead>
                <TableHead className="w-100">Deskripsi</TableHead>
                <TableHead className="w-60">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : pengaduans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Tidak ada data pengaduan
                  </TableCell>
                </TableRow>
              ) : (
                pengaduans.map((p) => (
                  <TableRow key={p.id_pengaduan}>
                    <TableCell className="font-semibold text-base pl-4">
                      {p.id_pengaduan}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-base">
                        {p.user.nama_lengkap}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {p.user.nis_nip}
                      </div>
                    </TableCell>
                    <TableCell className="truncate font-medium text-base">
                      {p.judul_laporan}
                    </TableCell>
                    <TableCell className="text-base">
                      {p.kategori.nama_kategori}
                    </TableCell>
                    <TableCell className="text-base">
                      {formatDate(p.tgl_kejadian)}
                    </TableCell>
                    <TableCell className="truncate font-medium text-base">
                      {p.isi_laporan}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm px-2.5 py-0.5 rounded-full border font-medium ${statusColor(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDetailModal(p)}
                        >
                          <Info className="size-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600"
                          onClick={() => setRestoreTarget(p.id_pengaduan)} // ← bukan deleteTarget
                        >
                          <ArchiveRestore className="size-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(p.id_pengaduan)}
                        >
                          <Trash2 className="size-6" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* ── Card Mobile ── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : pengaduans.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-40" />
              <p className="font-medium">Tidak ada data pengaduan</p>
            </div>
          ) : (
            pengaduans.map((p) => (
              <div
                key={p.id_pengaduan}
                className="rounded-xl border bg-card p-4 flex flex-col gap-3 odd:bg-muted/30"
              >
                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-base truncate">
                      {p.judul_laporan}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.user.nama_lengkap} · {p.user.nis_nip}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColor(p.status)}`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span>{p.kategori.nama_kategori}</span>
                  <span>{formatDate(p.tgl_kejadian)}</span>
                </div>
                <p className="text-sm line-clamp-2 text-foreground/80">
                  {p.isi_laporan}
                </p>

                {/* Aksi */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="h-10 flex-1 text-sm"
                    onClick={() => setDetailModal(p)}
                  >
                    <Info className="size-4 mr-2" />
                    Detail
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-blue-500 hover:text-blue-600"
                    onClick={() => setRestoreTarget(p.id_pengaduan)}
                  >
                    <ArchiveRestore className="size-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(p.id_pengaduan)}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* ── Modal: Detail ── */}
        <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pengaduan</DialogTitle>
              <DialogDescription>
                Teliti dengan saksama sebelum diverifikasi
              </DialogDescription>
            </DialogHeader>
            {detailModal && (
              <div className="space-y-6 text-base">
                <div className="relative w-full h-[250px] md:h-[400px] rounded-xl overflow-hidden border bg-muted">
                  <Image
                    src={detailModal.foto}
                    alt="Detailed-Foto"
                    fill
                    sizes="(max-width: 768px) 100vw, 42rem"
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      ID Pengaduan
                    </p>
                    <p className="font-mono font-medium truncate">
                      {detailModal.id_pengaduan}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      Status
                    </p>
                    <span
                      className={`text-lg px-3 py-0.5 rounded-full border font-medium ${statusColor(detailModal.status)}`}
                    >
                      {detailModal.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      Pelapor
                    </p>
                    <p className="font-medium">
                      {detailModal.user.nama_lengkap}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      NIS / NIP
                    </p>
                    <p>{detailModal.user.nis_nip}</p>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      Kategori
                    </p>
                    <p>{detailModal.kategori.nama_kategori}</p>
                  </div>
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      Tgl Kejadian
                    </p>
                    <p>{formatDate(detailModal.tgl_kejadian)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-lg text-muted-foreground mb-0.5">
                    Judul Laporan
                  </p>
                  <p className="font-medium">{detailModal.judul_laporan}</p>
                </div>
                <div>
                  <p className="text-lg text-muted-foreground mb-0.5">
                    Isi Laporan
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-md p-3">
                    {detailModal.isi_laporan}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── AlertDialog: Konfirmasi Hapus ── */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
              <AlertDialogDescription>
                Laporan dengan ID{" "}
                <span className="font-mono font-semibold">{deleteTarget}</span>{" "}
                akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
          open={!!restoreTarget}
          onOpenChange={() => setRestoreTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Pulihkan Laporan?</AlertDialogTitle>
              <AlertDialogDescription>
                Laporan dengan ID{" "}
                <span className="font-mono font-semibold">{restoreTarget}</span>{" "}
                akan dipulihkan kembali ke sistem.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleRestore}
              >
                Pulihkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
