import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Banknote } from 'lucide-react';
import { useNuiEvent, fetchNui } from '../hooks/useNui';

interface PlayerData {
  cash: number;
  bank: number;
  dirtyMoney: number;
  name: string;
  identifier: string;
}

interface Transaction {
  id: number;
  transaction_type: string;
  amount: number;
  timestamp: string;
  target_identifier?: string;
}

interface BankData {
  player: PlayerData;
  societies: any[];
  transactions: Transaction[];
}

interface DashboardProps {
  bankData: BankData | null;
}

export const Dashboard = ({ bankData }: DashboardProps) => {
  const [playerData, setPlayerData] = useState<PlayerData>({
    cash: 0,
    bank: 0,
    dirtyMoney: 0,
    name: 'Player',
    identifier: ''
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Update state when bankData prop changes
  useEffect(() => {
    if (bankData?.player) {
      setPlayerData(bankData.player);
    }
    if (bankData?.transactions) {
      setTransactions(bankData.transactions.slice(0, 4));
    }
  }, [bankData]);

  const handleDeposit = async (): Promise<void> => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;

    setIsDepositing(true);
    try {
      const response = await fetchNui<{ success: boolean; message: string; data?: PlayerData }>(
        'deposit',
        { amount, accountType: 'cash' },
        { success: true, message: 'Deposited successfully', data: { ...playerData, bank: playerData.bank + amount, cash: playerData.cash - amount } }
      );
      
      if (response.success) {
        setDepositAmount('');
      }
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async (): Promise<void> => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;

    setIsWithdrawing(true);
    try {
      const response = await fetchNui<{ success: boolean; message: string; data?: PlayerData }>(
        'withdraw',
        { amount, accountType: 'cash' },
        { success: true, message: 'Withdrawn successfully', data: { ...playerData, bank: playerData.bank - amount, cash: playerData.cash + amount } }
      );
      
      if (response.success) {
        setWithdrawAmount('');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatType = (type: string): string => {
    const types: Record<string, string> = {
      deposit_cash: 'Cash Deposit',
      deposit_dirty: 'Dirty Money Deposit',
      withdraw_cash: 'Cash Withdrawal',
      withdraw_dirty: 'Dirty Money Withdrawal',
      transfer_sent: 'Transfer Sent',
      transfer_received: 'Transfer Received',
      society_deposit: 'Society Deposit',
      society_withdraw: 'Society Withdrawal'
    };
    return types[type] || type;
  };

  const totalBalance = playerData.bank + playerData.cash + playerData.dirtyMoney;

  return (
    <div className="p-8 h-full overflow-y-auto space-y-8 custom-scrollbar">
      <header>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {playerData.name}</h2>
        <p className="text-zinc-400">Manage your finances securely.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-xl shadow-blue-900/20 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 font-medium mb-1 uppercase tracking-wider text-xs">Bank Balance</p>
              <h3 className="text-4xl font-bold text-white">${playerData.bank.toLocaleString()}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <DollarSign className="text-white size-6" />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <input
                type="number"
                placeholder="Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-blue-200/60 outline-none text-sm mb-2"
              />
              <button 
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount}
                className="w-full bg-white text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
              >
                {isDepositing ? 'Processing...' : 'Deposit'}
              </button>
            </div>
            <div className="flex-1 bg-blue-500/20 backdrop-blur-sm rounded-xl p-4">
              <input
                type="number"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-transparent text-white placeholder:text-blue-200/60 outline-none text-sm mb-2"
              />
              <button 
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount}
                className="w-full bg-white/90 text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm"
              >
                {isWithdrawing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="size-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="text-green-500 size-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium uppercase">Cash</p>
              <p className="text-white font-bold text-lg">${playerData.cash.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="size-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Banknote className="text-blue-500 size-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-xs font-medium uppercase">Total Balance</p>
              <p className="text-white font-bold text-lg">${totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-white">Recent Transactions</h4>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center">
              <p className="text-zinc-500">No recent transactions</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isIncome = tx.transaction_type.includes('received') || tx.transaction_type.includes('deposit');
              return (
                <div key={tx.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      isIncome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {isIncome ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{formatType(tx.transaction_type)}</p>
                      <p className="text-zinc-500 text-xs">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${isIncome ? 'text-green-500' : 'text-zinc-200'}`}>
                    {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
