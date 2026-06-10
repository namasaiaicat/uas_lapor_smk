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
import {
  Calendar as CalendarIcon,
  Info,
  Proportions,
  Plus,
  Settings2,
  Pencil,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PengaduanStatus = "Pending" | "Proses" | "Ditolak" | "Selesai";

interface Kategori {
  id_kategori: string;
  nama_kategori: string;
  deskripsi?: string | null;
}

interface Pengaduan {
  id_pengaduan: string;
  tgl_kejadian: string;
  judul_laporan: string;
  isi_laporan: string;
  foto: string;
  status: PengaduanStatus;
  feedback_admin?: string | null;
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

const STATUS_OPTIONS: PengaduanStatus[] = [
  "Pending",
  "Proses",
  "Ditolak",
  "Selesai",
];

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

  const [pengaduans, setPengaduans] = useState<Pengaduan[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<{
    id: string;
    status: string;
    feedback_admin: string;
  } | null>(null);
  const [detailModal, setDetailModal] = useState<Pengaduan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [editKategori, setEditKategori] = useState<Kategori | null>(null);
  const [deleteKategoriTarget, setDeleteKategoriTarget] = useState<
    string | null
  >(null);
  const [kategoriForm, setKategoriForm] = useState({
    nama_kategori: "",
    deskripsi: "",
  });
  const [kategoriSubmitting, setKategoriSubmitting] = useState(false);
  const [filterKategori, setFilterKategori] = useState("all");

  const [form, setForm] = useState({
    id_kategori: "",
    judul_laporan: "",
    isi_laporan: "",
    tgl_kejadian: "",
    foto: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchKategori = useCallback(async () => {
    const res = await fetch("/api/kategori");
    const json = await res.json();
    if (json.success) {
      setKategoriList(json.data);
      setKategoris(json.data); // sync ke form siswa juga
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchKategori(), 0);
    return () => clearTimeout(timer);
  }, [fetchKategori]);

  const fetchPengaduan = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterKategori && filterKategori !== "all")
        params.append("id_kategori", filterKategori);
      const res = await fetch(`/api/pengaduan?${params.toString()}`);
      const json = await res.json();
      if (json.success) setPengaduans(json.data);
      else toast.error(json.message ?? "Gagal memuat data");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [search, filterKategori]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPengaduan(), 0);
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleKategoriSubmit = async () => {
    if (!kategoriForm.nama_kategori) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    setKategoriSubmitting(true);
    try {
      const method = editKategori ? "PUT" : "POST";
      const url = editKategori
        ? `/api/kategori/${editKategori.id_kategori}`
        : "/api/kategori";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kategoriForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setKategoriForm({ nama_kategori: "", deskripsi: "" });
        setEditKategori(null);
        fetchKategori();
      } else {
        toast.error(json.message ?? "Gagal menyimpan kategori");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setKategoriSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterKategori && filterKategori !== "all")
        params.append("id_kategori", filterKategori);

      const res = await fetch(`/api/pengaduan?${params.toString()}`);
      const json = await res.json();

      if (!json.success)
        return toast.error("Gagal mengambil data untuk export");

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Daftar Pengaduan", 14, 15);
      doc.setFontSize(10);
      doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [
          [
            "ID",
            "Judul Laporan",
            "Kategori",
            "Pelapor",
            "Tgl Kejadian",
            "Status",
          ],
        ],
        body: (json.data as Pengaduan[]).map((p) => [
          p.id_pengaduan,
          p.judul_laporan,
          p.kategori?.nama_kategori ?? "-",
          p.user?.nama_lengkap ?? "-",
          new Date(p.tgl_kejadian).toLocaleDateString("id-ID"),
          p.status,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`pengaduan-${Date.now()}.pdf`);
    } catch {
      toast.error("Gagal export PDF");
    }
  };

  const handleKategoriDelete = async () => {
    if (!deleteKategoriTarget) return;
    try {
      const res = await fetch(`/api/kategori/${deleteKategoriTarget}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchKategori();
      } else {
        toast.error(json.message ?? "Gagal menghapus kategori");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setDeleteKategoriTarget(null);
    }
  };

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

  const handleUpdateStatus = async (
    id: string,
    status: string,
    feedback_admin: string,
  ) => {
    try {
      const res = await fetch(`/api/pengaduan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback_admin }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setPengaduans((prev) =>
          prev.map((p) =>
            p.id_pengaduan === id
              ? { ...p, status: status as PengaduanStatus, feedback_admin }
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/pengaduan/${deleteTarget}`, {
        method: "PATCH",
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

  // ── Shared: form buat laporan ─────────────────────────────────────────────
  const CreateFormContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
    >
      <DialogHeader>
        <DialogTitle>Buat Laporan Baru</DialogTitle>
        <DialogDescription>
          Masukkan detail laporan pengaduan secara akurat.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup className="py-4">
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

        <Field>
          <Label htmlFor="tgl-add">Tanggal Kejadian</Label>
          <div className="mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="tgl-add"
                  variant="outline"
                  className={`w-full sm:h-12 h-10 px-3 text-left font-normal text-base justify-start gap-2 rounded-xl border-2 ${!form.tgl_kejadian && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="size-5 text-muted-foreground shrink-0" />
                  {form.tgl_kejadian ? (
                    new Date(form.tgl_kejadian).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
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
                        tgl_kejadian: date ? format(date, "yyyy-MM-dd") : "",
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
                          setForm((prev) => ({ ...prev, tgl_kejadian: "" }))
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
              setForm((prev) => ({ ...prev, judul_laporan: e.target.value }))
            }
            className="sm:h-12 h-10 text-base"
          />
        </Field>

        <Field>
          <Label htmlFor="isi-add">Isi Laporan Pengaduan</Label>
          <Textarea
            id="isi-add"
            placeholder="Ceritakan kronologi kejadian secara lengkap di sini..."
            value={form.isi_laporan}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isi_laporan: e.target.value }))
            }
            className="min-h-[120px] p-3"
          />
        </Field>

        <Field>
          <Label htmlFor="foto-add">Foto Bukti Laporan (Opsional)</Label>
          <div className="mt-2">
            {form.foto ? (
              <div>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-10 px-5 rounded-lg mb-2 text-sm sm:text-base font-medium shadow-md cursor-pointer hover:bg-red-600"
                  onClick={() => setForm((prev) => ({ ...prev, foto: "" }))}
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
                    <span className="font-semibold">Klik untuk unggah</span>{" "}
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
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Ukuran gambar terlalu besar! Maksimal 2MB.");
                      e.target.value = "";
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      setForm((prev) => ({
                        ...prev,
                        foto: reader.result as string,
                      }));
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
        <Button type="submit" className="text-lg p-5" disabled={submitting}>
          {submitting ? "Mengirim..." : "Kirim Laporan"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div>
      <SiteHeader header={[{ title: "Pelaporan" }]} />
      <div className="p-6 space-y-6">
        {/* ── Header ── */}
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

        {/* ── Search ── */}
        {/* ── Search + Filter ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari judul laporan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={filterKategori} onValueChange={setFilterKategori}>
            <SelectTrigger className="h-10 w-48 text-lg">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {kategoriList.map((k) => (
                <SelectItem
                  key={k.id_kategori}
                  value={k.id_kategori}
                  className="text-sm"
                >
                  {k.nama_kategori}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Button
              variant="outline"
              className="h-10 text-lg"
              onClick={() => setKategoriOpen(true)}
            >
              <Settings2 className="size-4 mr-2" />
              Kelola Kategori
            </Button>
          )}

          <Button
            variant="outline"
            className="hidden md:flex h-10 font-semibold text-base px-6"
            onClick={handleExportPDF}
          >
            <Download className="size-4 mr-2" /> Export PDF
          </Button>
        </div>

        {/* ── ADMIN: Tabel desktop ── */}
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
                        <Select
                          value={p.status}
                          onValueChange={(val) =>
                            setPendingUpdate({
                              id: p.id_pengaduan,
                              status: val,
                              feedback_admin: "",
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

        {/* ── ADMIN: Card mobile ── */}
        {isAdmin && (
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : pengaduans.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-14 text-muted-foreground">
                  <FileText className="w-10 h-10 mb-3 opacity-40" />
                  <p className="font-medium">Belum ada laporan masuk</p>
                </CardContent>
              </Card>
            ) : (
              pengaduans.map((p) => (
                <div
                  key={p.id_pengaduan}
                  className="rounded-xl border bg-card p-4 flex flex-col gap-3 odd:bg-muted/30"
                >
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
                  <div className="flex items-center gap-2 pt-1">
                    <Select
                      value={p.status}
                      onValueChange={(val) =>
                        setPendingUpdate({
                          id: p.id_pengaduan,
                          status: val,
                          feedback_admin: "",
                        })
                      }
                    >
                      <SelectTrigger className="h-10 text-sm flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="text-sm">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      onClick={() => setDetailModal(p)}
                    >
                      <Info className="size-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-destructive"
                      onClick={() => setDeleteTarget(p.id_pengaduan)}
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── SISWA: Tabel desktop ── */}
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
              <>
                {/* Desktop */}
                <div className="hidden md:block w-full overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4 w-70">
                          ID Pengaduan
                        </TableHead>
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
                      {pengaduans.map((p) => (
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
                            <div className="flex items-center justify-center">
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
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3">
                  {pengaduans.map((p) => (
                    <div
                      key={p.id_pengaduan}
                      className="rounded-xl border bg-card p-4 flex flex-col gap-3 odd:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-base truncate">
                            {p.judul_laporan}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {p.kategori.nama_kategori}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColor(p.status)}`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(p.tgl_kejadian)}
                      </p>
                      <p className="text-sm line-clamp-2 text-foreground/80">
                        {p.isi_laporan}
                      </p>
                      {p.feedback_admin && (
                        <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                          <p className="text-xs font-medium text-blue-700 mb-0.5">
                            Feedback Admin
                          </p>
                          <p className="text-sm text-blue-900 line-clamp-2">
                            {p.feedback_admin}
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="h-10 w-full"
                        onClick={() => setDetailModal(p)}
                      >
                        <Info className="size-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── FAB: Buat Laporan (Siswa, mobile) ── */}
        {!isAdmin && (
          <Button
            size="icon"
            className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-xl shadow-lg text-primary-foreground cursor-pointer bg-primary hover:bg-primary/90 z-30 transition-transform active:scale-95"
            aria-label="Tambah Laporan Mobile"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        )}

        {/* ── Modal: Detail ── */}
        <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pengaduan</DialogTitle>
              <DialogDescription>Teliti dengan saksama</DialogDescription>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
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
                      className={`text-sm px-3 py-0.5 rounded-full border font-medium ${statusColor(detailModal.status)}`}
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
                {detailModal.feedback_admin && (
                  <div>
                    <p className="text-lg text-muted-foreground mb-0.5">
                      Feedback Admin
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-md p-3">
                      {detailModal.feedback_admin}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Modal: Buat Laporan ── */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open)
              setForm({
                id_kategori: "",
                judul_laporan: "",
                isi_laporan: "",
                tgl_kejadian: "",
                foto: "",
              });
          }}
        >
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8">
            {CreateFormContent}
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
                akan dihapus dari sistem.
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

      {/* ── AlertDialog: Konfirmasi Update Status ── */}
      <AlertDialog
        open={pendingUpdate !== null}
        onOpenChange={(open) => !open && setPendingUpdate(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan Status</AlertDialogTitle>
            <AlertDialogDescription>
              Ubah status pengaduan menjadi{" "}
              <strong>{pendingUpdate?.status}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="feedback-admin">
              Feedback Admin{" "}
              <span className="text-muted-foreground font-normal">
                (Opsional)
              </span>
            </Label>
            <Textarea
              id="feedback-admin"
              placeholder="Tuliskan catatan atau feedback untuk pelapor..."
              className="min-h-[100px] text-lg"
              value={pendingUpdate?.feedback_admin ?? ""}
              onChange={(e) =>
                setPendingUpdate((prev) =>
                  prev ? { ...prev, feedback_admin: e.target.value } : prev,
                )
              }
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingUpdate) {
                  handleUpdateStatus(
                    pendingUpdate.id,
                    pendingUpdate.status,
                    pendingUpdate.feedback_admin,
                  );
                  setPendingUpdate(null);
                }
              }}
            >
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Modal: Kelola Kategori ── */}
      <Dialog
        open={kategoriOpen}
        onOpenChange={(open) => {
          setKategoriOpen(open);
          if (!open) {
            setEditKategori(null);
            setKategoriForm({ nama_kategori: "", deskripsi: "" });
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Kategori</DialogTitle>
            <DialogDescription>
              Tambah, edit, atau hapus kategori pengaduan.
            </DialogDescription>
          </DialogHeader>

          {/* Form tambah/edit */}
          <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
            <p className="font-medium text-sm">
              {editKategori
                ? `Edit: ${editKategori.nama_kategori}`
                : "Tambah Kategori Baru"}
            </p>
            <Field>
              <Label>Nama Kategori</Label>
              <Input
                placeholder="Contoh: Fasilitas Sekolah"
                value={kategoriForm.nama_kategori}
                onChange={(e) =>
                  setKategoriForm((prev) => ({
                    ...prev,
                    nama_kategori: e.target.value,
                  }))
                }
                className="h-10"
              />
            </Field>
            <Field>
              <Label>
                Deskripsi{" "}
                <span className="text-muted-foreground font-normal">
                  (Opsional)
                </span>
              </Label>
              <Textarea
                placeholder="Deskripsi singkat kategori..."
                value={kategoriForm.deskripsi}
                onChange={(e) =>
                  setKategoriForm((prev) => ({
                    ...prev,
                    deskripsi: e.target.value,
                  }))
                }
                className="min-h-[80px]"
              />
            </Field>
            <div className="flex gap-2 justify-end">
              {editKategori && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditKategori(null);
                    setKategoriForm({ nama_kategori: "", deskripsi: "" });
                  }}
                >
                  Batal Edit
                </Button>
              )}
              <Button
                onClick={handleKategoriSubmit}
                disabled={kategoriSubmitting}
              >
                {kategoriSubmitting
                  ? "Menyimpan..."
                  : editKategori
                    ? "Simpan Perubahan"
                    : "Tambah"}
              </Button>
            </div>
          </div>

          {/* Daftar kategori */}
          <div className="space-y-2 mt-2">
            {kategoriList.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 text-sm">
                Belum ada kategori.
              </p>
            ) : (
              kategoriList.map((k) => (
                <div
                  key={k.id_kategori}
                  className="flex items-center justify-between gap-2 rounded-lg border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {k.nama_kategori}
                    </p>
                    {k.deskripsi && (
                      <p className="text-xs text-muted-foreground truncate">
                        {k.deskripsi}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditKategori(k);
                        setKategoriForm({
                          nama_kategori: k.nama_kategori,
                          deskripsi: k.deskripsi ?? "",
                        });
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteKategoriTarget(k.id_kategori)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog: Konfirmasi Hapus Kategori ── */}
      <AlertDialog
        open={!!deleteKategoriTarget}
        onOpenChange={() => setDeleteKategoriTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori{" "}
              <span className="font-semibold">
                {
                  kategoriList.find(
                    (k) => k.id_kategori === deleteKategoriTarget,
                  )?.nama_kategori
                }
              </span>{" "}
              akan dihapus. Kategori yang masih dipakai laporan tidak bisa
              dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleKategoriDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
