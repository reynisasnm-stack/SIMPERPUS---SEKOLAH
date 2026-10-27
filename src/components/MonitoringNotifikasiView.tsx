import React, { useState } from 'react';
import {
  BellRing,
  MessageCircle,
  Mail,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
  History,
  Trash2,
  Filter,
} from 'lucide-react';
import { Peminjaman } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatTanggalIndo, formatRupiah, getDiffDays } from '../utils/dateUtils';
import { NotificationModal } from './NotificationModal';

export const MonitoringNotifikasiView: React.FC = () => {
  const {
    peminjamanList,
    notifikasiLogs,
    currentDate,
    sendBulkDueReminders,
    clearNotificationLogs,
    sendNotification,
  } = useLibrary();

  const [filterType, setFilterType] = useState<'ALL' | 'NEAR_DUE' | 'TODAY' | 'OVERDUE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Peminjaman | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'logs'>('queue');
  const [bulkAlert, setBulkAlert] = useState<string | null>(null);

  // Active loans
  const activeLoans = peminjamanList.filter((p) => p.status !== 'DIKEMBALIKAN');

  // Filtered loans based on status and search
  const filteredLoans = activeLoans.filter((loan) => {
    const diff = getDiffDays(currentDate, loan.tglJatuhTempo);

    if (filterType === 'NEAR_DUE' && (diff < 1 || diff > 2)) return false;
    if (filterType === 'TODAY' && diff !== 0) return false;
    if (filterType === 'OVERDUE' && diff >= 0) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = loan.anggotaNama.toLowerCase().includes(q);
      const matchNim = loan.anggotaNim.toLowerCase().includes(q);
      const matchBook = loan.bukuJudul.toLowerCase().includes(q);
      const matchTrx = loan.kodeTransaksi.toLowerCase().includes(q);
      return matchName || matchNim || matchBook || matchTrx;
    }
    return true;
  });

  // Count summaries
  const countNearDue = activeLoans.filter((p) => {
    const diff = getDiffDays(currentDate, p.tglJatuhTempo);
    return diff === 1 || diff === 2;
  }).length;

  const countToday = activeLoans.filter((p) => {
    return getDiffDays(currentDate, p.tglJatuhTempo) === 0;
  }).length;

  const countOverdue = activeLoans.filter((p) => {
    return getDiffDays(currentDate, p.tglJatuhTempo) < 0;
  }).length;

  const handleBulkSend = (channel: 'WHATSAPP' | 'EMAIL') => {
    const res = sendBulkDueReminders(channel);
    setBulkAlert(res.message);
    setTimeout(() => setBulkAlert(null), 5000);
  };

  const handleDirectWa = (loan: Peminjaman) => {
    const res = sendNotification(loan.id, 'WHATSAPP');
    if (res.waUrl) {
      window.open(res.waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the automated reminder flow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-xs font-semibold mb-2 border border-amber-200">
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span>Otomasi Pengingat Sirkulasi &amp; Notifikasi</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Notifikasi WhatsApp &amp; Email Siswa / Wali Murid
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl mt-1 leading-relaxed">
              Sistem memantau masa peminjaman buku pelajaran SMP setiap hari. Ketika siswa berada pada masa tenggat waktu (H-2, H-1, Hari H) atau telah melewati batas pengembalian, pengingat dapat langsung dikirimkan ke nomor WhatsApp siswa/orang tua atau akun email sekolah.
            </p>
          </div>

          {/* Bulk triggers */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => handleBulkSend('WHATSAPP')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim Broadcast WA ({countNearDue + countToday + countOverdue})</span>
            </button>

            <button
              onClick={() => handleBulkSend('EMAIL')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Kirim Email Massal</span>
            </button>
          </div>
        </div>

        {bulkAlert && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{bulkAlert}</span>
          </div>
        )}
      </div>

      {/* Main Tabs: Queue vs Logs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Antrean Peminjaman Aktif ({activeLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Log Terkirim ({notifikasiLogs.length})</span>
          </button>
        </div>

        {activeTab === 'logs' && notifikasiLogs.length > 0 && (
          <button
            onClick={clearNotificationLogs}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Riwayat Log</span>
          </button>
        )}
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            {/* Status pills / Segmented control */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  filterType === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua ({activeLoans.length})
              </button>

              <button
                onClick={() => setFilterType('NEAR_DUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === 'NEAR_DUE'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <span>Mendekati Tenggat (H-2 &amp; H-1)</span>
                <span className="font-bold tabular-nums">({countNearDue})</span>
              </button>

              <button
                onClick={() => setFilterType('TODAY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === 'TODAY'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <span>Jatuh Tempo Hari Ini</span>
                <span className="font-bold tabular-nums">({countToday})</span>
              </button>

              <button
                onClick={() => setFilterType('OVERDUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === 'OVERDUE'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <span>Terlambat &amp; Denda</span>
                <span className="font-bold tabular-nums">({countOverdue})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, judul buku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kode Transaksi</th>
                    <th className="py-3 px-4">Siswa / Pemustaka</th>
                    <th className="py-3 px-4">Buku Pelajaran Dipinjam</th>
                    <th className="py-3 px-4">Tgl Pinjam &amp; Tempo</th>
                    <th className="py-3 px-4">Status &amp; Denda</th>
                    <th className="py-3 px-4">Notifikasi Terakhir</th>
                    <th className="py-3 px-4 text-right">Aksi Notifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Tidak ada data peminjaman yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => {
                      const diff = getDiffDays(currentDate, loan.tglJatuhTempo);
                      const isOverdue = diff < 0;
                      const isToday = diff === 0;

                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                            {loan.kodeTransaksi}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{loan.anggotaNama}</div>
                            <div className="text-[11px] text-slate-400">
                              NIS {loan.anggotaNim} · WA: +{loan.anggotaNoHp}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-slate-800 line-clamp-1 italic">
                              {loan.bukuJudul}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ISBN: {loan.bukuIsbn}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-slate-600">
                              Pinjam: {formatTanggalIndo(loan.tglPinjam)}
                            </div>
                            <div className="font-semibold text-slate-900">
                              Tempo: {formatTanggalIndo(loan.tglJatuhTempo)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isOverdue ? (
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  Terlambat {Math.abs(diff)} Hari
                                </span>
                                <div className="text-xs font-bold text-rose-600 mt-1 tabular-nums">
                                  Denda: {formatRupiah(loan.totalDenda)}
                                </div>
                              </div>
                            ) : isToday ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                Jatuh Tempo Hari Ini
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                                Sisa {diff} Hari (H-{diff})
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {loan.terakhirNotifikasi ? (
                              <div className="text-[11px]">
                                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{loan.terakhirNotifikasi.via} ({loan.terakhirNotifikasi.tipe})</span>
                                </div>
                                <div className="text-slate-400 mt-0.5 font-mono text-[10px]">
                                  {loan.terakhirNotifikasi.waktu}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum dikirim
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleDirectWa(loan)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors"
                                title="Buka WhatsApp langsung (wa.me)"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setSelectedLoan(loan)}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-semibold transition-colors flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim Notif</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Logs Section */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu Terkirim</th>
                  <th className="py-3 px-4">Saluran</th>
                  <th className="py-3 px-4">Tujuan</th>
                  <th className="py-3 px-4">Tipe Notifikasi</th>
                  <th className="py-3 px-4">Ringkasan Pesan</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {notifikasiLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Belum ada riwayat pengiriman notifikasi tercatat.
                    </td>
                  </tr>
                ) : (
                  notifikasiLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                        {log.waktuKirim}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.channel === 'WHATSAPP'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.channel === 'WHATSAPP' ? (
                            <MessageCircle className="w-3 h-3" />
                          ) : (
                            <Mail className="w-3 h-3" />
                          )}
                          <span>{log.channel}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {log.anggotaNama} ({log.tujuan})
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">
                          {log.tipe}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {log.judulPesan}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                          "{log.isiPesan}"
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>TERKIRIM</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedLoan && (
        <NotificationModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </div>
  );
};
