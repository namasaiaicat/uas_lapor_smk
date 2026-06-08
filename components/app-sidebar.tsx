"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  ShoppingCartIcon,
  Trash,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { getDashboardNavItems } from "@/lib/dashboard-nav";

type NavTitle = "Dashboard" | "Pengaduan" | "User" | "Laporan" | "Recycle Bin";
const SIDEBAR_ICONS: Record<NavTitle, React.ReactNode> = {
  Dashboard: <LayoutDashboardIcon />,
  Pengaduan: <ChartBarIcon />,
  User: <UsersIcon />,
  Laporan: <FolderIcon />,
  "Recycle Bin": <Trash />,
};

const SIDEBAR_LABELS: Record<NavTitle, string> = {
  Dashboard: "Dashboard",
  Pengaduan: "Pengaduan",
  User: "Kelola Pengguna",
  Laporan: "Lihat Laporan",
  "Recycle Bin": "Recycle Bin",
};

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const filteredNavMain = getDashboardNavItems(role).map((item) => {
    const titleKey = item.title as NavTitle;
    return {
      title: SIDEBAR_LABELS[titleKey] ?? item.title,
      url: item.url,
      icon: SIDEBAR_ICONS[titleKey] ?? <LayoutDashboardIcon />,
    };
  });

  const currentUser = {
    name: session?.user?.name || "User",
    email: session?.user?.username || "Guest",
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! items-center justify-center"
              size="lg"
            >
              <Link href="/dashboard">
                <Image
                  src="/logo-laporsmkdark.svg"
                  width={150}
                  height={150}
                  alt="logo-sarimadu"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
