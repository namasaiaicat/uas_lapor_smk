// app/(dashboard)/dashboard/laporan/components/TransactionPDFDocument.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ExportTransaction } from '../app/(dashboard)/laporan/components/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type RangeLabel = '1-day' | '1-month' | '6-month';
type StatusLabel = 'active' | 'trash';

interface TransactionPDFDocumentProps {
  transactions: ExportTransaction[];
  totalRevenue: string;
  range: RangeLabel;
  status: StatusLabel;
  dateFrom: string;
  dateTo: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRangeLabel(range: RangeLabel): string {
  const map: Record<RangeLabel, string> = {
    '1-day': 'Hari Ini',
    '1-month': '1 Bulan Terakhir',
    '6-month': '6 Bulan Terakhir',
  };
  return map[range];
}

function getStatusLabel(status: StatusLabel): string {
  return status === 'active' ? 'Transaksi Aktif' : 'Recycle Bin (Trash)';
}

function getItemsString(tx: ExportTransaction): string {
  return tx.details.map((d) => `${d.product.name} x${d.quantity}`).join(', ');
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const COLOR = {
  primary: '#1a1a2e',
  accent: '#e8a045',
  light: '#f8f6f0',
  border: '#e0d8cc',
  muted: '#888580',
  white: '#ffffff',
  danger: '#c0392b',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
    backgroundColor: COLOR.white,
    color: COLOR.primary,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLOR.accent,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.primary,
    letterSpacing: 0.5,
  },
  storeTagline: {
    fontSize: 8,
    color: COLOR.muted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  printDate: {
    fontSize: 8,
    color: COLOR.muted,
  },
  reportTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.primary,
    marginTop: 2,
  },
  reportSubtitle: {
    fontSize: 8,
    color: COLOR.muted,
    marginTop: 2,
  },

  // ── Meta info ─────────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 14,
    backgroundColor: COLOR.light,
    borderRadius: 4,
    padding: 8,
  },
  metaItem: {
    flexDirection: 'column',
    gap: 2,
  },
  metaLabel: {
    fontSize: 7,
    color: COLOR.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.primary,
  },

  // ── Table ─────────────────────────────────────────────────────────────────
  tableWrapper: {
    borderWidth: 1,
    borderColor: COLOR.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLOR.primary,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: COLOR.white,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
  },
  tableRowEven: {
    backgroundColor: COLOR.light,
  },
  tableRowOdd: {
    backgroundColor: COLOR.white,
  },
  tableCell: {
    fontSize: 8.5,
    color: COLOR.primary,
  },
  tableCellMuted: {
    fontSize: 8,
    color: COLOR.muted,
  },

  // Kolom lebar
  colId: { width: '8%' },
  colDate: { width: '17%' },
  colCashier: { width: '14%' },
  colItems: { width: '41%' },
  colTotal: { width: '20%', textAlign: 'right' },

  // ── Summary footer ────────────────────────────────────────────────────────
  summaryWrapper: {
    marginTop: 14,
    borderTopWidth: 2,
    borderTopColor: COLOR.accent,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 8,
    color: COLOR.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryCount: {
    fontSize: 9,
    color: COLOR.primary,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryTotalLabel: {
    fontSize: 8,
    color: COLOR.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryTotal: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLOR.primary,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 9,
    color: COLOR.muted,
  },

  // ── Page footer ───────────────────────────────────────────────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    paddingTop: 6,
  },
  pageFooterText: {
    fontSize: 7.5,
    color: COLOR.muted,
  },
  pageFooterBold: {
    fontSize: 7.5,
    color: COLOR.muted,
    fontFamily: 'Helvetica-Bold',
  },
});

// ─── Component ───────────────────────────────────────────────────────────────

export function TransactionPDFDocument({
  transactions,
  totalRevenue,
  range,
  status,
  dateFrom,
  dateTo,
}: TransactionPDFDocumentProps) {
  const printDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateRangeStr = dateFrom && dateTo ? `${formatDate(dateFrom)} — ${formatDate(dateTo)}` : '-';

  return (
    <Document
      title={`Laporan Transaksi - ${getStatusLabel(status)} - ${getRangeLabel(range)}`}
      author="Sari Madu POS"
      subject="Laporan Transaksi"
      creator="Sari Madu POS"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.storeName}>Sari Madu POS</Text>
              <Text style={styles.storeTagline}>Sistem Point of Sale</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.printDate}>Dicetak: {printDate}</Text>
              <Text style={styles.reportTitle}>
                Laporan {getStatusLabel(status)} — {getRangeLabel(range)}
              </Text>
              <Text style={styles.reportSubtitle}>{dateRangeStr}</Text>
            </View>
          </View>
        </View>

        {/* ── Meta info ───────────────────────────────────────────────────── */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status Data</Text>
            <Text style={styles.metaValue}>{getStatusLabel(status)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Rentang Waktu</Text>
            <Text style={styles.metaValue}>{getRangeLabel(range)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Jumlah Transaksi</Text>
            <Text style={styles.metaValue}>{transactions.length} transaksi</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Total Pendapatan</Text>
            <Text style={styles.metaValue}>{formatCurrency(totalRevenue)}</Text>
          </View>
        </View>

        {/* ── Tabel ───────────────────────────────────────────────────────── */}
        <View style={styles.tableWrapper}>
          {/* Header tabel */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colId]}>ID</Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Tanggal</Text>
            <Text style={[styles.tableHeaderCell, styles.colCashier]}>Kasir</Text>
            <Text style={[styles.tableHeaderCell, styles.colItems]}>Item Produk</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          {/* Rows */}
          {transactions.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Tidak ada transaksi pada rentang waktu ini.</Text>
            </View>
          ) : (
            transactions.map((tx, index) => (
              <View
                key={tx.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                ]}
              >
                <Text style={[styles.tableCell, styles.colId]}>#{tx.id}</Text>
                <Text style={[styles.tableCellMuted, styles.colDate]}>
                  {formatDate(tx.created_at)}
                </Text>
                <Text style={[styles.tableCell, styles.colCashier]}>{tx.user?.name || '-'}</Text>
                <Text style={[styles.tableCellMuted, styles.colItems]}>{getItemsString(tx)}</Text>
                <Text style={[styles.tableCell, styles.colTotal, { fontFamily: 'Helvetica-Bold' }]}>
                  {formatCurrency(tx.total_price)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <View style={styles.summaryWrapper}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Ringkasan Laporan</Text>
            <Text style={styles.summaryCount}>
              {transactions.length} transaksi tercatat · {getRangeLabel(range)}
            </Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryTotalLabel}>Total Pendapatan Kumulatif</Text>
            <Text style={styles.summaryTotal}>{formatCurrency(totalRevenue)}</Text>
          </View>
        </View>

        {/* ── Page footer ─────────────────────────────────────────────────── */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>
            Sari Madu POS · Dokumen ini digenerate secara otomatis
          </Text>
          <Text
            style={styles.pageFooterBold}
            render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
