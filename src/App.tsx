import React, { useState } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { ActiveTab } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { PeminjamanView } from './components/PeminjamanView';
import { PengembalianView } from './components/PengembalianView';
import { MonitoringNotifikasiView } from './components/MonitoringNotifikasiView';
import { KatalogBukuView } from './components/KatalogBukuView';
import { DataAnggotaView } from './components/DataAnggotaView';
import { MasterRakKategoriView } from './components/MasterRakKategoriView';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [returnSelectedLoanId, setReturnSelectedLoanId] = useState<string | undefined>(undefined);

  const handleSelectReturnLoan = (loanId: string) => {
    setReturnSelectedLoanId(loanId);
    setActiveTab('kembali');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'kembali') {
            setReturnSelectedLoanId(undefined);
          }
        }}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Mobile backdrop overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Header with Calendar Simulator */}
        <TopHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'buku' && <KatalogBukuView />}

          {activeTab === 'anggota' && <DataAnggotaView />}

          {activeTab === 'rak' && <MasterRakKategoriView type="rak" />}

          {activeTab === 'kategori' && <MasterRakKategoriView type="kategori" />}

          {activeTab === 'pinjam' && (
            <PeminjamanView
              setActiveTab={setActiveTab}
              onSelectReturnLoan={handleSelectReturnLoan}
            />
          )}

          {activeTab === 'kembali' && (
            <PengembalianView initialSelectedLoanId={returnSelectedLoanId} />
          )}

          {activeTab === 'monitoring' && <MonitoringNotifikasiView />}

          {activeTab === 'laporan' && <LaporanView />}

          {activeTab === 'pengaturan' && <PengaturanView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
