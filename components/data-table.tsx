'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { z } from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Columns3Icon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  EyeIcon,
  ReceiptIcon,
  XIcon,
  CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMemo } from 'react';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const decimalField = z.union([z.string(), z.number()]).transform(Number);

export const transactionDetailSchema = z.object({
  id: z.number(),
  transaction_id: z.number(),
  product_id: z.number(),
  quantity: z.number(),
  unit_price: decimalField,
  subtotal: decimalField,
  product: z.object({ name: z.string() }).nullable().optional(),
});

export const transactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  total_price: decimalField,
  amount_paid: decimalField,
  change_amount: decimalField,
  created_at: z.string(),
  user: z.object({ name: z.string() }).nullable().optional(),
  details: z.array(transactionDetailSchema).default([]),
});

export const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionDetail = z.infer<typeof transactionDetailSchema>;
export type Pagination = z.infer<typeof paginationSchema>;

export interface TransactionFilters {
  kasir: string;
  dateStart: string;
  dateEnd: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function TransactionDetailDrawer({ item }: { item: Transaction }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-12 md:size-8 text-muted-foreground hover:text-foreground"
        >
          <EyeIcon className="size-6" />
          <span className="sr-only">{item.id}</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle className="flex items-center gap-2">
            <ReceiptIcon className="size-4 text-muted-foreground" />
            Transaksi #{item.id}
          </DrawerTitle>
          <DrawerDescription>
            Dilayani oleh{' '}
            <span className="font-medium text-foreground">{item.user?.name ?? '—'}</span> pada{' '}
            {formatDate(item.created_at)}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="md:hidden space-y-3">
            {item.details.map((detail) => (
              <div
                key={detail.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{detail.product?.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {detail.quantity}</p>
                </div>
                <p className="font-semibold shrink-0">{formatCurrency(detail.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg hidden md:block border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="pl-4">Produk</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right pr-4">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      Tidak ada item.
                    </TableCell>
                  </TableRow>
                ) : (
                  item.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="pl-4 font-medium">
                        {detail.product?.name ?? '—'}
                      </TableCell>
                      <TableCell className="text-center">{detail.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(detail.unit_price)}
                      </TableCell>
                      <TableCell className="text-right pr-4 font-medium">
                        {formatCurrency(detail.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 rounded-lg bg-muted/40 px-4 py-3 text-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Belanja</span>
              <span className="font-semibold text-primary">{formatCurrency(item.total_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bayar</span>
              <span>{formatCurrency(item.amount_paid)}</span>
            </div>
            <Separator className="my-0.5" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kembalian</span>
              <span className="font-medium">{formatCurrency(item.change_amount)}</span>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Tutup</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'ID Transaksi',
    cell: ({ row }) => (
      <span className="font-mono text-lg font-semibold text-muted-foreground">
        #{row.original.id}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'created_at',
    header: 'Tanggal',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-lg font-semibold text-blue-700">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: 'kasir',
    accessorFn: (row) => row.user?.name ?? '—',
    header: 'Kasir',
    cell: ({ row }) => <span className="font-medium">{row.original.user?.name ?? '—'}</span>,
  },
  {
    accessorKey: 'total_price',
    header: () => <div className="w-full text-right">Total Belanja</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-primary">
        {formatCurrency(row.original.total_price)}
      </div>
    ),
  },
  {
    accessorKey: 'amount_paid',
    header: () => <div className="w-full text-right">Bayar</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">
        {formatCurrency(row.original.amount_paid)}
      </div>
    ),
  },
  {
    accessorKey: 'change_amount',
    header: () => <div className="w-full text-right">Kembalian</div>,
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.original.change_amount)}</div>
    ),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => <TransactionDetailDrawer item={row.original} />,
    enableHiding: false,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface TransactionDataTableProps {
  data: Transaction[];
  pagination: Pagination;
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export function TransactionDataTable({
  data,
  pagination,
  filters,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: TransactionDataTableProps) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns = useMemo(() => columns, []);
  const [kasirInput, setKasirInput] = React.useState(filters.kasir);

  React.useEffect(() => {
    setKasirInput(filters.kasir);
  }, [filters.kasir]);

  React.useEffect(() => {
    if (kasirInput === filters.kasir) return;
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, kasir: kasirInput });
    }, 400);
    return () => clearTimeout(timer);
  }, [kasirInput, filters, onFilterChange]);

  const hasActiveFilter =
    filters.kasir !== '' || filters.dateStart !== '' || filters.dateEnd !== '';

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.pages,
  });

  const canPreviousPage = pagination.page > 1;
  const canNextPage = pagination.page < pagination.pages;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 px-4 lg:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search kasir */}
          <Input
            placeholder="Cari kasir..."
            value={kasirInput}
            onChange={(e) => setKasirInput(e.target.value)}
            className="h-12 w-full min-w-0 sm:h-10 sm:w-44 text-lg"
          />

          {/* Filter: Tanggal Mulai */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-12 sm:h-10 w-full sm:w-auto justify-start text-left font-normal text-lg',
                  !filters.dateStart && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {filters.dateStart
                  ? format(new Date(filters.dateStart), 'dd MMM yyyy', { locale: id })
                  : 'Tanggal mulai'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col">
                <Calendar
                  mode="single"
                  selected={filters.dateStart ? new Date(filters.dateStart) : undefined}
                  onSelect={(date) =>
                    onFilterChange({
                      ...filters,
                      dateStart: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                  }
                />
                {filters.dateStart && (
                  <div className="p-2 border-t">
                    <Button
                      className="w-full h-7 text-xs"
                      variant="ghost"
                      onClick={() => onFilterChange({ ...filters, dateStart: '' })}
                    >
                      Hapus Tanggal
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Filter: Tanggal Akhir */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-12 sm:h-10 w-full sm:w-auto justify-start text-left font-normal text-lg',
                  !filters.dateEnd && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {filters.dateEnd
                  ? format(new Date(filters.dateEnd), 'dd MMM yyyy', { locale: id })
                  : 'Tanggal akhir'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col">
                <Calendar
                  mode="single"
                  selected={filters.dateEnd ? new Date(filters.dateEnd) : undefined}
                  onSelect={(date) =>
                    onFilterChange({
                      ...filters,
                      dateEnd: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                  }
                />
                {filters.dateEnd && (
                  <div className="p-2 border-t">
                    <Button
                      className="w-full h-7 text-xs"
                      variant="ghost"
                      onClick={() => onFilterChange({ ...filters, dateEnd: '' })}
                    >
                      Hapus Tanggal
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset filter */}
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground text-lg font-semibold"
              onClick={() => {
                setKasirInput('');
                onFilterChange({ kasir: '', dateStart: '', dateEnd: '' });
              }}
            >
              <XIcon className="size-5 mr-1" />
              Reset filter
            </Button>
          )}

          {/* Kolom toggle */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="text-lg">
                  <Columns3Icon data-icon="inline-start" />
                  Kolom
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {table
                  .getAllColumns()
                  .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="flex flex-col gap-3 px-4 md:hidden lg:px-6">
        {isLoading ? (
          <p className="rounded-lg border py-10 text-center text-muted-foreground">
            Memuat data transaksi...
          </p>
        ) : data.length === 0 ? (
          <p className="rounded-lg border py-10 text-center text-muted-foreground">
            {hasActiveFilter
              ? 'Tidak ada transaksi yang cocok dengan filter.'
              : 'Belum ada transaksi yang tercatat.'}
          </p>
        ) : (
          data.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-4 space-y-3 odd:bg-muted/30">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-lg font-semibold text-muted-foreground">
                    #{item.id}
                  </p>
                  <p className="whitespace-nowrap text-lg font-semibold text-blue-700">
                    {formatDate(item.created_at)}
                  </p>
                  <p className="font-medium mt-1">{item.user?.name ?? '—'}</p>
                </div>
                <p className="font-semibold text-primary text-lg shrink-0">
                  {formatCurrency(item.total_price)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Bayar</span>
                  <p>{formatCurrency(item.amount_paid)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kembali</span>
                  <p>{formatCurrency(item.change_amount)}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <TransactionDetailDrawer item={item} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Table (desktop) ── */}
      <div className="hidden md:block overflow-hidden rounded-lg border mx-4 lg:mx-6">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Memuat data transaksi...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilter
                    ? 'Tidak ada transaksi yang cocok dengan filter.'
                    : 'Belum ada transaksi yang tercatat.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
        <p className="flex-1 text-base sm:text-lg text-muted-foreground text-center sm:text-left">
          Total{' '}
          <span className="font-medium text-foreground">
            {pagination.total.toLocaleString('id-ID')}
          </span>{' '}
          transaksi
        </p>

        <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 md:flex">
            <Label htmlFor="rows-per-page" className="font-medium whitespace-nowrap">
              Baris per halaman
            </Label>
            <Select
              value={`${pagination.limit}`}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-fit items-center justify-center text-lg font-medium">
            Halaman {pagination.page} dari {pagination.pages}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden size-12 md:flex lg:size-10"
              onClick={() => onPageChange(1)}
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Halaman pertama</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-12 md:size-10"
              size="icon"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Halaman sebelumnya</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-12 md:size-10"
              size="icon"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!canNextPage}
            >
              <span className="sr-only">Halaman berikutnya</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-12 md:flex lg:size-10"
              size="icon"
              onClick={() => onPageChange(pagination.pages)}
              disabled={!canNextPage}
            >
              <span className="sr-only">Halaman terakhir</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
