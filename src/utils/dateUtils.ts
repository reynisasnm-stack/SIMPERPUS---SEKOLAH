import { Peminjaman, PengaturanSistem } from '../types';

/**
 * Format number to Indonesian Rupiah (e.g. Rp 5.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string (YYYY-MM-DD) to friendly Indonesian date
 */
export function formatTanggalIndo(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Calculate difference in whole calendar days between two YYYY-MM-DD dates
 * Positive if targetDate is after baseDate (future)
 * Negative if targetDate is before baseDate (past)
 */
export function getDiffDays(baseDateStr: string, targetDateStr: string): number {
  const baseParts = baseDateStr.split('-').map(Number);
  const targetParts = targetDateStr.split('-').map(Number);
  const d1 = new Date(baseParts[0], baseParts[1] - 1, baseParts[2]);
  const d2 = new Date(targetParts[0], targetParts[1] - 1, targetParts[2]);
  const msDiff = d2.getTime() - d1.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Add days to YYYY-MM-DD
 */
export function addDays(dateStr: string, daysToAdd: number): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + daysToAdd);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Recalculate transaction status and fines dynamically based on current simulated date
 */
export function evaluatePeminjamanStatus(
  peminjaman: Peminjaman,
  currentSimulatedDate: string,
  tarifDendaHarian: number
): Peminjaman {
  // If already returned, keep stored values
  if (peminjaman.status === 'DIKEMBALIKAN') {
    return peminjaman;
  }

  const diffDays = getDiffDays(currentSimulatedDate, peminjaman.tglJatuhTempo);

  if (diffDays < 0) {
    // Overdue
    const hariTerlambat = Math.abs(diffDays);
    const dendaKeterlambatan = hariTerlambat * tarifDendaHarian;
    const totalDenda = dendaKeterlambatan + (peminjaman.dendaKerusakan || 0);

    return {
      ...peminjaman,
      status: 'TERLAMBAT',
      hariTerlambat,
      dendaKeterlambatan,
      totalDenda,
      statusDenda: totalDenda > 0 ? (peminjaman.statusDenda === 'LUNAS' ? 'LUNAS' : 'BELUM_LUNAS') : 'TIDAK_ADA',
    };
  } else if (diffDays === 0) {
    // Due TODAY
    return {
      ...peminjaman,
      status: 'JATUH_TEMPO',
      hariTerlambat: 0,
      dendaKeterlambatan: 0,
      totalDenda: peminjaman.dendaKerusakan || 0,
      statusDenda: (peminjaman.dendaKerusakan || 0) > 0 ? peminjaman.statusDenda : 'TIDAK_ADA',
    };
  } else {
    // Not due yet (diffDays > 0)
    return {
      ...peminjaman,
      status: 'DIPINJAM',
      hariTerlambat: 0,
      dendaKeterlambatan: 0,
      totalDenda: peminjaman.dendaKerusakan || 0,
      statusDenda: (peminjaman.dendaKerusakan || 0) > 0 ? peminjaman.statusDenda : 'TIDAK_ADA',
    };
  }
}

/**
 * Generate customized notification text from template
 */
export function buildNotificationContent(
  template: string,
  loan: Peminjaman,
  settings: PengaturanSistem,
  diffDays: number
): string {
  let statusTeks = '';
  let pesanDenda = '';

  if (diffDays < 0) {
    const hari = Math.abs(diffDays);
    statusTeks = `TERLAMBAT ${hari} HARI`;
    pesanDenda = `⚠️ Perhatian: Peminjaman telah melewati batas waktu ${hari} hari. Akumulasi denda saat ini sebesar ${formatRupiah(loan.totalDenda)} (Tarif: ${formatRupiah(settings.tarifDendaHarian)}/hari).\n`;
  } else if (diffDays === 0) {
    statusTeks = 'JATUH TEMPO HARI INI';
    pesanDenda = '⚠️ Harap mengembalikan buku hari ini sebelum layanan sirkulasi tutup pukul 16.30 WIB untuk menghindari denda harian.\n';
  } else if (diffDays === 1) {
    statusTeks = 'BESOK (H-1)';
    pesanDenda = 'ℹ️ Mengingatkan buku akan jatuh tempo besok. Anda dapat mengembalikannya atau mengajukan perpanjangan jika kuota masih tersedia.\n';
  } else if (diffDays === 2) {
    statusTeks = '2 HARI LAGI (H-2)';
    pesanDenda = 'ℹ️ Mengingatkan buku akan jatuh tempo dalam 2 hari ke depan.\n';
  } else {
    statusTeks = `${diffDays} hari lagi`;
    pesanDenda = '';
  }

  return template
    .replace(/{NAMA}/g, loan.anggotaNama)
    .replace(/{NIM}/g, loan.anggotaNim)
    .replace(/{NAMA_PERPUSTAKAAN}/g, settings.namaPerpustakaan)
    .replace(/{JUDUL_BUKU}/g, loan.bukuJudul)
    .replace(/{KODE_TRANSAKSI}/g, loan.kodeTransaksi)
    .replace(/{TANGGAL_JATUH_TEMPO}/g, formatTanggalIndo(loan.tglJatuhTempo))
    .replace(/{STATUS_TEKS}/g, statusTeks)
    .replace(/{PESAN_DENDA}/g, pesanDenda)
    .replace(/{TARIF_DENDA}/g, settings.tarifDendaHarian.toString())
    .replace(/{TOTAL_DENDA}/g, formatRupiah(loan.totalDenda));
}
