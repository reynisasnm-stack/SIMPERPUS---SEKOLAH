import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  Send,
  ExternalLink,
  CheckCircle2,
  Copy,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Peminjaman } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { getDiffDays, buildNotificationContent, formatTanggalIndo, formatRupiah } from '../utils/dateUtils';

interface NotificationModalProps {
  loan: Peminjaman | null;
  initialChannel?: 'WHATSAPP' | 'EMAIL';
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  loan,
  initialChannel = 'WHATSAPP',
  onClose,
}) => {
  const { pengaturan, currentDate, sendNotification } = useLibrary();
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL'>(initialChannel);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!loan) return null;

  const diffDays = getDiffDays(currentDate, loan.tglJatuhTempo);
  const template =
    channel === 'WHATSAPP'
      ? pengaturan.templateWaReminder
      : pengaturan.templateEmailReminder;

  const defaultMessage = buildNotificationContent(template, loan, pengaturan, diffDays);
  const [message, setMessage] = useState(defaultMessage);

  // Switch channel updates message
  const handleChannelChange = (newChannel: 'WHATSAPP' | 'EMAIL') => {
    setChannel(newChannel);
    const newTemplate =
      newChannel === 'WHATSAPP'
        ? pengaturan.templateWaReminder
        : pengaturan.templateEmailReminder;
    setMessage(buildNotificationContent(newTemplate, loan, pengaturan, diffDays));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    const result = sendNotification(loan.id, channel, message);
    if (result.success) {
      if (channel === 'WHATSAPP' && result.waUrl) {
        // Open WhatsApp Web / App directly in new tab
        window.open(result.waUrl, '_blank', 'noopener,noreferrer');
      }
      setStatusMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${channel === 'WHATSAPP' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              {channel === 'WHATSAPP' ? (
                <MessageCircle className="w-5 h-5 text-white" />
              ) : (
                <Mail className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">Kirim Pengingat Sirkulasi</h3>
              <p className="text-xs text-slate-300">
                {loan.anggotaNama} ({loan.anggotaNim})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status summary banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-3 ${
              diffDays < 0
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : diffDays === 0
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {diffDays < 0 ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold text-xs">
                {diffDays < 0
                  ? `Terlambat ${Math.abs(diffDays)} Hari · Akumulasi Denda: ${formatRupiah(loan.totalDenda)}`
                  : diffDays === 0
                  ? 'Jatuh Tempo Hari Ini!'
                  : `Batas Waktu Pengembalian: ${formatTanggalIndo(loan.tglJatuhTempo)} (H-${diffDays})`}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                Buku: <span className="font-medium italic">{loan.bukuJudul}</span>
              </div>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Saluran Pengiriman:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChannelChange('WHATSAPP')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  channel === 'WHATSAPP'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp (+{loan.anggotaNoHp})</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelChange('EMAIL')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  channel === 'EMAIL'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="truncate">{loan.anggotaEmail}</span>
              </button>
            </div>
          </div>

          {/* Message Preview and Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Pratinjau Pesan ({channel === 'WHATSAPP' ? 'Format Teks WA' : 'Draf Email'}):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-y"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {channel === 'WHATSAPP'
                ? 'Pesan akan dibuka langsung di WhatsApp Web / Aplikasi via tautan resmi wa.me'
                : 'Pesan email akan dicatat di log notifikasi dan disimulasikan terkirim ke alamat kampus mahasiswa.'}
            </p>
          </div>

          {/* Success / Status Banner */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSend}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
              channel === 'WHATSAPP'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {channel === 'WHATSAPP' ? (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Notifikasi Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
