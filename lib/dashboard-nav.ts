export type DashboardNavItem = {
  title: string;
  url: string;
};

export function getDashboardNavItems(role: string | undefined): DashboardNavItem[] {
  const items: DashboardNavItem[] = [];

  if (role === 'admin' || role === 'owner' || role === 'kasir' || !role) {
    items.push({ title: 'Dashboard', url: '/dashboard' });
  }

  if (role === 'admin') {
    items.push(
      { title: 'Produk', url: '/produk' },
      { title: 'User', url: '/users' },
      { title: 'Laporan', url: '/laporan' },
      { title: 'Recycle Bin', url: '/recycle-bin' }
    );
  }

  if (role === 'kasir') {
    items.push({ title: 'Kasir', url: '/kasir' });
  }

  if (role === 'owner') {
    items.push({ title: 'Laporan', url: '/laporan' });
  }

  return items;
}
