import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  BellRing,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { formatRupiah } from '../utils/dateUtils';

export const PengaturanView: React.FC = () => {
  const { pengaturan, updatePengaturan, resetToDefaultData } = useLibrary();

  const [namaPerpustakaan, setNamaPerpustakaan] = useState(pengaturan.namaPerpustakaan);
  const [alamatPerpustakaan, setAlamatPerpustakaan] = useState(pengaturan.alamatPerpustakaan);
  const [kontakPerpustakaan, setKontakPerpustakaan] = useState(pengaturan.kontakPerpustakaan);
  const [durasiPinjamHari, setDurasiPinjamHari] = useState(pengaturan.durasiPinjamHari);
  const [tarifDendaHarian, setTarifDendaHarian] = useState(pengaturan.tarifDendaHarian);
  const [dendaRusak, setDendaRusak] = useState(pengaturan.dendaRusak);
  const [dendaHilang, setDendaHilang] = useState(pengaturan.dendaHilang);
  const [maxPinjamBuku, setMaxPinjamBuku] = useState(pengaturan.maxPinjamBuku);
  const [maxPerpanjangan, setMaxPerpanjangan] = useState(pengaturan.maxPerpanjangan);
  const [templateWaReminder, setTemplateWaReminder] = useState(pengaturan.templateWaReminder);
  const [templateEmailReminder, setTemplateEmailReminder] = useState(pengaturan.templateEmailReminder);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePengaturan({
      namaPerpustakaan,
      alamatPerpustakaan,
      kontakPerpustakaan,
      durasiPinjamHari: Number(durasiPinjamHari),
      tarifDendaHarian: Number(tarifDendaHarian),
      dendaRusak: Number(dendaRusak),
      dendaHilang: Number(dendaHilang),
      maxPinjamBuku: Number(maxPinjamBuku),
      maxPerpanjangan: Number(maxPerpanjangan),
      templateWaReminder,
      templateEmailReminder,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data simulasi ke data awal contoh?')) {
      resetToDefaultData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Konfigurasi Sistem Sirkulasi &amp; Denda</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan tarif denda keterlambatan per hari, batas pinjaman, dan template notifikasi WhatsApp/Email
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Data Awal Demo</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Aturan Denda & Batas Sirkulasi */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Coins className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Kebijakan Peminjaman &amp; Denda Keterlambatan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tarif Denda Harian (Keterlambatan):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={tarifDendaHarian}
                  onChange={(e) => setTarifDendaHarian(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Dihitung otomatis per hari telat: {formatRupiah(tarifDendaHarian)} / hari
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standar Durasi Pinjam (Hari):
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={durasiPinjamHari}
                onChange={(e) => setDurasiPinjamHari(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Default masa pinjam (saat ini {durasiPinjamHari} hari)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maksimal Buku per Siswa:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={maxPinjamBuku}
                onChange={(e) => setMaxPinjamBuku(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Batas kuota buku yang dapat dipinjam bersamaan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maksimal Perpanjangan Masa Pinjam:
              </label>
              <input
                type="number"
                min="0"
                max="5"
                required
                value={maxPerpanjangan}
                onChange={(e) => setMaxPerpanjangan(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Denda Kondisi Buku Rusak:
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={dendaRusak}
                onChange={(e) => setDendaRusak(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Denda Penggantian Buku Hilang:
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                required
                value={dendaHilang}
                onChange={(e) => setDendaHilang(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Template Notifikasi WhatsApp & Email */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BellRing className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Format Template Notifikasi Pengingat WhatsApp &amp; Email
            </h3>
          </div>

          <p className="text-slate-500 text-[11px] leading-relaxed">
            Gunakan variabel berikut untuk mengganti data secara otomatis:{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;NAMA&#125;
            </code>
            ,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;NIM&#125;
            </code>
            ,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;JUDUL_BUKU&#125;
            </code>
            ,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;TANGGAL_JATUH_TEMPO&#125;
            </code>
            ,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;STATUS_TEKS&#125;
            </code>
            ,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;PESAN_DENDA&#125;
            </code>
            ,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">
              &#123;TARIF_DENDA&#125;
            </code>
            .
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Template Pesan WhatsApp:
              </label>
              <textarea
                rows={9}
                value={templateWaReminder}
                onChange={(e) => setTemplateWaReminder(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Template Pesan Email:
              </label>
              <textarea
                rows={9}
                value={templateEmailReminder}
                onChange={(e) => setTemplateEmailReminder(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Profil Perpustakaan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Identitas Lembaga &amp; Alamat Perpustakaan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Perpustakaan:</label>
              <input
                type="text"
                value={namaPerpustakaan}
                onChange={(e) => setNamaPerpustakaan(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kontak Sirkulasi / Telepon:</label>
              <input
                type="text"
                value={kontakPerpustakaan}
                onChange={(e) => setKontakPerpustakaan(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Kampus:</label>
              <input
                type="text"
                value={alamatPerpustakaan}
                onChange={(e) => setAlamatPerpustakaan(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan sistem dan aturan tarif denda berhasil disimpan!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Seluruh Konfigurasi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
