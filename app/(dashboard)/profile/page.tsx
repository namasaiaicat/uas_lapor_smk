"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password_baru !== formData.konfirmasi_password) {
      toast.error("Konfirmasi password baru tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await res.json()) as { success: boolean; message?: string };

      if (!res.ok)
        throw new Error(data.message || "Gagal memperbarui password");

      toast.success(data.message || "Password berhasil diperbarui!");
      setFormData({
        password_lama: "",
        password_baru: "",
        konfirmasi_password: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak diketahui";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6">
      <h1 className="text-xl font-semibold mb-1">Ganti Password</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Perbarui password akun Anda secara berkala untuk menjaga keamanan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password_lama">Password Saat Ini</Label>
          <Input
            id="password_lama"
            name="password_lama"
            type="password"
            placeholder="••••••••"
            value={formData.password_lama}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_baru">Password Baru</Label>
          <Input
            id="password_baru"
            name="password_baru"
            type="password"
            placeholder="••••••••"
            value={formData.password_baru}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="konfirmasi_password">Konfirmasi Password Baru</Label>
          <Input
            id="konfirmasi_password"
            name="konfirmasi_password"
            type="password"
            placeholder="••••••••"
            value={formData.konfirmasi_password}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 hover:bg-black/80"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </form>
    </div>
  );
}
