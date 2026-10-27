import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Buku,
  Anggota,
  Rak,
  Kategori,
  Peminjaman,
  NotifikasiLog,
  PengaturanSistem,
  KondisiBuku,
} from '../types';
import {
  initialBuku,
  initialAnggota,
  initialRak,
  initialKategori,
  initialPeminjaman,
  initialNotifikasiLogs,
  initialPengaturan,
} from '../data/initialData';
import {
  evaluatePeminjamanStatus,
  addDays,
  getDiffDays,
  buildNotificationContent,
} from '../utils/dateUtils';

interface LibraryContextType {
  bukuList: Buku[];
  anggotaList: Anggota[];
  rakList: Rak[];
  kategoriList: Kategori[];
  peminjamanList: Peminjaman[];
  notifikasiLogs: NotifikasiLog[];
  pengaturan: PengaturanSistem;
  currentDate: string; // YYYY-MM-DD
  setCurrentDate: (date: string) => void;
  advanceDate: (days: number) => void;
  resetDate: () => void;
  
  // Transactions
  addLoan: (data: {
    anggotaId: string;
    bukuId: string;
    tglPinjam: string;
    tglJatuhTempo: string;
    catatan?: string;
  }) => { success: boolean; message: string; loanId?: string };
  returnBook: (
    transaksiId: string,
    kondisi: KondisiBuku,
    dendaDibayar: boolean,
    catatan?: string
  ) => { success: boolean; message: string };
  extendLoan: (transaksiId: string, additionalDays?: number) => { success: boolean; message: string };
  payFine: (transaksiId: string) => { success: boolean; message: string };
  
  // Notifications
  sendNotification: (
    loanId: string,
    channel: 'WHATSAPP' | 'EMAIL',
    customMessage?: string
  ) => { success: boolean; waUrl?: string; message: string };
  sendBulkDueReminders: (channel: 'WHATSAPP' | 'EMAIL') => { sentCount: number; message: string };
  clearNotificationLogs: () => void;
  
  // Master data management
  addBook: (buku: Omit<Buku, 'id' | 'stokDipinjam'>) => void;
  updateBook: (id: string, buku: Partial<Buku>) => void;
  deleteBook: (id: string) => { success: boolean; message: string };
  adjustBookStock: (id: string, delta: number) => void;
  
  addMember: (anggota: Omit<Anggota, 'id' | 'totalPinjamCount' | 'totalDendaDibayar'>) => void;
  updateMember: (id: string, anggota: Partial<Anggota>) => void;
  
