import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  ShoppingCart,
  CornerDownLeft,
  Coins,
  MessageCircle,
  Mail,
  ChevronRight,
  TrendingUp,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, Peminjaman } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatRupiah, formatTanggalIndo, getDiffDays } from '../utils/dateUtils';
import { NotificationModal } from './NotificationModal';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const {
    anggotaList,
    bukuList,
    peminjamanList,
    currentDate,
    sendBulkDueReminders,
  } = useLibrary();

  const [selectedLoanForNotif, setSelectedLoanForNotif] = useState<Peminjaman | null>(null);
  const [bulkSentNotice, setBulkSentNotice] = useState<string | null>(null);

  // Active statistics
  const activeMembersCount = anggotaList.filter((a) => a.status === 'AKTIF').length;
  const totalTitlesCount = bukuList.length;

  const activeLoans = peminjamanList.filter((p) => p.status !== 'DIKEMBALIKAN');
  const activeLoansCount = activeLoans.length;

  const returnedTodayCount = peminjamanList.filter(
    (p) => p.status === 'DIKEMBALIKAN' && p.tglKembali === currentDate
  ).length;

  const totalOutstandingFines = activeLoans.reduce((acc, curr) => acc + curr.totalDenda, 0);

  // Urgent attention loans (overdue or due within 2 days)
  const urgentLoans = activeLoans
    .filter((loan) => {
      const diff = getDiffDays(currentDate, loan.tglJatuhTempo);
      return diff <= 2;
    })
    .sort((a, b) => {
      const diffA = getDiffDays(currentDate, a.tglJatuhTempo);
      const diffB = getDiffDays(currentDate, b.tglJatuhTempo);
      return diffA - diffB; // Most overdue first
    });

  // Low stock books (available stock <= 1)
  const lowStockBooks = bukuList.filter((b) => b.stokTersedia <= 1);

  // Handle bulk reminder
  const handleBulkReminder = () => {
    const res = sendBulkDueReminders('WHATSAPP');
    setBulkSentNotice(res.message);
    setTimeout(() => setBulkSentNotice(null), 4000);
  };

  // Mock chart data representing recent days
  const chartDays = [
    { label: '20 Okt', date: '2026-10-20', count: 3, returns: 1 },
    { label: '21 Okt', date: '2026-10-21', count: 2, returns: 2 },
    { label: '22 Okt', date: '2026-10-22', count: 4, returns: 1 },
    { label: '23 Okt', date: '2026-10-23', count: 2, returns: 3 },
    { label: '24 Okt', date: '2026-10-24', count: activeLoansCount, returns: returnedTodayCount },
  ];
  const maxVal = Math.max(...chartDays.map((d) => Math.max(d.count, d.returns, 4)));

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Fast Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white border border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium mb-2 border border-blue-400/20">
              <Clock className="w-3.5 h-3.5" />
              <span>Sirkulasi Aktif · Kalender Sistem: {formatTanggalIndo(currentDate)}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Selamat Datang di SIMPERPUS Terpadu
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoring stok buku real-time, pencatatan otomatis masa pinjam, pengingat WhatsApp &amp; Email mendekati tenggat waktu, serta kalkulasi denda otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {urgentLoans.length > 0 && (
              <button
                onClick={handleBulkReminder}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors"
                title="Kirim pengingat serentak ke semua mahasiswa mendekati tenggat waktu"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pengingat Serentak ({urgentLoans.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('pinjam')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Peminjaman Baru</span>
            </button>
          </div>
        </div>

        {bulkSentNotice && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs rounded-lg flex items-center justify-between">
            <span>✓ {bulkSentNotice}</span>
            <button
              onClick={() => setActiveTab('monitoring')}
              className="text-xs underline hover:text-white"
            >
              Lihat Log Notifikasi →
            </button>
          </div>
        )}
      </div>

      {/* Top Stat Cards (Matching SIMPERPUS Screenshot 4 colored cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Card 1: Anggota Aktif (Cyan) */}
        <div
          onClick={() => setActiveTab('anggota')}
          className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-cyan-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Anggota Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
            {activeMembersCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-cyan-600">
            <span>Siswa SMP terdaftar</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Judul Buku (Coral/Red) */}
        <div
          onClick={() => setActiveTab('buku')}
          className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-rose-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Judul Buku
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalTitlesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-600">
            <span>Koleksi pustaka</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Peminjaman Hari Ini / Aktif (Green) */}
        <div
          onClick={() => setActiveTab('pinjam')}
          className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Peminjaman Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
            {activeLoansCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-600">
            <span>Buku sedang dipinjam</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Buku Kembali Hari Ini (Orange) */}
        <div
          onClick={() => setActiveTab('kembali')}
          className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Buku Kembali
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CornerDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums">
            {returnedTodayCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-600">
            <span>Kembali tgl ini</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 5: Denda Berjalan / Tertunggak (Indigo) */}
        <div
          onClick={() => setActiveTab('kembali')}
          className="col-span-2 lg:col-span-1 group p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Denda Berjalan
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xl md:text-2xl font-extrabold text-rose-600 tabular-nums truncate">
            {formatRupiah(totalOutstandingFines)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-indigo-600">
            <span>Denda belum lunas</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Chart & Urgent Deadlines) vs Right (Admin Profile & Low Stock Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Urgent Circulation Alerts (Prompt requirement!) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Monitoring Tenggat Waktu &amp; Pengingat Notifikasi
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('monitoring')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Lihat Semua ({urgentLoans.length}) →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {urgentLoans.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Semua peminjaman dalam status aman. Tidak ada buku yang mendekati jatuh tempo atau terlambat.
                </div>
              ) : (
                urgentLoans.slice(0, 4).map((loan) => {
                  const diff = getDiffDays(currentDate, loan.tglJatuhTempo);
                  const isOverdue = diff < 0;
                  const isToday = diff === 0;

                  return (
                    <div
                      key={loan.id}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {loan.anggotaNama}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">NIS {loan.anggotaNim}</span>
                          <span className="text-slate-400">·</span>

                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Terlambat {Math.abs(diff)} Hari · Denda {formatRupiah(loan.totalDenda)}
                            </span>
                          ) : isToday ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Jatuh Tempo Hari Ini
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                              H-{diff} ({formatTanggalIndo(loan.tglJatuhTempo)})
                            </span>
                          )}
                        </div>

                        <div className="text-slate-700 font-medium line-clamp-1 italic">
                          "{loan.bukuJudul}"
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Dipinjam: {formatTanggalIndo(loan.tglPinjam)} · WA: +{loan.anggotaNoHp}
                        </div>
                      </div>

                      {/* Direct Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedLoanForNotif(loan)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                          title="Kirim pengingat via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kirim WA</span>
                        </button>

                        <button
                          onClick={() => setSelectedLoanForNotif(loan)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold transition-colors"
                          title="Kirim email notifikasi resmi"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: Weekly Borrowing Chart (Matching Screenshot) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Tren Peminjaman &amp; Pengembalian Buku</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aktivitas sirkulasi 5 hari terakhir
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
                  <span className="text-slate-600">Dipinjam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-amber-500 rounded-xs"></span>
                  <span className="text-slate-600">Dikembalikan</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-56 w-full flex items-end gap-6 pt-6 pb-2 px-4 border-b border-slate-100">
              {chartDays.map((item, idx) => {
                const heightPinjam = Math.max(12, (item.count / maxVal) * 160);
                const heightKembali = Math.max(8, (item.returns / maxVal) * 160);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1.5 w-full justify-center">
                      {/* Bar Pinjam */}
                      <div
                        style={{ height: `${heightPinjam}px` }}
                        className="w-5 sm:w-8 bg-blue-600 hover:bg-blue-700 rounded-t transition-all relative flex justify-center"
                      >
                        <span className="absolute -top-5 text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                          {item.count}
                        </span>
                      </div>

                      {/* Bar Kembali */}
                      <div
                        style={{ height: `${heightKembali}px` }}
                        className="w-5 sm:w-8 bg-amber-500 hover:bg-amber-600 rounded-t transition-all relative flex justify-center"
                      >
                        <span className="absolute -top-5 text-[10px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                          {item.returns}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 font-medium mt-2">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Administrator Profile Card (Matching Screenshot) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 text-center bg-gradient-to-b from-blue-500/10 to-transparent border-b border-slate-100">
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/WhatsApp_Image_2026-10-24_at_17.03.54_c33a2f63.jpeg`}
                alt="Reynisa Setty Nurul Marwah"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full mx-auto object-cover object-top border-4 border-white shadow-lg ring-2 ring-blue-500/20"
              />
              <h4 className="text-base font-bold text-slate-900 mt-3">Reynisa Setty Nurul Marwah</h4>
              <p className="text-xs text-blue-600 font-semibold">Administrator Kepala Sirkulasi</p>
            </div>

            <div className="p-4 space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">IP Address:</span>
                <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  36.80.174.184
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Perangkat:</span>
                <span className="font-semibold text-slate-800">Komputer / Laptop</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Browser:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Chrome - 130.0.3683
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Sistem Operasi:</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  Linux Kernel 6.8
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Status Server:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Terhubung &amp; Sinkron
                </span>
              </div>
            </div>
          </div>

          {/* Low Stock Watchlist (Prompt requirement: Monitoring Stok Buku) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-600" />
                <span>Monitoring Stok Kritis</span>
              </h3>
              <button
                onClick={() => setActiveTab('buku')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Katalog →
              </button>
            </div>

            <div className="p-4 space-y-3">
              {lowStockBooks.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-2">
                  Semua stok buku dalam jumlah aman.
                </div>
              ) : (
                lowStockBooks.map((book) => (
                  <div
                    key={book.id}
                    className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 text-xs flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-bold text-slate-900 truncate">{book.judul}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Rak: <span className="font-medium text-slate-700">{book.rakNama}</span> · Kategori: {book.kategori}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-rose-600 font-extrabold text-xs">
                        Sisa {book.stokTersedia} eks
                      </div>
                      <div className="text-[10px] text-slate-400">
                        (Total: {book.stokTotal})
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {selectedLoanForNotif && (
        <NotificationModal
          loan={selectedLoanForNotif}
          onClose={() => setSelectedLoanForNotif(null)}
        />
      )}
    </div>
  );
};
