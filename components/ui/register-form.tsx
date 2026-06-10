"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nis_nip: "",
    nama_lengkap: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nis_nip ||
      !formData.nama_lengkap ||
      !formData.username ||
      !formData.password
    ) {
      toast.error("Semua kolom wajib diisi!");
      return;
    }

    try {
      setLoading(false);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mendaftarkan akun");
      }

      toast.success("Registrasi Berhasil! Silakan tunggu aktivasi dari Admin.");
      router.push("/login");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan internal";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <Image
              src="/logo-laporsmkdark.svg"
              alt="img-laporsmk"
              width={200}
              height={200}
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <h1 className="text-2xl font-bold">Daftar akun baru</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Isi kolom di bawah ini untuk membuat akun Siswa baru
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="nis_nip">NIS / NIP</FieldLabel>
          <Input
            id="nis_nip"
            name="nis_nip"
            type="text"
            placeholder="Contoh: 102455"
            maxLength={6}
            required
            value={formData.nis_nip}
            onChange={handleChange}
            disabled={loading}
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="nama_lengkap">Nama Lengkap</FieldLabel>
          <Input
            id="nama_lengkap"
            name="nama_lengkap"
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            maxLength={30}
            required
            value={formData.nama_lengkap}
            onChange={handleChange}
            disabled={loading}
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            maxLength={12}
            required
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="bg-background"
          />
        </Field>

        <Field>
          <Button
            className="text-lg p-5 w-full"
            type="submit"
            size="lg"
            disabled={loading}
          >
            {loading ? "Mendaftarkan..." : "Register"}
          </Button>
        </Field>
      </FieldGroup>

      <p className="text-sm text-center text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          className="underline text-primary hover:text-primary/90"
          href="/login"
        >
          Login disini
        </Link>
      </p>
    </form>
  );
}
