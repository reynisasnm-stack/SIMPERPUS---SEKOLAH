import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  Mail,
  Edit2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Anggota } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { formatRupiah, formatTanggalIndo } from '../utils/dateUtils';

export const DataAnggotaView: React.FC = () => {
  const { anggotaList, peminjamanList, addMember, updateMember } = useLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Anggota | null>(null);

  // Form states
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [prodi, setProdi] = useState('Kelas 7A');
  const [fakultas, setFakultas] = useState('Tingkat Menengah (SMP)');

  const filteredMembers = anggotaList.filter((m) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.nama.toLowerCase().includes(q) ||
      m.nim.toLowerCase().includes(q) ||
      m.prodi.toLowerCase().includes(q) ||
      m.noHp.includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setNim(`260${Math.floor(100 + Math.random() * 900)}`);
    setNama('');
    setEmail('');
    setNoHp('628');
    setProdi('Kelas 7A');
    setFakultas('Tingkat Menengah (SMP)');
    setShowAddModal(true);
  };

  const handleOpenEdit = (member: Anggota) => {
    setEditingMember(member);
    setNim(member.nim);
    setNama(member.nama);
    setEmail(member.email);
    setNoHp(member.noHp);
    setProdi(member.prodi);
    setFakultas(member.fakultas);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateMember(editingMember.id, {
        nim,
        nama,
        email,
        noHp,
        prodi,
        fakultas,
      });
    } else {
      addMember({
        nim,
        nama,
        email,
        noHp,
        prodi,
        fakultas,
        status: 'AKTIF',
        tglDaftar: new Date().toISOString().slice(0, 10),
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Data Siswa &amp; Anggota Perpustakaan SMP</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar siswa pemustaka SMP Negeri 1 Cilacap, nomor kontak orang tua/siswa, dan catatan sirkulasi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, NIS, kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Siswa Terdaftar: <strong className="text-slate-900 tabular-nums">{filteredMembers.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Kontak (WhatsApp Siswa/Wali &amp; Email)</th>
                <th className="py-3 px-4">Buku Sedang Dipinjam</th>
                <th className="py-3 px-4">Total Denda Disetor</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const activeLoansCount = peminjamanList.filter(
                  (p) => p.anggotaId === member.id && p.status !== 'DIKEMBALIKAN'
                ).length;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {member.nim}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{member.nama}</div>
                      <div className="text-[11px] text-slate-400">
                        Terdaftar: {formatTanggalIndo(member.tglDaftar)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{member.prodi}</div>
                      <div className="text-[11px] text-slate-400">{member.fakultas}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${member.noHp}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-emerald-700 hover:text-emerald-900 font-semibold"
                          title="Buka WhatsApp Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+{member.noHp}</span>
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                        {member.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold tabular-nums">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span className={activeLoansCount > 0 ? 'text-blue-700' : 'text-slate-400'}>
                          {activeLoansCount} buku
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {formatRupiah(member.totalDendaDibayar)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit Data Anggota"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingMember ? 'Edit Data Mahasiswa' : 'Pendaftaran Mahasiswa Pemustaka'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS Siswa:</label>
                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    placeholder="Contoh: 260101"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa:</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="Nama lengkap siswa"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Siswa / Orang Tua (Awali 62):
                </label>
                <input
                  type="text"
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="628123456789"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nomor ini digunakan untuk mengirimkan notifikasi pengingat pengembalian buku pelajaran (H-2, H-1, denda).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Siswa / Akun Belajar.id:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.siswa@smpn1cilacap.sch.id"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas Siswa:</label>
                  <input
                    type="text"
                    required
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                    placeholder="Contoh: Kelas 7A, 8B, 9C"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Sekolah:</label>
                  <input
                    type="text"
                    required
                    value={fakultas}
                    onChange={(e) => setFakultas(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
