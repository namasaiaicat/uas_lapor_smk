import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("=== MIDDLEWARE LAGI JALAN DI URL: ===", req.nextUrl.pathname);
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/users") && role != "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/recycle-bin") && role != "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/kasir",
    "/kasir/:path*",
    "/produk",
    "/produk/:path*",
    "/laporan",
    "/laporan/:path*",
    "/users",
    "/users/:path*",
    "/recycle-bin", // ← tambah ini
    "/recycle-bin/:path*",
  ],
};