  addRack: (rak: Omit<Rak, 'id'>) => void;
  addCategory: (kat: Omit<Kategori, 'id'>) => void;
  updatePengaturan: (newSettings: Partial<PengaturanSistem>) => void;
  resetToDefaultData: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'simperpus_smp_v2_';

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'date') || '2026-10-24';
  });

  const [bukuList, setBukuList] = useState<Buku[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'buku');
    return saved ? JSON.parse(saved) : initialBuku;
  });

  const [anggotaList, setAnggotaList] = useState<Anggota[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'anggota');
    return saved ? JSON.parse(saved) : initialAnggota;
  });

  const [rakList, setRakList] = useState<Rak[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'rak');
    return saved ? JSON.parse(saved) : initialRak;
  });

  const [kategoriList, setKategoriList] = useState<Kategori[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'kategori');
    return saved ? JSON.parse(saved) : initialKategori;
  });

  const [rawPeminjamanList, setRawPeminjamanList] = useState<Peminjaman[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'peminjaman');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: Peminjaman) => ({
          ...p,
          petugas:
            p.petugas === 'Irving Dian Pratama'
              ? 'Reynisa Setty Nurul Marwah'
              : p.petugas || 'Reynisa Setty Nurul Marwah',
        }));
      } catch {
        return initialPeminjaman;
      }
    }
    return initialPeminjaman;
  });

  const [notifikasiLogs, setNotifikasiLogs] = useState<NotifikasiLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifikasi');
    return saved ? JSON.parse(saved) : initialNotifikasiLogs;
  });

  const [pengaturan, setPengaturan] = useState<PengaturanSistem>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'pengaturan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.alamatPerpustakaan && parsed.alamatPerpustakaan.includes('Yogyakarta')) {
          parsed.alamatPerpustakaan = parsed.alamatPerpustakaan.replace('Yogyakarta', 'Cilacap');
        }
        if (parsed.namaPerpustakaan && !parsed.namaPerpustakaan.includes('Cilacap')) {
          parsed.namaPerpustakaan = parsed.namaPerpustakaan.replace('Universitas Cendekia', 'Universitas Cendekia Cilacap');
        }
        return parsed;
      } catch {
        return initialPengaturan;
      }
    }
    return initialPengaturan;
  });

  // Automatically recalculate fine and statuses whenever current simulated date or fine rate changes
  const peminjamanList = useMemo(() => {
    return rawPeminjamanList.map((loan) =>
      evaluatePeminjamanStatus(loan, currentDate, pengaturan.tarifDendaHarian)
    );
  }, [rawPeminjamanList, currentDate, pengaturan.tarifDendaHarian]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'date', currentDate);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'buku', JSON.stringify(bukuList));
  }, [bukuList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'anggota', JSON.stringify(anggotaList));
  }, [anggotaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'rak', JSON.stringify(rakList));
  }, [rakList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'kategori', JSON.stringify(kategoriList));
  }, [kategoriList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'peminjaman', JSON.stringify(rawPeminjamanList));
  }, [rawPeminjamanList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notifikasi', JSON.stringify(notifikasiLogs));
  }, [notifikasiLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'pengaturan', JSON.stringify(pengaturan));
  }, [pengaturan]);

  const advanceDate = (days: number) => {
    setCurrentDate((prev) => addDays(prev, days));
  };

  const resetDate = () => {
    setCurrentDate('2026-10-24');
  };

  const addLoan = ({
    anggotaId,
    bukuId,
    tglPinjam,
    tglJatuhTempo,
    catatan,
  }: {
    anggotaId: string;
    bukuId: string;
    tglPinjam: string;
    tglJatuhTempo: string;
    catatan?: string;
  }) => {
    const member = anggotaList.find((a) => a.id === anggotaId);
    const book = bukuList.find((b) => b.id === bukuId);

    if (!member) return { success: false, message: 'Anggota tidak ditemukan.' };
    if (!book) return { success: false, message: 'Buku tidak ditemukan.' };

    if (book.stokTersedia <= 0) {
      return { success: false, message: `Stok buku "${book.judul}" saat ini habis!` };
    }

    // Check active loans for this member
    const activeLoans = peminjamanList.filter(
      (p) => p.anggotaId === anggotaId && p.status !== 'DIKEMBALIKAN'
    );
    if (activeLoans.length >= pengaturan.maxPinjamBuku) {
      return {
        success: false,
        message: `Mahasiswa ${member.nama} sudah mencapai batas maksimal pinjaman (${pengaturan.maxPinjamBuku} buku).`,
      };
    }

    // Check unpaid overdue fines
    const hasUnpaidFines = activeLoans.some((p) => p.statusDenda === 'BELUM_LUNAS' && p.totalDenda > 0);
    if (hasUnpaidFines) {
      return {
        success: false,
        message: `Mahasiswa memiliki denda keterlambatan yang belum dilunasi. Harap lunasi denda terlebih dahulu.`,
      };
    }

    const trNum = rawPeminjamanList.length + 1;
    const kodeTransaksi = `TRX-${currentDate.replace(/-/g, '').slice(0, 6)}-${String(trNum).padStart(3, '0')}`;
    const newId = `pjm-${Date.now()}`;

    const newLoan: Peminjaman = {
      id: newId,
      kodeTransaksi,
      anggotaId: member.id,
      anggotaNim: member.nim,
      anggotaNama: member.nama,
      anggotaNoHp: member.noHp,
      anggotaEmail: member.email,
      bukuId: book.id,
      bukuJudul: book.judul,
      bukuIsbn: book.isbn,
      tglPinjam,
      tglJatuhTempo,
      status: 'DIPINJAM',
      perpanjanganCount: 0,
      hariTerlambat: 0,
      tarifDendaPerHari: pengaturan.tarifDendaHarian,
      dendaKeterlambatan: 0,
      dendaKerusakan: 0,
      totalDenda: 0,
      statusDenda: 'TIDAK_ADA',
      petugas: 'Reynisa Setty Nurul Marwah',
      catatan,
    };

    // Update raw loans
    setRawPeminjamanList((prev) => [newLoan, ...prev]);

    // Decrease available stock, increase borrowed stock
    setBukuList((prev) =>
      prev.map((b) =>
        b.id === bukuId
          ? {
              ...b,
              stokTersedia: Math.max(0, b.stokTersedia - 1),
              stokDipinjam: b.stokDipinjam + 1,
            }
          : b
      )
    );

    // Update member borrow count
    setAnggotaList((prev) =>
      prev.map((a) =>
        a.id === anggotaId
          ? {
              ...a,
              totalPinjamCount: a.totalPinjamCount + 1,
            }
          : a
      )
    );

    return {
      success: true,
      message: `Peminjaman "${book.judul}" atas nama ${member.nama} berhasil dicatat! Kode: ${kodeTransaksi}`,
      loanId: newId,
    };
  };

  const returnBook = (
    transaksiId: string,
    kondisi: KondisiBuku,
    dendaDibayar: boolean,
    catatan?: string
  ) => {
    const loan = peminjamanList.find((p) => p.id === transaksiId);
    if (!loan) return { success: false, message: 'Transaksi tidak ditemukan.' };
    if (loan.status === 'DIKEMBALIKAN') {
      return { success: false, message: 'Buku ini sudah pernah dikembalikan.' };
    }

    let extraFine = 0;
    if (kondisi === 'RUSAK') {
      extraFine = pengaturan.dendaRusak;
    } else if (kondisi === 'HILANG') {
      extraFine = pengaturan.dendaHilang;
    }

    const totalDendaAkhir = (loan.dendaKeterlambatan || 0) + extraFine;
    const finalStatusDenda =
      totalDendaAkhir > 0 ? (dendaDibayar ? 'LUNAS' : 'BELUM_LUNAS') : 'TIDAK_ADA';

    setRawPeminjamanList((prev) =>
      prev.map((p) =>
        p.id === transaksiId
          ? {
              ...p,
              status: 'DIKEMBALIKAN',
              tglKembali: currentDate,
              kondisiBukuKembali: kondisi,
              dendaKerusakan: extraFine,
              totalDenda: totalDendaAkhir,
              statusDenda: finalStatusDenda,
              catatan: catatan ? `${p.catatan || ''} | Kembali: ${catatan}` : p.catatan,
            }
          : p
      )
    );

    // If not lost, restore available stock
    if (kondisi !== 'HILANG') {
      setBukuList((prev) =>
        prev.map((b) =>
          b.id === loan.bukuId
            ? {
                ...b,
                stokTersedia: Math.min(b.stokTotal, b.stokTersedia + 1),
                stokDipinjam: Math.max(0, b.stokDipinjam - 1),
              }
            : b
        )
      );
    } else {
      // If lost, reduce total stock & borrowed stock
      setBukuList((prev) =>
        prev.map((b) =>
          b.id === loan.bukuId
            ? {
                ...b,
                stokTotal: Math.max(0, b.stokTotal - 1),
                stokDipinjam: Math.max(0, b.stokDipinjam - 1),
              }
            : b
        )
      );
    }

    // If fine was paid, update member record
    if (dendaDibayar && totalDendaAkhir > 0) {
      setAnggotaList((prev) =>
        prev.map((a) =>
          a.id === loan.anggotaId
            ? {
                ...a,
                totalDendaDibayar: a.totalDendaDibayar + totalDendaAkhir,
              }
            : a
        )
      );
    }

    return {
      success: true,
      message: `Buku "${loan.bukuJudul}" berhasil dikembalikan. Stok rak otomatis diperbarui!`,
    };
  };

  const extendLoan = (transaksiId: string, additionalDays: number = 7) => {
    const loan = peminjamanList.find((p) => p.id === transaksiId);
    if (!loan) return { success: false, message: 'Peminjaman tidak ditemukan.' };
    if (loan.status === 'DIKEMBALIKAN') {
      return { success: false, message: 'Buku sudah dikembalikan, tidak dapat diperpanjang.' };
    }
    if (loan.perpanjanganCount >= pengaturan.maxPerpanjangan) {
      return {
        success: false,
        message: `Maksimal perpanjangan (${pengaturan.maxPerpanjangan}x) telah tercapai. Buku harus dikembalikan terlebih dahulu.`,
      };
    }
    if (loan.status === 'TERLAMBAT') {
      return {
        success: false,
        message: 'Buku yang sudah terlambat tidak dapat diperpanjang. Harap selesaikan pengembalian dan denda di kasir.',
      };
    }

    const newDueDate = addDays(loan.tglJatuhTempo, additionalDays);

    setRawPeminjamanList((prev) =>
      prev.map((p) =>
        p.id === transaksiId
          ? {
              ...p,
              tglJatuhTempo: newDueDate,
              perpanjanganCount: p.perpanjanganCount + 1,
            }
          : p
      )
    );

    return {
      success: true,
      message: `Perpanjangan berhasil! Batas kembali baru: ${newDueDate} (+${additionalDays} hari).`,
    };
  };

  const payFine = (transaksiId: string) => {
    const loan = peminjamanList.find((p) => p.id === transaksiId);
    if (!loan) return { success: false, message: 'Transaksi tidak ditemukan.' };
    if (loan.statusDenda === 'LUNAS') {
      return { success: false, message: 'Denda sudah lunas.' };
    }

    setRawPeminjamanList((prev) =>
      prev.map((p) =>
        p.id === transaksiId
          ? {
              ...p,
              statusDenda: 'LUNAS',
            }
          : p
      )
    );

    // Update member record
    setAnggotaList((prev) =>
      prev.map((a) =>
        a.id === loan.anggotaId
          ? {
              ...a,
              totalDendaDibayar: a.totalDendaDibayar + loan.totalDenda,
            }
          : a
      )
    );

    return {
      success: true,
      message: `Pembayaran denda ${loan.kodeTransaksi} sebesar Rp ${loan.totalDenda.toLocaleString('id-ID')} berhasil dicatat lunas.`,
    };
  };

  const sendNotification = (
    loanId: string,
    channel: 'WHATSAPP' | 'EMAIL',
    customMessage?: string
  ) => {
    const loan = peminjamanList.find((p) => p.id === loanId);
    if (!loan) return { success: false, message: 'Peminjaman tidak ditemukan.' };

    const diffDays = getDiffDays(currentDate, loan.tglJatuhTempo);
    const template =
      channel === 'WHATSAPP'
        ? pengaturan.templateWaReminder
        : pengaturan.templateEmailReminder;

    const messageContent =
      customMessage || buildNotificationContent(template, loan, pengaturan, diffDays);

    let notifType: NotifikasiLog['tipe'] = 'MANUAL';
    if (diffDays < 0) notifType = 'OVERDUE';
    else if (diffDays === 0) notifType = 'HARI_H';
    else if (diffDays === 1) notifType = 'REMINDER_H1';
    else if (diffDays === 2) notifType = 'REMINDER_H2';

    const nowTime = `${currentDate} ${new Date().toTimeString().slice(0, 8)}`;

    const newLog: NotifikasiLog = {
      id: `notif-${Date.now()}`,
      transaksiId: loan.id,
      kodeTransaksi: loan.kodeTransaksi,
      anggotaNama: loan.anggotaNama,
      tujuan: channel === 'WHATSAPP' ? loan.anggotaNoHp : loan.anggotaEmail,
      channel,
      tipe: notifType,
      judulPesan:
        channel === 'WHATSAPP'
          ? `Pengingat Perpustakaan - ${loan.bukuJudul}`
          : `[SIMPERPUS] Sirkulasi Pengembalian Buku - ${loan.bukuJudul}`,
      isiPesan: messageContent,
      waktuKirim: nowTime,
      statusKirim: 'TERKIRIM',
    };

    setNotifikasiLogs((prev) => [newLog, ...prev]);

    // Update last notification on loan
    let shortTipe: 'H-2' | 'H-1' | 'HARI_H' | 'TERLAMBAT' = 'H-2';
    if (diffDays < 0) shortTipe = 'TERLAMBAT';
    else if (diffDays === 0) shortTipe = 'HARI_H';
    else if (diffDays === 1) shortTipe = 'H-1';

    setRawPeminjamanList((prev) =>
      prev.map((p) =>
        p.id === loanId
          ? {
              ...p,
              terakhirNotifikasi: {
                waktu: nowTime.slice(0, 16),
                tipe: shortTipe,
                via: channel,
              },
            }
          : p
      )
    );

    let waUrl = '';
    if (channel === 'WHATSAPP') {
      const cleanPhone = loan.anggotaNoHp.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(messageContent);
      waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    }

    return {
      success: true,
      waUrl,
      message: `Notifikasi ${channel} berhasil dikirim ke ${loan.anggotaNama} (${channel === 'WHATSAPP' ? loan.anggotaNoHp : loan.anggotaEmail}).`,
    };
  };

  const sendBulkDueReminders = (channel: 'WHATSAPP' | 'EMAIL') => {
    // Target loans that are overdue (diffDays < 0), due today (0), or nearing due (1 or 2 days)
    const candidates = peminjamanList.filter((p) => {
      if (p.status === 'DIKEMBALIKAN') return false;
      const diff = getDiffDays(currentDate, p.tglJatuhTempo);
      return diff <= 2; // H-2, H-1, Hari H, or Overdue
    });

    if (candidates.length === 0) {
      return { sentCount: 0, message: 'Tidak ada peminjaman yang memerlukan pengingat saat ini.' };
    }

    const nowTime = `${currentDate} ${new Date().toTimeString().slice(0, 8)}`;
    const newLogs: NotifikasiLog[] = [];

    candidates.forEach((loan) => {
      const diffDays = getDiffDays(currentDate, loan.tglJatuhTempo);
      const template =
        channel === 'WHATSAPP'
          ? pengaturan.templateWaReminder
          : pengaturan.templateEmailReminder;
      const messageContent = buildNotificationContent(template, loan, pengaturan, diffDays);

      let notifType: NotifikasiLog['tipe'] = 'MANUAL';
      if (diffDays < 0) notifType = 'OVERDUE';
      else if (diffDays === 0) notifType = 'HARI_H';
      else if (diffDays === 1) notifType = 'REMINDER_H1';
      else if (diffDays === 2) notifType = 'REMINDER_H2';

      newLogs.push({
        id: `notif-${Date.now()}-${loan.id}`,
        transaksiId: loan.id,
        kodeTransaksi: loan.kodeTransaksi,
        anggotaNama: loan.anggotaNama,
        tujuan: channel === 'WHATSAPP' ? loan.anggotaNoHp : loan.anggotaEmail,
        channel,
        tipe: notifType,
        judulPesan: `[SIMPERPUS Masal] Pengingat Batas Peminjaman`,
        isiPesan: messageContent,
        waktuKirim: nowTime,
        statusKirim: 'TERKIRIM',
      });
    });

    setNotifikasiLogs((prev) => [...newLogs, ...prev]);

    // Update loans notification timestamps
    const candidateIds = new Set(candidates.map((c) => c.id));
    setRawPeminjamanList((prev) =>
      prev.map((p) => {
        if (!candidateIds.has(p.id)) return p;
        const diff = getDiffDays(currentDate, p.tglJatuhTempo);
        let shortTipe: 'H-2' | 'H-1' | 'HARI_H' | 'TERLAMBAT' = 'H-2';
        if (diff < 0) shortTipe = 'TERLAMBAT';
        else if (diff === 0) shortTipe = 'HARI_H';
        else if (diff === 1) shortTipe = 'H-1';

        return {
          ...p,
          terakhirNotifikasi: {
            waktu: nowTime.slice(0, 16),
            tipe: shortTipe,
            via: channel,
          },
        };
      })
    );

    return {
      sentCount: candidates.length,
      message: `Berhasil mengirim ${candidates.length} pesan pengingat ${channel} ke seluruh mahasiswa terkait.`,
    };
  };

  const clearNotificationLogs = () => {
    setNotifikasiLogs([]);
  };

  const addBook = (buku: Omit<Buku, 'id' | 'stokDipinjam'>) => {
    const newBook: Buku = {
      ...buku,
      id: `buku-${Date.now()}`,
      stokDipinjam: 0,
      stokTersedia: buku.stokTotal,
    };
    setBukuList((prev) => [newBook, ...prev]);
  };

  const updateBook = (id: string, updated: Partial<Buku>) => {
    setBukuList((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newTotal = updated.stokTotal !== undefined ? updated.stokTotal : b.stokTotal;
        const currentBorrowed = b.stokDipinjam;
        const newTersedia = Math.max(0, newTotal - currentBorrowed);
        return {
          ...b,
          ...updated,
          stokTotal: newTotal,
          stokTersedia: newTersedia,
        };
      })
    );
  };

  const deleteBook = (id: string) => {
    const isBorrowed = peminjamanList.some(
      (p) => p.bukuId === id && p.status !== 'DIKEMBALIKAN'
    );
    if (isBorrowed) {
      return {
        success: false,
        message: 'Buku ini sedang dalam peminjaman aktif dan tidak dapat dihapus.',
      };
    }
    setBukuList((prev) => prev.filter((b) => b.id !== id));
    return { success: true, message: 'Buku berhasil dihapus dari katalog.' };
  };

  const adjustBookStock = (id: string, delta: number) => {
    setBukuList((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newTotal = Math.max(b.stokDipinjam, b.stokTotal + delta);
        const newTersedia = Math.max(0, newTotal - b.stokDipinjam);
        return {
          ...b,
          stokTotal: newTotal,
          stokTersedia: newTersedia,
        };
      })
    );
  };

  const addMember = (
    anggota: Omit<Anggota, 'id' | 'totalPinjamCount' | 'totalDendaDibayar'>
  ) => {
    const newMember: Anggota = {
      ...anggota,
      id: `agt-${Date.now()}`,
      totalPinjamCount: 0,
      totalDendaDibayar: 0,
    };
    setAnggotaList((prev) => [newMember, ...prev]);
  };

  const updateMember = (id: string, updated: Partial<Anggota>) => {
    setAnggotaList((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const addRack = (rak: Omit<Rak, 'id'>) => {
    const newRak: Rak = { ...rak, id: `rak-${Date.now()}` };
    setRakList((prev) => [...prev, newRak]);
  };

  const addCategory = (kat: Omit<Kategori, 'id'>) => {
    const newKat: Kategori = { ...kat, id: `kat-${Date.now()}` };
    setKategoriList((prev) => [...prev, newKat]);
  };

  const updatePengaturan = (newSettings: Partial<PengaturanSistem>) => {
    setPengaturan((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaultData = () => {
    setCurrentDate('2026-10-24');
    setBukuList(initialBuku);
    setAnggotaList(initialAnggota);
    setRakList(initialRak);
    setKategoriList(initialKategori);
    setRawPeminjamanList(initialPeminjaman);
    setNotifikasiLogs(initialNotifikasiLogs);
    setPengaturan(initialPengaturan);
    localStorage.clear();
  };

  return (
    <LibraryContext.Provider
      value={{
        bukuList,
        anggotaList,
        rakList,
        kategoriList,
        peminjamanList,
        notifikasiLogs,
        pengaturan,
        currentDate,
        setCurrentDate,
        advanceDate,
        resetDate,
        addLoan,
        returnBook,
        extendLoan,
        payFine,
        sendNotification,
        sendBulkDueReminders,
        clearNotificationLogs,
        addBook,
        updateBook,
        deleteBook,
        adjustBookStock,
        addMember,
        updateMember,
        addRack,
        addCategory,
        updatePengaturan,
        resetToDefaultData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
