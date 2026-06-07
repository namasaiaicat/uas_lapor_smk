'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboardIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  ShoppingCartIcon,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardNavItems } from '@/lib/dashboard-nav';

const NAV_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboardIcon className="size-6 shrink-0" />,
  Produk: <ChartBarIcon className="size-6 shrink-0" />,
  User: <UsersIcon className="size-6 shrink-0" />,
  Laporan: <FolderIcon className="size-6 shrink-0" />,
  Kasir: <ShoppingCartIcon className="size-6 shrink-0" />,
  'Recycle Bin': <Trash className="size-6 shrink-0" />,
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const items = getDashboardNavItems(session?.user?.role);

  // if (items.length === 0) return null;
  // if (pathname === '/kasir' || pathname.startsWith('/kasir/')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi utama"
    >
      <div className="flex h-16 items-stretch justify-around px-1">
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                'flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl transition-colors',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                {NAV_ICONS[item.title] ?? <LayoutDashboardIcon className="size-6" />}
              </span>
              <span className="truncate w-full text-center leading-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
