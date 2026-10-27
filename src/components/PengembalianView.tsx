import React, { useState } from 'react';
import {
  CornerDownLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Peminjaman, KondisiBuku } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatTanggalIndo, formatRupiah, getDiffDays } from '../utils/dateUtils';
import { FineReceiptModal } from './FineReceiptModal';

interface PengembalianViewProps {
  initialSelectedLoanId?: string;
}

export const PengembalianView: React.FC<PengembalianViewProps> = ({
  initialSelectedLoanId,
}) => {
  const {
    peminjamanList,
    currentDate,
    pengaturan,
    returnBook,
    payFine,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    initialSelectedLoanId || ''
  );
  const [kondisi, setKondisi] = useState<KondisiBuku>('BAIK');
  const [isDendaPaid, setIsDendaPaid] = useState<boolean>(true);
  const [returnNotes, setReturnNotes] = useState('');
  const [receiptLoan, setReceiptLoan] = useState<Peminjaman | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Active loans available for return
  const activeLoans = peminjamanList.filter((p) => p.status !== 'DIKEMBALIKAN');

  // Returned loans history
  const returnedLoans = peminjamanList.filter((p) => p.status === 'DIKEMBALIKAN');

  // Currently selected loan object
  const currentLoan = activeLoans.find((p) => p.id === selectedLoanId);

  // Calculate live dynamic fine for selected loan
  let hariTerlambat = 0;
  let dendaTelat = 0;
  let dendaKondisi = 0;

  if (currentLoan) {
    const diff = getDiffDays(currentDate, currentLoan.tglJatuhTempo);
    if (diff < 0) {
      hariTerlambat = Math.abs(diff);
      dendaTelat = hariTerlambat * pengaturan.tarifDendaHarian;
    }

    if (kondisi === 'RUSAK') dendaKondisi = pengaturan.dendaRusak;
    else if (kondisi === 'HILANG') dendaKondisi = pengaturan.dendaHilang;
  }

  const grandTotalDenda = dendaTelat + dendaKondisi;

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLoan) return;

    const res = returnBook(currentLoan.id, kondisi, isDendaPaid, returnNotes);
    if (res.success) {
      setSuccessBanner(res.message);

      // If there is fine or paid, prepare receipt
      if (grandTotalDenda > 0) {
        setReceiptLoan({
          ...currentLoan,
          status: 'DIKEMBALIKAN',
          tglKembali: currentDate,
          kondisiBukuKembali: kondisi,
          hariTerlambat,
          tarifDendaPerHari: pengaturan.tarifDendaHarian,
          dendaKeterlambatan: dendaTelat,
          dendaKerusakan: dendaKondisi,
          totalDenda: grandTotalDenda,
          statusDenda: isDendaPaid ? 'LUNAS' : 'BELUM_LUNAS',
        });
      }

      setSelectedLoanId('');
      setReturnNotes('');
      setKondisi('BAIK');
      setIsDendaPaid(true);

      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  const handlePayDirectFine = (loanId: string) => {
    const res = payFine(loanId);
    if (res.success) {
      const loan = peminjamanList.find((p) => p.id === loanId);
      if (loan) {
        setReceiptLoan({
          ...loan,
          statusDenda: 'LUNAS',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CornerDownLeft className="w-5 h-5 text-amber-600" />
          <span>Pengembalian Buku &amp; Kalkulasi Denda Otomatis</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sistem otomatis mengalkulasi denda keterlambatan (Rp {pengaturan.tarifDendaHarian.toLocaleString('id-ID')}/hari) dan memulihkan stok buku di rak secara instan.
        </p>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          {receiptLoan && (
            <button
              onClick={() => setReceiptLoan(receiptLoan)}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Lihat Kuitansi Denda</span>
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Return Form Processor vs Active Loans Picker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Return Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Formulir Verifikasi Pengembalian</span>
            <span className="text-xs font-normal text-slate-500">
              Tgl Pengembalian: <strong>{formatTanggalIndo(currentDate)}</strong>
            </span>
          </h3>

          <form onSubmit={handleProcessReturn} className="space-y-4 text-xs">
            {/* Loan Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Transaksi Peminjaman yang Akan Dikembalikan:
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">-- Pilih Transaksi Aktif --</option>
                {activeLoans.map((l) => {
                  const diff = getDiffDays(currentDate, l.tglJatuhTempo);
                  return (
                    <option key={l.id} value={l.id}>
                      {l.kodeTransaksi} · {l.anggotaNama} ({l.anggotaNim}) — {l.bukuJudul}{' '}
                      {diff < 0 ? `[TERLAMBAT ${Math.abs(diff)} HARI]` : `[Tempo: ${l.tglJatuhTempo}]`}
                    </option>
                  );
                })}
              </select>
            </div>

            {currentLoan ? (
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Details Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Pemustaka:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{currentLoan.anggotaNama}</div>
                    <div className="text-[11px] text-slate-500 font-mono">NIS: {currentLoan.anggotaNim}</div>
                  </div>

                  <div>
                    <span className="text-slate-500">Buku:</span>
                    <div className="font-bold text-slate-900 mt-0.5 italic">{currentLoan.bukuJudul}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ISBN: {currentLoan.bukuIsbn}</div>
                  </div>

                  <div>
                    <span className="text-slate-500">Tanggal Pinjam:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {formatTanggalIndo(currentLoan.tglPinjam)}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500">Tanggal Jatuh Tempo:</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatTanggalIndo(currentLoan.tglJatuhTempo)}
                    </div>
                  </div>
                </div>

                {/* Overdue Calculation Banner */}
                <div
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    hariTerlambat > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {hariTerlambat > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-xs">
                        {hariTerlambat > 0
                          ? `Terlambat ${hariTerlambat} Hari`
                          : 'Tepat Waktu (Tidak Kena Denda Keterlambatan)'}
                      </div>
                      <div className="text-[11px] opacity-80">
                        {hariTerlambat > 0
                          ? `${hariTerlambat} hari × ${formatRupiah(pengaturan.tarifDendaHarian)}/hari = ${formatRupiah(dendaTelat)}`
                          : 'Pengembalian sebelum atau pada saat tanggal jatuh tempo.'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold">
                      {formatRupiah(dendaTelat)}
                    </span>
                  </div>
                </div>

                {/* Condition Check */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kondisi Fisik Buku Saat Dikembalikan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center transition-all ${
                        kondisi === 'BAIK'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="kondisi"
                        value="BAIK"
                        checked={kondisi === 'BAIK'}
                        onChange={() => setKondisi('BAIK')}
                        className="sr-only"
                      />
                      <span className="text-xs">Bagus / Utuh</span>
                      <span className="text-[10px] text-slate-500 font-normal">Denda: Rp 0</span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center transition-all ${
                        kondisi === 'RUSAK'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="kondisi"
                        value="RUSAK"
                        checked={kondisi === 'RUSAK'}
                        onChange={() => setKondisi('RUSAK')}
                        className="sr-only"
                      />
                      <span className="text-xs">Rusak / Robek</span>
                      <span className="text-[10px] text-amber-700 font-medium">
                        +{formatRupiah(pengaturan.dendaRusak)}
                      </span>
                    </label>

                    <label
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center transition-all ${
                        kondisi === 'HILANG'
                          ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="kondisi"
                        value="HILANG"
                        checked={kondisi === 'HILANG'}
                        onChange={() => setKondisi('HILANG')}
                        className="sr-only"
                      />
                      <span className="text-xs">Buku Hilang</span>
                      <span className="text-[10px] text-rose-700 font-medium">
                        +{formatRupiah(pengaturan.dendaHilang)}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Total Fine Summary Card */}
                {grandTotalDenda > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Total Denda yang Harus Dibayar:</span>
                      <span className="text-base font-extrabold text-rose-600 tabular-nums">
                        {formatRupiah(grandTotalDenda)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dendaPaid"
                        checked={isDendaPaid}
                        onChange={(e) => setIsDendaPaid(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="dendaPaid" className="text-xs font-semibold text-slate-800 cursor-pointer">
                        Denda langsung disetor tunai/QRIS di loket (Tandai Lunas)
                      </label>
                    </div>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Verifikasi Sirkulasi:
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Buku kembali dalam kondisi rapi"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLoanId('')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selesaikan Pengembalian</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Pilih salah satu transaksi peminjaman aktif dari daftar dropdown atau klik tombol "Kembalikan" pada tabel di sebelah kanan.
              </div>
            )}
          </form>
        </div>

        {/* Right: Quick Active Loans Browser (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Antrean Peminjaman Aktif ({activeLoans.length})
            </h3>
            <span className="text-[10px] text-slate-400">Klik untuk memproses</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {activeLoans.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Tidak ada buku yang sedang dipinjam saat ini.
              </div>
            ) : (
              activeLoans.map((loan) => {
                const diff = getDiffDays(currentDate, loan.tglJatuhTempo);
                const isOverdue = diff < 0;
                const isSelected = selectedLoanId === loan.id;

                return (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{loan.anggotaNama}</span>
                      {isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded tabular-nums">
                          Telat {Math.abs(diff)}h ({formatRupiah(loan.totalDenda)})
                        </span>
                      ) : diff === 0 ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          Hari Ini
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500">
                          H-{diff}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-700 italic line-clamp-1">{loan.bukuJudul}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>{loan.kodeTransaksi}</span>
                      <span>Tempo: {formatTanggalIndo(loan.tglJatuhTempo)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Returned History Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Pengembalian &amp; Penerimaan Denda</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total Selesai: <strong className="text-slate-900 tabular-nums">{returnedLoans.length}</strong> transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Pemustaka</th>
                <th className="py-3 px-4">Buku Dikembalikan</th>
                <th className="py-3 px-4">Tgl Kembali</th>
                <th className="py-3 px-4">Kondisi Fisik</th>
                <th className="py-3 px-4">Total Denda</th>
                <th className="py-3 px-4">Status Denda</th>
                <th className="py-3 px-4 text-right">Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returnedLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">
                    Belum ada data pengembalian buku tercatat.
                  </td>
                </tr>
              ) : (
                returnedLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {loan.kodeTransaksi}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{loan.anggotaNama}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NIS {loan.anggotaNim}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1 italic">
                        {loan.bukuJudul}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatTanggalIndo(loan.tglKembali)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        {loan.kondisiBukuKembali || 'BAIK'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(loan.totalDenda)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {loan.statusDenda === 'LUNAS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>LUNAS</span>
                        </span>
                      ) : loan.totalDenda > 0 ? (
                        <button
                          onClick={() => handlePayDirectFine(loan.id)}
                          className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded transition-colors"
                        >
                          Bayar Sekarang
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Tidak Ada</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setReceiptLoan(loan)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Kuitansi</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fine Receipt Modal */}
      {receiptLoan && (
        <FineReceiptModal
          loan={receiptLoan}
          onClose={() => setReceiptLoan(null)}
        />
      )}
    </div>
  );
};
