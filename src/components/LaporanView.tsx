import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Receipt,
  Search,
  Filter,
} from 'lucide-react';
import { Peminjaman } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatTanggalIndo, formatRupiah } from '../utils/dateUtils';
import { FineReceiptModal } from './FineReceiptModal';

export const LaporanView: React.FC = () => {
  const { peminjamanList, bukuList, pengaturan } = useLibrary();

  const [reportType, setReportType] = useState<'sirkulasi' | 'denda' | 'stok'>('sirkulasi');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptLoan, setSelectedReceiptLoan] = useState<Peminjaman | null>(null);

  // Sirkulasi data
  const filteredLoans = peminjamanList.filter((loan) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      loan.anggotaNama.toLowerCase().includes(q) ||
      loan.anggotaNim.toLowerCase().includes(q) ||
      loan.bukuJudul.toLowerCase().includes(q) ||
      loan.kodeTransaksi.toLowerCase().includes(q)
    );
  });

  // Denda transactions
  const dendaTransactions = peminjamanList.filter((p) => p.totalDenda > 0);
  const totalDendaLunas = dendaTransactions
    .filter((p) => p.statusDenda === 'LUNAS')
    .reduce((acc, curr) => acc + curr.totalDenda, 0);

  const totalDendaTertunggak = dendaTransactions
    .filter((p) => p.statusDenda === 'BELUM_LUNAS')
    .reduce((acc, curr) => acc + curr.totalDenda, 0);

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'sirkulasi') {
      csvContent += 'No Transaksi,NIM,Nama Mahasiswa,Buku,Tgl Pinjam,Tgl Tempo,Tgl Kembali,Status,Total Denda\n';
      filteredLoans.forEach((l) => {
        csvContent += `"${l.kodeTransaksi}","${l.anggotaNim}","${l.anggotaNama}","${l.bukuJudul}","${l.tglPinjam}","${l.tglJatuhTempo}","${l.tglKembali || '-'}","${l.status}","${l.totalDenda}"\n`;
      });
    } else if (reportType === 'denda') {
      csvContent += 'No Transaksi,NIM,Nama Mahasiswa,Buku,Hari Terlambat,Tarif Harian,Denda Terlambat,Denda Kerusakan,Total Denda,Status Denda\n';
      dendaTransactions.forEach((l) => {
        csvContent += `"${l.kodeTransaksi}","${l.anggotaNim}","${l.anggotaNama}","${l.bukuJudul}","${l.hariTerlambat}","${l.tarifDendaPerHari}","${l.dendaKeterlambatan}","${l.dendaKerusakan}","${l.totalDenda}","${l.statusDenda}"\n`;
      });
    } else {
      csvContent += 'ISBN,Judul Buku,Pengarang,Penerbit,Tahun,Kategori,Lokasi Rak,Stok Total,Stok Dipinjam,Stok Tersedia\n';
      bukuList.forEach((b) => {
        csvContent += `"${b.isbn}","${b.judul}","${b.pengarang}","${b.penerbit}","${b.tahun}","${b.kategori}","${b.rakNama}","${b.stokTotal}","${b.stokDipinjam}","${b.stokTersedia}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_simperpus_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Pusat Laporan Sirkulasi &amp; Rekapitulasi Denda</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ekspor data rekapitulasi peminjaman, audit denda keterlambatan, dan ketersediaan stok
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Laporan</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 no-print">
        <button
          onClick={() => setReportType('sirkulasi')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            reportType === 'sirkulasi'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Peminjaman &amp; Pengembalian
        </button>

        <button
          onClick={() => setReportType('denda')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            reportType === 'denda'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Rekapitulasi Denda &amp; Keuangan
        </button>

        <button
          onClick={() => setReportType('stok')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            reportType === 'stok'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Laporan Stok &amp; Ketersediaan Buku
        </button>
      </div>

      {/* Denda Summary Strip (When denda tab active) */}
      {reportType === 'denda' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Denda Terkumpul (Lunas)
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono tabular-nums">
              {formatRupiah(totalDendaLunas)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Disetor di loket kasir sirkulasi</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Denda Tertunggak (Belum Bayar)
            </span>
            <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono tabular-nums">
              {formatRupiah(totalDendaTertunggak)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Dari peminjaman aktif &amp; jatuh tempo</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Jumlah Transaksi Kena Denda
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
              {dendaTransactions.length} Kasus
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Akibat keterlambatan / kondisi buku</p>
          </div>
        </div>
      )}

      {/* Printable Heading */}
      <div className="hidden print-only text-center mb-6">
        <h1 className="text-lg font-bold uppercase">
          {pengaturan.namaPerpustakaan.toUpperCase()}
        </h1>
        <p className="text-xs text-gray-500">
          {pengaturan.alamatPerpustakaan} · Laporan Resmi Sirkulasi &amp; Administrasi Denda Perpustakaan
        </p>
        <div className="border-b-2 border-black my-2"></div>
      </div>

      {/* Report Content Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {reportType === 'sirkulasi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Kode Transaksi</th>
                  <th className="py-3 px-4">Pemustaka / NIM</th>
                  <th className="py-3 px-4">Judul Koleksi</th>
                  <th className="py-3 px-4">Tgl Pinjam</th>
                  <th className="py-3 px-4">Tgl Jatuh Tempo</th>
                  <th className="py-3 px-4">Tgl Kembali</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Denda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {loan.kodeTransaksi}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{loan.anggotaNama}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NIM {loan.anggotaNim}</div>
                    </td>
                    <td className="py-3 px-4 italic max-w-xs truncate">
                      {loan.bukuJudul}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatTanggalIndo(loan.tglPinjam)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatTanggalIndo(loan.tglJatuhTempo)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {loan.tglKembali ? formatTanggalIndo(loan.tglKembali) : '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold">
                      {loan.status}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      {formatRupiah(loan.totalDenda)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'denda' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Pemustaka / NIM</th>
                  <th className="py-3 px-4">Judul Buku</th>
                  <th className="py-3 px-4">Hari Terlambat</th>
                  <th className="py-3 px-4">Denda Telat</th>
                  <th className="py-3 px-4">Denda Kerusakan</th>
                  <th className="py-3 px-4">Total Denda</th>
                  <th className="py-3 px-4">Status Denda</th>
                  <th className="py-3 px-4 text-right no-print">Kuitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dendaTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada data denda tercatat.
                    </td>
                  </tr>
                ) : (
                  dendaTransactions.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {loan.kodeTransaksi}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{loan.anggotaNama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">NIM {loan.anggotaNim}</div>
                      </td>
                      <td className="py-3 px-4 italic max-w-xs truncate">
                        {loan.bukuJudul}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        {loan.hariTerlambat} hari
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {formatRupiah(loan.dendaKeterlambatan)}
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {formatRupiah(loan.dendaKerusakan)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(loan.totalDenda)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            loan.statusDenda === 'LUNAS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {loan.statusDenda}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap no-print">
                        <button
                          onClick={() => setSelectedReceiptLoan(loan)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto"
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
        )}

        {reportType === 'stok' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Judul Buku</th>
                  <th className="py-3 px-4">Pengarang</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Rak</th>
                  <th className="py-3 px-4 text-center">Stok Total</th>
                  <th className="py-3 px-4 text-center">Dipinjam</th>
                  <th className="py-3 px-4 text-center">Stok Tersedia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bukuList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                      {b.isbn}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-sm">
                      {b.judul}
                    </td>
                    <td className="py-3 px-4">{b.pengarang}</td>
                    <td className="py-3 px-4">{b.kategori}</td>
                    <td className="py-3 px-4 font-mono font-medium">{b.rakNama}</td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{b.stokTotal}</td>
                    <td className="py-3 px-4 text-center font-mono text-blue-700 font-bold">{b.stokDipinjam}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`font-extrabold ${
                          b.stokTersedia <= 1 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {b.stokTersedia} eks
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Kuitansi */}
      {selectedReceiptLoan && (
        <FineReceiptModal
          loan={selectedReceiptLoan}
          onClose={() => setSelectedReceiptLoan(null)}
        />
      )}
    </div>
  );
};
