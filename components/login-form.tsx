'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      toast.error('Username atau Password Salah!');
    } else {
      router.push('/dashboard');
    }
  }
  return (
    <form onSubmit={handleLogin} className={cn('flex flex-col gap-6', className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <Image
              src="/logo-sarimadu-photoroom.png"
              alt="img-sarimadu"
              width={200}
              height={200}
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <h1 className="text-2xl font-bold">Login ke akun anda</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Isi kolom di bawah ini untuk masuk ke akun Anda
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline"></a>
          </div>
          <Input id="password" type="password" name="password" required className="bg-background" />
        </Field>
        <Field>
          <Button className="text-lg p-5" type="submit" size="lg">
            Login
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
