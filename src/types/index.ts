export interface Buku {
  id: string;
  isbn: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahun: number;
  kategori: string;
  rakId: string;
  rakNama: string;
  stokTotal: number;
  stokTersedia: number;
  stokDipinjam: number;
  coverColor: string;
  deskripsi: string;
}

export interface Anggota {
  id: string;
  nim: string;
  nama: string;
  email: string;
  noHp: string; // WhatsApp formatted
  prodi: string;
  fakultas: string;
  status: 'AKTIF' | 'NONAKTIF' | 'SUSPENDED';
  tglDaftar: string;
  totalPinjamCount: number;
  totalDendaDibayar: number;
}

export interface Rak {
  id: string;
  kodeRak: string;
  namaRak: string;
  lokasi: string;
  keterangan: string;
}

export interface Kategori {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
}

export type StatusPeminjaman = 'DIPINJAM' | 'JATUH_TEMPO' | 'TERLAMBAT' | 'DIKEMBALIKAN';
export type StatusDenda = 'TIDAK_ADA' | 'BELUM_LUNAS' | 'LUNAS';
export type KondisiBuku = 'BAIK' | 'RUSAK' | 'HILANG';

export interface Peminjaman {
  id: string;
  kodeTransaksi: string;
  anggotaId: string;
  anggotaNim: string;
  anggotaNama: string;
  anggotaNoHp: string;
  anggotaEmail: string;
  bukuId: string;
  bukuJudul: string;
  bukuIsbn: string;
  tglPinjam: string; // YYYY-MM-DD
  tglJatuhTempo: string; // YYYY-MM-DD
  tglKembali?: string; // YYYY-MM-DD
  status: StatusPeminjaman;
  perpanjanganCount: number; // max 2
  hariTerlambat: number;
  tarifDendaPerHari: number;
  dendaKeterlambatan: number;
  dendaKerusakan: number;
  totalDenda: number;
  statusDenda: StatusDenda;
  kondisiBukuKembali?: KondisiBuku;
  petugas: string;
  catatan?: string;
  terakhirNotifikasi?: {
    waktu: string;
    tipe: 'H-2' | 'H-1' | 'HARI_H' | 'TERLAMBAT';
    via: 'WHATSAPP' | 'EMAIL';
  };
}

export interface NotifikasiLog {
  id: string;
  transaksiId: string;
  kodeTransaksi: string;
  anggotaNama: string;
  tujuan: string; // phone or email
  channel: 'WHATSAPP' | 'EMAIL';
  tipe: 'REMINDER_H2' | 'REMINDER_H1' | 'HARI_H' | 'OVERDUE' | 'MANUAL';
  judulPesan: string;
  isiPesan: string;
  waktuKirim: string;
  statusKirim: 'TERKIRIM' | 'GAGAL' | 'PENDING';
}

export interface PengaturanSistem {
  namaPerpustakaan: string;
  alamatPerpustakaan: string;
  kontakPerpustakaan: string;
  emailPerpustakaan: string;
  durasiPinjamHari: number; // default 7
  tarifDendaHarian: number; // default 1000
  dendaRusak: number; // default 25000
  dendaHilang: number; // default 75000
  maxPinjamBuku: number; // default 3
  maxPerpanjangan: number; // default 2
  templateWaReminder: string;
  templateEmailReminder: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'buku'
  | 'anggota'
  | 'rak'
  | 'kategori'
  | 'pinjam'
  | 'kembali'
  | 'monitoring'
  | 'laporan'
  | 'pengaturan';
