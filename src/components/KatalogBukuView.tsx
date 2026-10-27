import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { Buku } from '../types';
import { useLibrary } from '../context/LibraryContext';

export const KatalogBukuView: React.FC = () => {
  const {
    bukuList,
    rakList,
    kategoriList,
    addBook,
    updateBook,
    deleteBook,
    adjustBookStock,
  } = useLibrary();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [filterRak, setFilterRak] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Buku | null>(null);

  // Form states
  const [isbn, setIsbn] = useState('');
  const [judul, setJudul] = useState('');
  const [pengarang, setPengarang] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [tahun, setTahun] = useState(2024);
  const [kategori, setKategori] = useState(kategoriList[0]?.nama || 'Informatika & Ilmu Komputer');
  const [rakId, setRakId] = useState(rakList[0]?.id || 'rak-1');
  const [stokTotal, setStokTotal] = useState(5);
  const [deskripsi, setDeskripsi] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredBooks = bukuList.filter((book) => {
    if (filterKategori !== 'ALL' && book.kategori !== filterKategori) return false;
    if (filterRak !== 'ALL' && book.rakId !== filterRak) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchJudul = book.judul.toLowerCase().includes(q);
      const matchPengarang = book.pengarang.toLowerCase().includes(q);
      const matchIsbn = book.isbn.toLowerCase().includes(q);
      const matchPenerbit = book.penerbit.toLowerCase().includes(q);
      return matchJudul || matchPengarang || matchIsbn || matchPenerbit;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setIsbn(`978-602-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}-1`);
    setJudul('');
    setPengarang('');
    setPenerbit('Penerbit Nasional');
    setTahun(2024);
    setKategori(kategoriList[0]?.nama || 'Informatika & Ilmu Komputer');
    setRakId(rakList[0]?.id || 'rak-1');
    setStokTotal(5);
    setDeskripsi('');
    setEditingBook(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (book: Buku) => {
    setEditingBook(book);
    setIsbn(book.isbn);
    setJudul(book.judul);
    setPengarang(book.pengarang);
    setPenerbit(book.penerbit);
    setTahun(book.tahun);
    setKategori(book.kategori);
    setRakId(book.rakId);
    setStokTotal(book.stokTotal);
    setDeskripsi(book.deskripsi);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRak = rakList.find((r) => r.id === rakId);
    const rakNama = selectedRak ? selectedRak.kodeRak : 'RAK-A1';

    if (editingBook) {
      updateBook(editingBook.id, {
        isbn,
        judul,
        pengarang,
        penerbit,
        tahun,
        kategori,
        rakId,
        rakNama,
        stokTotal,
        deskripsi,
      });
      setFeedback(`Buku "${judul}" berhasil diperbarui.`);
    } else {
      addBook({
        isbn,
        judul,
        pengarang,
        penerbit,
        tahun,
        kategori,
        rakId,
        rakNama,
        stokTotal,
        stokTersedia: stokTotal,
        coverColor: '#2563eb',
        deskripsi,
      });
      setFeedback(`Buku baru "${judul}" berhasil ditambahkan ke katalog.`);
    }

    setTimeout(() => {
      setShowAddModal(false);
      setFeedback(null);
    }, 1000);
  };

  const handleDelete = (id: string, judul: string) => {
    if (confirm(`Hapus buku "${judul}" dari katalog?`)) {
      const res = deleteBook(id);
      if (!res.success) alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Katalog &amp; Monitoring Ketersediaan Stok Buku</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar inventaris koleksi perpustakaan, lokasi penataan rak fisik, dan ketersediaan stok
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Judul Buku Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, pengarang, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Kategori:</span>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">Semua Kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Rak:</span>
            <select
              value={filterRak}
              onChange={(e) => setFilterRak(e.target.value)}
              className="py-1.5 px-2.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="ALL">Semua Rak</option>
              {rakList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.kodeRak} ({r.namaRak})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBooks.map((book) => {
          const isLowStock = book.stokTersedia <= 1;

          return (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    {book.rakNama} · {book.kategori}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(book)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      title="Edit Detail Buku"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id, book.judul)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Hapus Buku"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {book.judul}
                </h4>

                <div className="text-xs text-slate-600 mt-1">
                  Penulis: <span className="font-semibold text-slate-800">{book.pengarang}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Penerbit: {book.penerbit} ({book.tahun}) · ISBN: {book.isbn}
                </div>

                {book.deskripsi && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {book.deskripsi}
                  </p>
                )}
              </div>

              {/* Stock Status Box */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Ketersediaan Stok
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-sm font-extrabold tabular-nums ${
                        book.stokTersedia === 0
                          ? 'text-rose-600'
                          : isLowStock
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {book.stokTersedia} eks tersedia
                    </span>
                    <span className="text-[11px] text-slate-400">
                      / Total {book.stokTotal} (Dipinjam: {book.stokDipinjam})
                    </span>
                  </div>
                </div>

                {/* Quick Stock Adjustment */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustBookStock(book.id, -1)}
                    disabled={book.stokTotal <= book.stokDipinjam}
                    className="p-1 text-slate-500 hover:text-rose-600 disabled:opacity-30 rounded"
                    title="Kurangi 1 Stok Total"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => adjustBookStock(book.id, 1)}
                    className="p-1 text-slate-500 hover:text-emerald-600 rounded"
                    title="Tambah 1 Stok Total"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Book */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingBook ? 'Edit Data Koleksi Buku' : 'Tambah Buku Baru ke Katalog'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Buku:</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Contoh: Arsitektur Cloud Computing Modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pengarang / Penulis:</label>
                  <input
                    type="text"
                    required
                    value={pengarang}
                    onChange={(e) => setPengarang(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="Prof. Budi Raharjo"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penerbit:</label>
                  <input
                    type="text"
                    required
                    value={penerbit}
                    onChange={(e) => setPenerbit(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISBN:</label>
                  <input
                    type="text"
                    required
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Terbit:</label>
                  <input
                    type="number"
                    required
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Total:</label>
                  <input
                    type="number"
                    min={editingBook ? editingBook.stokDipinjam : 1}
                    required
                    value={stokTotal}
                    onChange={(e) => setStokTotal(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori:</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penataan Rak:</label>
                  <select
                    value={rakId}
                    onChange={(e) => setRakId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {rakList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.kodeRak} - {r.namaRak}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                  placeholder="Ringkasan materi pustaka..."
                />
              </div>

              {feedback && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{feedback}</span>
                </div>
              )}

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
                  {editingBook ? 'Simpan Perubahan' : 'Tambah ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
