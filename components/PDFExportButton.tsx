'use client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TransactionPDFDocument } from './TransactionPDFDocument';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Loader2Icon } from 'lucide-react';

interface Props {
  transactions: never[];
  totalRevenue: string;
  range: '1-day' | '1-month' | '6-month';
  dateFrom: string;
  dateTo: string;
  fileName: string;
}

export function PDFExportButton({
  transactions,
  totalRevenue,
  range,
  dateFrom,
  dateTo,
  fileName,
}: Props) {
  return (
    <PDFDownloadLink
      document={
        <TransactionPDFDocument
          transactions={transactions}
          totalRevenue={totalRevenue}
          range={range}
          status="active"
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      }
      fileName={fileName}
    >
      {({ loading: pdfLoading }) => (
        <Button className="w-full h-11" disabled={pdfLoading}>
          {pdfLoading ? (
            <>
              <Loader2Icon className="size-4 mr-2 animate-spin" />
              Menyiapkan PDF...
            </>
          ) : (
            <>
              <DownloadIcon className="size-4 mr-2" />
              Unduh PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
