import React, { useState } from 'react';
import {
  Menu,
  Calendar,
  FastForward,
  RotateCcw,
  Bell,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatTanggalIndo, getDiffDays, formatRupiah } from '../utils/dateUtils';

interface TopHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Utama', subtitle: 'Ringkasan sirkulasi, statistik stok, dan denda berjalan' },
  buku: { title: 'Katalog & Monitoring Stok', subtitle: 'Monitoring ketersediaan buku real-time per rak perpustakaan' },
  anggota: { title: 'Data Siswa & Pemustaka SMP', subtitle: 'Direktori siswa, nomor WhatsApp orang tua/siswa, dan riwayat peminjaman' },
  rak: { title: 'Lokasi & Penataan Rak', subtitle: 'Master data penempatan buku fisik per lantai dan zona' },
  kategori: { title: 'Kategori Koleksi Pustaka', subtitle: 'Klasifikasi keilmuan dan sub-bidang literatur' },
  pinjam: { title: 'Transaksi Peminjaman', subtitle: 'Pencatatan masa pinjam dan verifikasi kuota siswa SMP' },
  kembali: { title: 'Pengembalian & Denda', subtitle: 'Kalkulasi otomatis denda keterlambatan dan pemulihan stok' },
  monitoring: { title: 'Otomasi Notifikasi WA & Email', subtitle: 'Monitoring H-2, H-1, Hari H, dan pengiriman notifikasi pengingat' },
  laporan: { title: 'Laporan & Kuitansi Transaksi', subtitle: 'Rekapitulasi sirkulasi, penerimaan denda, dan audit stok' },
  pengaturan: { title: 'Pengaturan Sistem & Template Notifikasi', subtitle: 'Konfigurasi tarif denda per hari, durasi pinjam, dan template pesan' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const {
    currentDate,
    setCurrentDate,
    advanceDate,
    resetDate,
    peminjamanList,
  } = useLibrary();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Get notifications needing attention
  const urgentLoans = peminjamanList.filter((p) => {
    if (p.status === 'DIKEMBALIKAN') return false;
    const diff = getDiffDays(currentDate, p.tglJatuhTempo);
    return diff <= 2;
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Left: Mobile trigger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>SIMPERPUS</span>
              <span>/</span>
              <span className="text-slate-600 font-medium capitalize">{activeTab}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {TAB_TITLES[activeTab]?.title}
            </h1>
          </div>
        </div>

        {/* Right: Date Simulator Controller & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Simulated System Date Pill / Controller */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-medium">Kalender Sistem:</span>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="font-semibold text-slate-900 hover:text-blue-600 tabular-nums transition-colors underline decoration-dotted"
              title="Klik untuk memilih tanggal simulasi"
            >
              {formatTanggalIndo(currentDate)}
            </button>

            {/* Quick Fast-Forward buttons */}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => advanceDate(1)}
                className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors whitespace-nowrap"
                title="Maju 1 Hari (Simulasi H-1 atau keterlambatan)"
              >
                +1 Hari
              </button>
              <button
                onClick={() => advanceDate(3)}
                className="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded transition-colors whitespace-nowrap"
                title="Maju 3 Hari (Simulasi Kena Denda)"
              >
                +3 Hari
              </button>
              {currentDate !== '2026-10-24' && (
                <button
                  onClick={resetDate}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded transition-colors"
                  title="Kembalikan ke Tanggal Awal (24 Okt 2026)"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute right-24 top-14 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 text-xs w-64 animate-in fade-in slide-in-from-top-1">
              <div className="font-semibold text-slate-900 mb-2 flex items-center justify-between">
                <span>Pilih Tanggal Sistem</span>
                <span className="text-[10px] text-blue-600 font-normal">Simulasi Waktu</span>
              </div>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setCurrentDate(e.target.value);
                    setShowDatePicker(false);
                  }
                }}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 mb-2"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ubah tanggal untuk menguji perhitungan denda otomatis dan pemicu notifikasi jatuh tempo.
              </p>
            </div>
          )}

          {/* Quick Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Peringatan Sirkulasi"
            >
              <Bell className="w-5 h-5" />
              {urgentLoans.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center tabular-nums">
                  {urgentLoans.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-semibold text-slate-900 text-xs">Peringatan Sirkulasi Hari Ini</div>
                  <span className="text-[10px] text-amber-600 font-semibold tabular-nums">
                    {urgentLoans.length} Memerlukan Aksi
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {urgentLoans.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Tidak ada buku yang mendekati jatuh tempo atau terlambat saat ini.
                    </div>
                  ) : (
                    urgentLoans.map((loan) => {
                      const diff = getDiffDays(currentDate, loan.tglJatuhTempo);
                      const isOverdue = diff < 0;
                      return (
                        <div
                          key={loan.id}
                          className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setActiveTab('monitoring');
                            setShowNotifDropdown(false);
                          }}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                              {loan.anggotaNama}
                            </span>
                            {isOverdue ? (
                              <span className="text-[10px] font-bold text-rose-600 tabular-nums">
                                Terlambat {Math.abs(diff)}h ({formatRupiah(loan.totalDenda)})
                              </span>
                            ) : diff === 0 ? (
                              <span className="text-[10px] font-bold text-amber-600">
                                Hari Ini
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-500 tabular-nums">
                                H-{diff}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 line-clamp-1">
                            {loan.bukuJudul}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('monitoring');
                      setShowNotifDropdown(false);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Buka Panel Notifikasi WhatsApp & Email →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setActiveTab('pinjam')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pinjam Buku</span>
          </button>
        </div>
      </div>
    </header>
  );
};
