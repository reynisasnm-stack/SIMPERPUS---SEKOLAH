import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Repeat,
  CornerDownLeft,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab, Peminjaman } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatTanggalIndo, formatRupiah, addDays, getDiffDays } from '../utils/dateUtils';
import { NotificationModal } from './NotificationModal';

interface PeminjamanViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectReturnLoan?: (loanId: string) => void;
}

export const PeminjamanView: React.FC<PeminjamanViewProps> = ({
  setActiveTab,
  onSelectReturnLoan,
}) => {
  const {
    anggotaList,
    bukuList,
    peminjamanList,
    pengaturan,
    currentDate,
    addLoan,
    extendLoan,
  } = useLibrary();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnggotaId, setSelectedAnggotaId] = useState('');
  const [selectedBukuId, setSelectedBukuId] = useState('');
  const [tglPinjam, setTglPinjam] = useState(currentDate);
  const [tglJatuhTempo, setTglJatuhTempo] = useState(addDays(currentDate, pengaturan.durasiPinjamHari));
  const [catatan, setCatatan] = useState('');
  const [formFeedback, setFormFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [selectedLoanForNotif, setSelectedLoanForNotif] = useState<Peminjaman | null>(null);

  // Filter only active loans (not returned)
  const activeLoans = peminjamanList.filter((p) => p.status !== 'DIKEMBALIKAN');

  const filteredLoans = activeLoans.filter((loan) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      loan.anggotaNama.toLowerCase().includes(q) ||
      loan.anggotaNim.toLowerCase().includes(q) ||
      loan.bukuJudul.toLowerCase().includes(q) ||
      loan.kodeTransaksi.toLowerCase().includes(q)
    );
  });

  const handleOpenAddModal = () => {
    setSelectedAnggotaId(anggotaList[0]?.id || '');
    // Select first book with stock > 0
    const availBook = bukuList.find((b) => b.stokTersedia > 0);
    setSelectedBukuId(availBook?.id || bukuList[0]?.id || '');
    setTglPinjam(currentDate);
    setTglJatuhTempo(addDays(currentDate, pengaturan.durasiPinjamHari));
    setCatatan('');
    setFormFeedback(null);
    setShowAddModal(true);
  };

  const handleTglPinjamChange = (date: string) => {
    setTglPinjam(date);
    setTglJatuhTempo(addDays(date, pengaturan.durasiPinjamHari));
  };

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnggotaId || !selectedBukuId) {
      setFormFeedback({ type: 'error', text: 'Pilih anggota dan buku terlebih dahulu.' });
      return;
    }

    const res = addLoan({
      anggotaId: selectedAnggotaId,
      bukuId: selectedBukuId,
      tglPinjam,
      tglJatuhTempo,
      catatan,
    });

    if (res.success) {
      setFormFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        setShowAddModal(false);
      }, 1200);
    } else {
      setFormFeedback({ type: 'error', text: res.message });
    }
  };

  const handleExtend = (loanId: string) => {
    const res = extendLoan(loanId, pengaturan.durasiPinjamHari);
    if (!res.success) {
      alert(res.message);
    }
  };

  const selectedMemberObj = anggotaList.find((a) => a.id === selectedAnggotaId);
  const selectedMemberActiveLoans = selectedMemberObj
    ? activeLoans.filter((p) => p.anggotaId === selectedMemberObj.id).length
    : 0;

  const selectedBookObj = bukuList.find((b) => b.id === selectedBukuId);

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span>Sirkulasi Peminjaman Buku Aktif</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mencatat masa pinjam buku, memverifikasi ketersediaan stok, dan kuota pemustaka
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Peminjaman Baru</span>
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi, nama pemustaka, NIM, atau judul buku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Peminjaman Berjalan: <span className="font-bold text-slate-900 tabular-nums">{filteredLoans.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Pemustaka / Siswa</th>
                <th className="py-3 px-4">Buku Pelajaran &amp; Rak</th>
                <th className="py-3 px-4">Masa Pinjam</th>
                <th className="py-3 px-4">Status &amp; Denda</th>
                <th className="py-3 px-4">Perpanjangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ada peminjaman aktif yang cocok dengan pencarian.
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
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIS {loan.anggotaNim} · +{loan.anggotaNoHp}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-1 italic">
                          {loan.bukuJudul}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ISBN: {loan.bukuIsbn}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-500">
                          Pinjam: {formatTanggalIndo(loan.tglPinjam)}
                        </div>
                        <div className="font-semibold text-slate-900">
                          Tempo: {formatTanggalIndo(loan.tglJatuhTempo)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isOverdue ? (
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Terlambat {Math.abs(diff)} Hari
                            </span>
                            <div className="text-xs font-bold text-rose-600 mt-0.5 tabular-nums">
                              {formatRupiah(loan.totalDenda)}
                            </div>
                          </div>
                        ) : isToday ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Jatuh Tempo Hari Ini
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                            Sisa {diff} Hari
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-600 font-medium">
                          {loan.perpanjanganCount} / {pengaturan.maxPerpanjangan}x
                        </div>
                        {loan.perpanjanganCount < pengaturan.maxPerpanjangan && !isOverdue && (
                          <button
                            onClick={() => handleExtend(loan.id)}
                            className="mt-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Repeat className="w-3 h-3" />
                            <span>Perpanjang (+7 Hari)</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedLoanForNotif(loan)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors"
                            title="Kirim pengingat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (onSelectReturnLoan) {
                                onSelectReturnLoan(loan.id);
                              } else {
                                setActiveTab('kembali');
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Proses pengembalian buku dan kalkulasi denda"
                          >
                            <CornerDownLeft className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
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

      {/* Modal: Tambah Peminjaman Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">Input Transaksi Peminjaman Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLoan} className="p-6 space-y-4 text-xs">
              {/* Select Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Siswa / Anggota:
                </label>
                <select
                  value={selectedAnggotaId}
                  onChange={(e) => setSelectedAnggotaId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500"
                  required
                >
                  {anggotaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama} — NIS: {m.nim} ({m.prodi})
                    </option>
                  ))}
                </select>

                {selectedMemberObj && (
                  <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Kuota Peminjaman: <strong className="text-slate-800">{selectedMemberActiveLoans} / {pengaturan.maxPinjamBuku}</strong> buku
                    </span>
                    <span className="font-mono">WA: +{selectedMemberObj.noHp}</span>
                  </div>
                )}
              </div>

              {/* Select Book */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Buku Koleksi:
                </label>
                <select
                  value={selectedBukuId}
                  onChange={(e) => setSelectedBukuId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500"
                  required
                >
                  {bukuList.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.stokTersedia <= 0}
                    >
                      {b.judul} {b.stokTersedia <= 0 ? '(STOK HABIS)' : `[Tersedia: ${b.stokTersedia} eks]`}
                    </option>
                  ))}
                </select>

                {selectedBookObj && (
                  <div className="mt-1.5 p-2 bg-slate-50 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                    <span>
                      Lokasi: <strong>{selectedBookObj.rakNama}</strong> ({selectedBookObj.kategori})
                    </span>
                    <span className={selectedBookObj.stokTersedia > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      Stok Tersedia: {selectedBookObj.stokTersedia} / {selectedBookObj.stokTotal}
                    </span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pinjam:
                  </label>
                  <input
                    type="date"
                    value={tglPinjam}
                    onChange={(e) => handleTglPinjamChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Jatuh Tempo (+{pengaturan.durasiPinjamHari} hari):
                  </label>
                  <input
                    type="date"
                    value={tglJatuhTempo}
                    onChange={(e) => setTglJatuhTempo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold text-blue-900 bg-blue-50/50"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Peminjaman (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Keperluan penelitian skripsi bab 3"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {formFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    formFeedback.type === 'error'
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  {formFeedback.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  )}
                  <span>{formFeedback.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={selectedBookObj?.stokTersedia === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  Konfirmasi Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
