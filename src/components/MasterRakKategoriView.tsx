import React, { useState } from 'react';
import { Layers, Bookmark, Plus, MapPin, BookOpen } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export const MasterRakKategoriView: React.FC<{ type: 'rak' | 'kategori' }> = ({ type }) => {
  const { rakList, kategoriList, bukuList, addRack, addCategory } = useLibrary();

  const [showAdd, setShowAdd] = useState(false);
  // Rak form
  const [kodeRak, setKodeRak] = useState('');
  const [namaRak, setNamaRak] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Kategori form
  const [kodeKat, setKodeKat] = useState('');
  const [namaKat, setNamaKat] = useState('');
  const [deskripsiKat, setDeskripsiKat] = useState('');

  const handleOpenAdd = () => {
    if (type === 'rak') {
      setKodeRak(`RAK-${String.fromCharCode(65 + rakList.length)}${rakList.length + 1}`);
      setNamaRak('');
      setLokasi('Lantai 1');
      setKeterangan('');
    } else {
      setKodeKat(`K-${kategoriList.length + 1}`);
      setNamaKat('');
      setDeskripsiKat('');
    }
    setShowAdd(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'rak') {
      addRack({ kodeRak, namaRak, lokasi, keterangan });
    } else {
      addCategory({ kode: kodeKat, nama: namaKat, deskripsi: deskripsiKat });
    }
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {type === 'rak' ? (
              <Layers className="w-5 h-5 text-blue-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-blue-600" />
            )}
            <span>{type === 'rak' ? 'Lokasi & Penataan Rak Buku Fisik' : 'Master Kategori Koleksi Pustaka'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {type === 'rak'
              ? 'Pengelompokan rak buku berdasarkan zonasi ruangan dan nomor penataan'
              : 'Klasifikasi disiplin ilmu buku untuk kemudahan pencarian koleksi'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{type === 'rak' ? 'Tambah Rak Baru' : 'Tambah Kategori'}</span>
        </button>
      </div>

      {type === 'rak' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rakList.map((rak) => {
            const booksInRack = bukuList.filter((b) => b.rakId === rak.id);
            const totalStock = booksInRack.reduce((acc, b) => acc + b.stokTotal, 0);

            return (
              <div
                key={rak.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                      {rak.kodeRak}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booksInRack.length} Judul Buku ({totalStock} Eks)</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3">{rak.namaRak}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{rak.lokasi}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                    {rak.keterangan || 'Tidak ada keterangan tambahan.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kategoriList.map((kat) => {
            const booksInKat = bukuList.filter((b) => b.kategori === kat.nama);

            return (
              <div
                key={kat.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {kat.kode}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      {booksInKat.length} Buku
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{kat.nama}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {kat.deskripsi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {type === 'rak' ? 'Tambah Data Rak Buku' : 'Tambah Kategori Buku'}
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              {type === 'rak' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kode Rak:</label>
                      <input
                        type="text"
                        required
                        value={kodeRak}
                        onChange={(e) => setKodeRak(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Rak:</label>
                      <input
                        type="text"
                        required
                        value={namaRak}
                        onChange={(e) => setNamaRak(e.target.value)}
                        placeholder="Contoh: Rak AI & Cloud"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lokasi Gedung / Lantai:</label>
                    <input
                      type="text"
                      required
                      value={lokasi}
                      onChange={(e) => setLokasi(e.target.value)}
                      placeholder="Contoh: Lantai 2 - Zona Barat"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Keterangan Koleksi:</label>
                    <input
                      type="text"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Koleksi buku IT & Pemrograman"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kode:</label>
                      <input
                        type="text"
                        required
                        value={kodeKat}
                        onChange={(e) => setKodeKat(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Nama Kategori:</label>
                      <input
                        type="text"
                        required
                        value={namaKat}
                        onChange={(e) => setNamaKat(e.target.value)}
                        placeholder="Kategori Pustaka"
                        className="w-full p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deskripsi:</label>
                    <textarea
                      rows={3}
                      value={deskripsiKat}
                      onChange={(e) => setDeskripsiKat(e.target.value)}
                      placeholder="Cakupan materi buku..."
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
