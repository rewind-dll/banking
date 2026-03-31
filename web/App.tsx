import { useState, useCallback, useEffect } from 'react';
import { isDebug, useNuiEvent, fetchNui } from './hooks/useNui';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Transfer } from './components/Transfer';

import { Accounts } from './components/Accounts';
import { History } from './components/History';

interface BankData {
  player: {
    cash: number;
    bank: number;
    dirtyMoney: number;
    name: string;
    identifier: string;
  };
  societies: any[];
  transactions: any[];
}

export default function App() {
  const [visible, setVisible] = useState(isDebug);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bankData, setBankData] = useState<BankData | null>(null);

  useNuiEvent<BankData>('open', (data) => {
    console.log('[NUI] Open event received:', data);
    setVisible(true);
    if (data) {
      setBankData(data);
    }
  });
  
  useNuiEvent('close', () => setVisible(false));
  
  // Update balance from server events
  useNuiEvent('updateBalance', (data: any) => {
    console.log('[NUI] Balance update:', data);
    if (bankData) {
      setBankData({ ...bankData, player: data });
    }
  });
  
  // Update transactions
  useNuiEvent('updateTransactions', (data: any) => {
    console.log('[NUI] Transactions update:', data);
    if (bankData) {
      setBankData({ ...bankData, transactions: data });
    }
  });
  
  // Update societies
  useNuiEvent('updateSocieties', (data: any) => {
    console.log('[NUI] Societies update:', data);
    if (bankData) {
      setBankData({ ...bankData, societies: data });
    }
  });

  const handleClose = useCallback(() => {
    setVisible(false);
    fetchNui('close', {}, { success: true });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: any) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  if (!visible) return null;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-transparent font-sans text-zinc-200 antialiased selection:bg-blue-500/30">
      {/* Tablet Frame */}
      <div className="relative w-[1100px] h-[720px] max-w-[95vw] max-h-[90vh] bg-zinc-950 rounded-[40px] p-4 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-[12px] border-zinc-900 flex overflow-hidden ring-1 ring-white/5">
        
        {/* Screen Content */}
        <div className="flex w-full h-full bg-zinc-950 rounded-[24px] overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onClose={handleClose} />
          
          <main className="flex-1 h-full relative overflow-hidden bg-zinc-950">
            {activeTab === 'dashboard' && <Dashboard bankData={bankData} />}
            {activeTab === 'transfer' && <Transfer bankData={bankData} />}
            {activeTab === 'accounts' && <Accounts bankData={bankData} />}
            {activeTab === 'history' && <History bankData={bankData} />}

            {/* Decorative Ambient Light */}
            <div className="absolute -top-24 -right-24 size-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 size-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
          </main>
        </div>

        {/* Tablet Home Button / Decor */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1.5 w-32 h-1 bg-zinc-800 rounded-full" />
      </div>
    </div>
  );
}
