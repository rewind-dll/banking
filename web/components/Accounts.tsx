import { useState, useEffect } from 'react';
import { Wallet, Building2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useNuiEvent, fetchNui } from '../hooks/useNui';

interface PlayerData {
  cash: number;
  bank: number;
  dirtyMoney: number;
  name: string;
}

interface Society {
  name: string;
  jobName: string;
  balance: number;
  isBoss: boolean;
  canWithdraw: boolean;
}

interface BankData {
  player: PlayerData;
  societies: Society[];
  transactions: any[];
}

interface AccountsProps {
  bankData: BankData | null;
}

export const Accounts = ({ bankData }: AccountsProps) => {
  const [playerData, setPlayerData] = useState<PlayerData>({
    cash: 0,
    bank: 0,
    dirtyMoney: 0,
    name: 'Player'
  });
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Update state when bankData changes
  useEffect(() => {
    if (bankData?.player) {
      setPlayerData(bankData.player);
    }
    if (bankData?.societies) {
      setSocieties(bankData.societies);
    }
  }, [bankData]);

  const handleSocietyWithdraw = async (): Promise<void> => {
    if (!selectedSociety || !amount) return;
    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    setIsProcessing(true);
    try {
      await fetchNui(
        'societyWithdraw',
        { society: selectedSociety.jobName, amount: numAmount },
        { success: true, message: 'Withdrawn from society' }
      );
      setAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocietyDeposit = async (): Promise<void> => {
    if (!selectedSociety || !amount) return;
    const numAmount = Number(amount);
    if (numAmount <= 0) return;

    setIsProcessing(true);
    try {
      await fetchNui(
        'societyDeposit',
        { society: selectedSociety.jobName, amount: numAmount },
        { success: true, message: 'Deposited to society' }
      );
      setAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto space-y-8 custom-scrollbar">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Accounts</h2>
          <p className="text-zinc-400">Manage your personal and business accounts</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] flex flex-col gap-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="size-20 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-900/40">
                <Wallet className="text-white size-10" />
              </div>
              <div>
                <h4 className="text-white font-bold text-2xl tracking-tight">Personal Account</h4>
                <p className="text-zinc-500 font-medium text-lg">{playerData.name}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="text-green-500 font-bold text-sm uppercase tracking-widest">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
            <div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Bank Balance</p>
              <p className="text-white font-bold text-3xl tracking-tight">${playerData.bank.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Cash</p>
              <p className="text-white font-bold text-3xl tracking-tight">${playerData.cash.toLocaleString()}</p>
            </div>
            {playerData.dirtyMoney > 0 && (
              <div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Dirty Money</p>
                <p className="text-white font-bold text-3xl tracking-tight">${playerData.dirtyMoney.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {societies.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Business Accounts</h3>
          <div className="grid grid-cols-1 gap-4">
            {societies.map((society) => (
              <div
                key={society.jobName}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="size-14 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
                      <Building2 className="text-white size-7" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{society.name}</h4>
                      <p className="text-zinc-500 text-sm">
                        {society.isBoss ? 'Boss Account' : 'Employee Access'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs uppercase mb-1">Balance</p>
                    <p className="text-white font-bold text-2xl">${society.balance.toLocaleString()}</p>
                  </div>
                </div>

                {selectedSociety?.jobName === society.jobName ? (
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-600 transition-all placeholder:text-zinc-600"
                    />
                    <div className="flex gap-3">
                      {society.canWithdraw && (
                        <button
                          onClick={handleSocietyWithdraw}
                          disabled={isProcessing || !amount}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight size={18} />
                          Withdraw
                        </button>
                      )}
                      <button
                        onClick={handleSocietyDeposit}
                        disabled={isProcessing || !amount}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <ArrowDownLeft size={18} />
                        Deposit
                      </button>
                      <button
                        onClick={() => setSelectedSociety(null)}
                        className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedSociety(society)}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all mt-4"
                  >
                    Manage Account
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
