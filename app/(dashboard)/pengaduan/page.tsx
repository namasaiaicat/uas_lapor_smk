"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Info, Proportions } from "lucide-react"; // Untuk ikon di tombol pemantik
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Plus, Trash2, Loader2, FileText } from "lucide-react";
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

interface Kategori {
  id_kategori: string;
  nama_kategori: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: PengaduanStatus[] = [
  "Pending",
  "Proses",
  "Ditolak",
  "Selesai",
];

const statusVariant = (
  status: PengaduanStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Pending":
      return "secondary";
    case "Proses":
      return "default";
    case "Ditolak":
      return "destructive";
    case "Selesai":
      return "outline";
  }
};

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
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "admin";

  // Data
  const [pengaduans, setPengaduans] = useState<Pengaduan[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [detailModal, setDetailModal] = useState<Pengaduan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Create form
  const [form, setForm] = useState({
    id_kategori: "",
    judul_laporan: "",
    isi_laporan: "",
    tgl_kejadian: "",
    foto: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch pengaduan ──────────────────────────────────────────────────────────

  const fetchPengaduan = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/pengaduan${params}`);
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
    const timer = setTimeout(() => {
      fetchPengaduan();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchPengaduan]);

  useEffect(() => {
    if (!isAdmin) {
      fetch("/api/kategori")
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setKategoris(j.data);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (
      !form.id_kategori ||
      !form.judul_laporan ||
      !form.isi_laporan ||
      !form.tgl_kejadian
    ) {
      toast.error("Semua kolom wajib diisi!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setCreateOpen(false);
        setForm({
          id_kategori: "",
          judul_laporan: "",
          isi_laporan: "",
          tgl_kejadian: "",
          foto: "",
        });
        fetchPengaduan();
      } else {
        toast.error(json.message ?? "Gagal mengirim laporan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/pengaduan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setPengaduans((prev) =>
          prev.map((p) =>
            p.id_pengaduan === id
              ? { ...p, status: status as PengaduanStatus }
              : p,
          ),
        );
      } else {
        toast.error(json.message ?? "Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, foto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

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

  return (
    <div className="">
      {/* Header */}
      <SiteHeader header={[{ title: "Pelaporan" }]} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold mb-2 flex items-center gap-3">
              <Proportions />
              {isAdmin ? "Manajemen Pengaduan" : "Pelaporan"}
            </h1>
            <p className="text-muted-foreground text-base mt-1">
              {isAdmin
                ? "Kelola seluruh laporan pengaduan siswa"
                : "Buat dan pantau laporan pengaduanmu"}
            </p>
          </div>
          {!isAdmin && (
            <Button
              className="hidden md:flex h-12 text-primary-foreground cursor-pointer bg-primary hover:bg-primary/90 font-semibold text-base px-6"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Laporan
            </Button>
          )}
        </div>

        {/* Search (admin only) */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Cari judul laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
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
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : pengaduans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Tidak ada data pengaduan
                    </TableCell>
                  </TableRow>
                ) : (
                  pengaduans.map((p) => (
                    <TableRow key={p.id_pengaduan}>
                      <TableCell className="font-semibold text-base">
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
                        <Select
                          value={p.status}
                          onValueChange={(val) =>
                            setPendingUpdate({
                              id: p.id_pengaduan,
                              status: val,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                className="text-base"
                              >
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
        )}

        {!isAdmin && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : pengaduans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-14 text-muted-foreground">
                  <FileText className="w-10 h-10 mb-3 opacity-40" />
                  <p className="font-medium">Belum ada laporan</p>
                  <p className="text-sm mt-1">
                    Klik &ldquo;Buat Laporan&rdquo; untuk membuat laporan baru
                  </p>
                </CardContent>
              </Card>
            ) : (
              // data pengaduan siswa
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
                      <TableHead className="text-center">
                        Lihat Detail
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : pengaduans.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          Tidak ada data pengaduan
                        </TableCell>
                      </TableRow>
                    ) : (
                      pengaduans.map((p) => (
                        <TableRow key={p.id_pengaduan}>
                          <TableCell className="font-semibold text-base">
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
                          <TableCell>{p.status}</TableCell>
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Detail Pengaduan</DialogTitle>
              <DialogDescription>
                Teliti dengan saksama sebelum di verifikasi
              </DialogDescription>
            </DialogHeader>
            {detailModal && (
              <div className="space-y-6 text-base justify-center">
                <div className="relative w-full max-w-2xl h-[250px] md:h-[400px] rounded-xl overflow-hidden border bg-muted">
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

        {/* ── Modal: Buat Laporan (Siswa) ── */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setForm({
                id_kategori: "",
                judul_laporan: "",
                isi_laporan: "",
                tgl_kejadian: "",
                foto: "",
              });
            }
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
            >
              <DialogHeader>
                <DialogTitle>Buat Laporan Baru</DialogTitle>
                <DialogDescription>
                  Masukkan detail laporan pengaduan, sertakan informasi kategori
                  dan tanggal kejadian secara akurat.
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="py-4">
                {/* Kategori Pengaduan */}
                <Field>
                  <Label htmlFor="kategori-add">Kategori Pengaduan</Label>
                  <Select
                    value={form.id_kategori}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, id_kategori: value }))
                    }
                  >
                    <SelectTrigger
                      id="kategori-add"
                      className="h-12 text-sm sm:text-lg w-full"
                    >
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoris.map((kat) => (
                        <SelectItem
                          key={kat.id_kategori}
                          value={kat.id_kategori}
                          className="text-sm sm:text-lg"
                        >
                          {kat.nama_kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Tanggal Kejadian */}
                <Field>
                  <Label htmlFor="tgl-add">Tanggal Kejadian</Label>
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="tgl-add"
                          variant="outline"
                          className={`w-full sm:h-12 h-10 px-3 text-left font-normal text-base justify-start gap-2 rounded-xl border-2 ${
                            !form.tgl_kejadian && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="size-5 text-muted-foreground shrink-0" />
                          {form.tgl_kejadian ? (
                            new Date(form.tgl_kejadian).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          ) : (
                            <span>Pilih tanggal kejadian</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-xl shadow-lg border"
                        align="start"
                      >
                        <div className="flex flex-col">
                          <Calendar
                            mode="single"
                            selected={
                              form.tgl_kejadian
                                ? new Date(form.tgl_kejadian)
                                : undefined
                            }
                            onSelect={(date) =>
                              setForm((prev) => ({
                                ...prev,
                                tgl_kejadian: date
                                  ? format(date, "yyyy-MM-dd")
                                  : "",
                              }))
                            }
                          />
                          {form.tgl_kejadian && (
                            <div className="p-2 border-t bg-muted/20">
                              <Button
                                type="button"
                                className="w-full h-9 text-sm rounded-lg"
                                variant="ghost"
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    tgl_kejadian: "",
                                  }))
                                }
                              >
                                Hapus Tanggal
                              </Button>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Field>

                <Field>
                  <Label htmlFor="judul-add">Judul Laporan</Label>
                  <Input
                    id="judul-add"
                    placeholder="Ketik judul singkat laporan..."
                    value={form.judul_laporan}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        judul_laporan: e.target.value,
                      }))
                    }
                    className="sm:h-12 h-10 text-base"
                  />
                </Field>

                {/* Isi Laporan */}
                <Field>
                  <Label htmlFor="isi-add">Isi Laporan Pengaduan</Label>
                  <Textarea
                    id="isi-add"
                    placeholder="Ceritakan kronologi kejadian secara lengkap di sini..."
                    value={form.isi_laporan}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isi_laporan: e.target.value,
                      }))
                    }
                    className="min-h-[120px] text-base p-3"
                  />
                </Field>
                <Field>
                  <Label htmlFor="foto-add">
                    Foto Bukti Laporan (Opsional)
                  </Label>
                  <div className="mt-2">
                    {form.foto ? (
                      <div className="">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="h-10 px-5 rounded-lg mb-2 text-sm sm:text-base font-medium shadow-md cursor-pointer hover:bg-red-600"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, foto: "" }))
                          }
                        >
                          Hapus Foto
                        </Button>
                        <div className="relative overflow-hidden rounded-xl border bg-muted shadow-sm">
                          <Image
                            src={form.foto}
                            alt="Preview Bukti Laporan"
                            className="h-auto w-full max-h-90 object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="foto-add"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-background hover:bg-muted/50 border-muted-foreground/20 transition-colors p-4 text-center"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-3 text-muted-foreground"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Klik untuk unggah
                            </span>{" "}
                            atau seret gambar ke sini
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            PNG, JPG, atau WEBP (Maks. 2MB)
                          </p>
                        </div>
                        <input
                          id="foto-add"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Validasi Ukuran File (2MB)
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error(
                                "Ukuran gambar terlalu besar! Maksimal 2MB.",
                              );
                              e.target.value = "";
                              return;
                            }

                            // Mengubah file ke base64 string murni
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setForm((prev) => ({
                                ...prev,
                                foto: reader.result as string,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </Field>
              </FieldGroup>

              <DialogFooter className="gap-3 flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="text-lg p-5"
                  onClick={() => setCreateOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-lg p-5"
                  disabled={submitting}
                >
                  {submitting ? "Mengirim..." : "Kirim Laporan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Alert: Konfirmasi Hapus ── */}
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
      </div>
      {/* alert untuk konfirmasi update status */}
      <AlertDialog
        open={pendingUpdate !== null}
        onOpenChange={(open) => !open && setPendingUpdate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah kamu yakin ingin mengubah status pengaduan ini menjadi{" "}
              <strong>{pendingUpdate?.status}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingUpdate) {
                  handleUpdateStatus(pendingUpdate.id, pendingUpdate.status);
                  setPendingUpdate(null); // Reset setelah sukses
                }
              }}
            >
              Yakin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
