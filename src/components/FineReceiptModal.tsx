import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Peminjaman } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatRupiah, formatTanggalIndo } from '../utils/dateUtils';

interface FineReceiptModalProps {
  loan: Peminjaman | null;
  onClose: () => void;
}

export const FineReceiptModal: React.FC<FineReceiptModalProps> = ({ loan, onClose }) => {
  const { pengaturan, currentDate } = useLibrary();

  if (!loan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Actions Header (hidden on print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Kuitansi Pembayaran Denda</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Cetak Kuitansi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 bg-white text-slate-800 font-mono text-xs space-y-4">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-900">
              {pengaturan.namaPerpustakaan}
            </h2>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              {pengaturan.alamatPerpustakaan}
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              Telp: {pengaturan.kontakPerpustakaan}
            </p>
            <div className="mt-2 text-xs font-bold text-slate-900 bg-slate-100 py-1 rounded">
              BUKTI PEMBAYARAN DENDA SIRKULASI
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Transaksi:</span>
              <span className="font-bold text-slate-900">{loan.kodeTransaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal Bayar:</span>
              <span>{formatTanggalIndo(loan.tglKembali || currentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Petugas Kasir:</span>
              <span>{loan.petugas || 'Reynisa Setty Nurul Marwah'}</span>
            </div>
            <div className="border-t border-slate-100 my-1"></div>
            <div className="flex justify-between">
              <span className="text-slate-500">NIS Siswa:</span>
              <span className="font-semibold">{loan.anggotaNim}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Siswa:</span>
              <span className="font-semibold truncate max-w-[200px]">{loan.anggotaNama}</span>
            </div>
            <div className="border-t border-slate-100 my-1"></div>
            <div>
              <div className="text-slate-500">Judul Buku:</div>
              <div className="font-semibold italic text-slate-900 mt-0.5">
                {loan.bukuJudul}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Masa Pinjam:</span>
              <span>{formatTanggalIndo(loan.tglPinjam)} s.d {formatTanggalIndo(loan.tglJatuhTempo)}</span>
            </div>
            <div className="flex justify-between">
              <span>Hari Terlambat:</span>
              <span>{loan.hariTerlambat} hari</span>
            </div>
            <div className="flex justify-between">
              <span>Tarif Denda Harian:</span>
              <span>{formatRupiah(loan.tarifDendaPerHari)} / hari</span>
            </div>
            <div className="flex justify-between">
              <span>Denda Keterlambatan:</span>
              <span>{formatRupiah(loan.dendaKeterlambatan)}</span>
            </div>
            {loan.dendaKerusakan > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Denda Kondisi ({loan.kondisiBukuKembali}):</span>
                <span>{formatRupiah(loan.dendaKerusakan)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL DIBAYAR:</span>
              <span>{formatRupiah(loan.totalDenda)}</span>
            </div>
          </div>

          {/* Paid Stamp */}
          <div className="flex items-center justify-center gap-2 py-2 border-2 border-emerald-600 rounded-lg text-emerald-700 font-bold tracking-widest text-sm bg-emerald-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>LUNAS DIVERIFIKASI</span>
          </div>

          {/* Footer note */}
          <div className="text-center text-[9px] text-slate-400 font-sans leading-tight">
            Simpan kuitansi ini sebagai bukti sah pengembalian dan pelunasan denda perpustakaan. Terima kasih atas kerja sama Anda.
          </div>
        </div>

        {/* Footer (hidden on print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
