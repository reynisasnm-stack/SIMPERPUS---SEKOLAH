import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Bookmark,
  BookOpen,
  Users,
  ShoppingCart,
  CornerDownLeft,
  Repeat,
  BellRing,
  FileText,
  Settings,
  Library,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { getDiffDays } from '../utils/dateUtils';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
}) => {
  const { peminjamanList, currentDate, bukuList, anggotaList } = useLibrary();

  // Calculate urgent notification count (H-2, H-1, Hari H, Overdue)
  const urgentCount = peminjamanList.filter((p) => {
    if (p.status === 'DIKEMBALIKAN') return false;
    const diff = getDiffDays(currentDate, p.tglJatuhTempo);
    return diff <= 2;
  }).length;

  const overdueCount = peminjamanList.filter(
    (p) => p.status === 'TERLAMBAT'
  ).length;

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1e293b] text-slate-200 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col border-r border-slate-700/60 select-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 bg-[#0f172a] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              SIMPERPUS
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Sistem Perpustakaan & Denda</div>
          </div>
        </div>
      </div>

      {/* User Profile Info Card (Matching Screenshot) */}
      <div className="p-4 mx-3 my-3 bg-[#0f172a]/70 rounded-xl border border-slate-700/50 flex items-center gap-3">
        <img
          src={`${import.meta.env.BASE_URL}assets/aistudio/WhatsApp_Image_2026-10-24_at_17.03.54_c33a2f63.jpeg`}
          alt="Reynisa Setty Nurul Marwah"
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full object-cover object-top border-2 border-blue-500/60 shadow-sm shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate">Reynisa Setty Nurul Marwah</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-xs text-emerald-400 font-medium">Administrator Online</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 text-xs scrollbar-thin">
        {/* DATA MASTER */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Data Master
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
                <span>Dashboard</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 text-white/70" />}
            </button>

            <button
              onClick={() => handleNavClick('buku')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'buku'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Katalog & Stok Buku</span>
              </div>
              <span className="text-xs text-slate-400 tabular-nums">
                {bukuList.length}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('anggota')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'anggota'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Data Siswa (Anggota)</span>
              </div>
              <span className="text-xs text-slate-400 tabular-nums">
                {anggotaList.length}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('rak')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'rak'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Lokasi Rak Buku</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('kategori')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'kategori'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Kategori Koleksi</span>
              </div>
            </button>
          </nav>
        </div>

        {/* TRANSAKSI */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Sirkulasi Pustaka
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('pinjam')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pinjam'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Peminjaman Baru</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('kembali')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'kembali'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CornerDownLeft className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Pengembalian & Denda</span>
              </div>
              {overdueCount > 0 && (
                <span className="text-[11px] font-bold text-rose-400 tabular-nums">
                  {overdueCount} Denda
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* NOTIFIKASI & MONITORING OTOMATIS */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Otomasi & Peringatan</span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('monitoring')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'monitoring'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BellRing className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Notifikasi WA & Email</span>
              </div>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-900 rounded tabular-nums">
                  {urgentCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* LAPORAN & PENGATURAN */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Laporan & Pengaturan
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('laporan')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'laporan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Laporan & Kuitansi</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('pengaturan')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'pengaturan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Konfigurasi Denda & WA</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-[#0f172a] text-[11px] text-slate-400 flex items-center justify-between">
        <div>SIMPERPUS Core v2.4</div>
        <div className="text-slate-400">Cilacap</div>
      </div>
    </aside>
  );
};
