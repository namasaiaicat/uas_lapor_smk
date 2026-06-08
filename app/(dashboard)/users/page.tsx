"use client";
import React, { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Edit, PlusIcon, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface User {
  id_user: string;
  nis_nip: string;
  nama_lengkap: string;
  username: string;
  role: string;
}

interface FormData {
  nama_lengkap: string;
  nis_nip: string;
  username: string;
  password?: string;
  role: string;
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nama_lengkap: "",
    nis_nip: "",
    username: "",
    password: "",
    role: "siswa", // Default diubah ke siswa atau sesuai kebutuhan
  });

  const fetchUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/user?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      );
      const json = await res.json();

      if (json.success) {
        setUsers(json.data);
        setTotalPages(json.pagination.pages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(currentPage, searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      nama_lengkap: "",
      nis_nip: "",
      username: "",
      password: "",
      role: "siswa",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nama_lengkap ||
      !formData.nis_nip ||
      !formData.username ||
      !formData.role
    ) {
      toast.error("Field wajib diisi");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/user/${editingId}` : "/api/user";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message);
        setIsDialogOpen(false);
        resetForm();
        fetchUsers(currentPage);
      } else {
        toast.error(json.message || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Gagal menyimpan user");
    }
  };

  // PERBAIKAN: Memperbaiki typo objek bersarang dan pencocokan field
  const handleEdit = (user: User) => {
    setFormData({
      nama_lengkap: user.nama_lengkap,
      nis_nip: user.nis_nip,
      username: user.username,
      password: "", // Kosongkan password saat edit kecuali ingin diganti baru
      role: user.role,
    });
    setEditingId(user.id_user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_user: string) => {
    try {
      const res = await fetch(`/api/user/${id_user}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.success) {
        toast.success("User berhasil dihapus");
        fetchUsers(currentPage);
      } else {
        toast.error(json.message || "Gagal menghapus user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Gagal menghapus user");
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <>
      <SiteHeader header={[{ title: "Kelola User" }]} />
      <div className="p-4 md:p-6 relative min-h-screen pb-28 md:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl font-semibold mb-2 flex items-center gap-3">
              <UserIcon className="size-10 text-primary" />
              Kelola User
            </h1>
            <p className="text-muted-foreground text-2xl hidden md:block">
              Kelola data pengguna, hak akses, dan informasi akun secara
              terpusat.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="hidden md:flex h-16 text-primary-foreground cursor-pointer bg-primary hover:bg-primary/90 font-semibold text-xl px-6">
                <PlusIcon className="size-6 mr-2" /> Tambah User
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button
                size="icon"
                className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-xl shadow-lg text-primary-foreground cursor-pointer bg-primary hover:bg-primary/90 z-30 transition-transform active:scale-95"
                aria-label="Tambah User Mobile"
              >
                <PlusIcon className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-8">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Edit User" : "Tambah User"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingId
                      ? "Lakukan perubahan pada data user Anda di sini."
                      : "Masukkan detail user baru Anda di sini."}
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="py-4">
                  <Field>
                    <Label htmlFor="name-add">Nama Lengkap</Label>
                    <Input
                      id="name-add"
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleInputChange}
                      className="sm:h-12 h-10"
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="nis-nip-add">NIS / NIP</Label>
                    <Input
                      id="nis-nip-add"
                      name="nis_nip"
                      value={formData.nis_nip}
                      onChange={handleInputChange}
                      className="sm:h-12 h-10"
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="username-add">Username</Label>
                    <Input
                      id="username-add"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="sm:h-12 h-10"
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="password-add">Password</Label>
                    <Input
                      id="password-add"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="sm:h-12 h-10"
                      placeholder={
                        editingId ? "Kosongkan jika tidak diubah" : ""
                      }
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="role-add">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger
                        id="role-add"
                        className="h-12 text-sm sm:text-lg w-full"
                      >
                        <SelectValue placeholder="Pilih Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          className="text-sm sm:text-lg"
                          value="admin"
                        >
                          Admin
                        </SelectItem>
                        <SelectItem
                          className="text-sm sm:text-lg"
                          value="siswa"
                        >
                          Siswa
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <DialogFooter className="gap-3 flex-col-reverse sm:flex-row">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-lg p-5"
                    >
                      Batal
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="text-lg p-5">
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mb-6 max-w-md">
          <Input
            type="search"
            placeholder="Cari user..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-12 text-lg"
          />
        </div>
        <div className="w-full">
          <div className="md:hidden space-y-3">
            {loading ? (
              <p className="text-center py-10 text-muted-foreground text-lg">
                Memuat user...
              </p>
            ) : users.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-lg">
                Belum ada user.
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id_user}
                  className="rounded-xl border bg-card p-4 flex flex-col gap-3 odd:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-lg truncate">
                      {user.nama_lengkap}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      NIS/NIP: {user.nis_nip} | @{user.username}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-12 flex-1"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="size-5 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 w-12 shrink-0 px-0"
                        >
                          <Trash2Icon className="text-destructive size-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-xl">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ini akan menghapus Hak Akses
                            <strong className="block my-1">
                              Nama: {user.nama_lengkap} (@{user.username}),
                              Role: {user.role}
                            </strong>
                            secara permanen dari database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            variant="outline"
                            className="!text-lg p-5"
                          >
                            Batal
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              className="!text-lg p-5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(user.id_user)}
                            >
                              Hapus
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block w-full overflow-hidden rounded-xl border">
            <Table>
              <TableHeader className="bg-secondary/10">
                <TableRow>
                  <TableHead className="pl-4">ID User</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>NIS / NIP</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow className="odd:bg-muted/50" key={user.id_user}>
                    <TableCell className="pl-4 font-mono text-sm">
                      {user.id_user}
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.nama_lengkap}
                    </TableCell>
                    <TableCell>{user.nis_nip}</TableCell>
                    <TableCell>@{user.username}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="size-6" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="lg">
                              <Trash2Icon className="text-red-800 size-6" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                                <Trash2Icon />
                              </AlertDialogMedia>
                              <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ini akan menghapus Hak Akses
                                <strong className="block my-1">
                                  Nama: {user.nama_lengkap} (@{user.username}),
                                  Role: {user.role}
                                </strong>
                                secara permanen dari database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="!text-lg p-5"
                                variant="outline"
                              >
                                Batal
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  className="text-lg p-5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(user.id_user)}
                                >
                                  Hapus
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination className="mt-4 flex-wrap gap-1">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="text-lg"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                      className="cursor-pointer text-lg"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50 text-lg"
                      : "cursor-pointer text-lg"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
