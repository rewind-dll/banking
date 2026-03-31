import { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { useNuiEvent } from '../hooks/useNui';

interface Transaction {
  id: number;
  transaction_type: string;
  amount: number;
  timestamp: string;
  target_identifier?: string;
  society?: string;
}

interface BankData {
  player: any;
  societies: any[];
  transactions: Transaction[];
}

interface HistoryProps {
  bankData: BankData | null;
}

export const History = ({ bankData }: HistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Update transactions when bankData changes
  useEffect(() => {
    if (bankData?.transactions) {
      setTransactions(bankData.transactions);
    }
  }, [bankData]);

  const formatType = (type: string): string => {
    const types: Record<string, string> = {
      deposit_cash: 'Cash Deposit',
      deposit_dirty: 'Dirty Money Deposit',
      withdraw_cash: 'Cash Withdrawal',
      withdraw_dirty: 'Dirty Money Withdrawal',
      transfer_sent: 'Transfer Sent',
      transfer_received: 'Transfer Received',
      society_deposit: 'Society Deposit',
      society_withdraw: 'Society Withdrawal',
      admin_add: 'Admin Credit',
      admin_remove: 'Admin Debit'
    };
    return types[type] || type;
  };

  const getCategory = (type: string): string => {
    if (type.includes('transfer')) return 'Transfer';
    if (type.includes('society')) return 'Business';
    if (type.includes('deposit') || type.includes('withdraw')) return 'Banking';
    if (type.includes('admin')) return 'System';
    return 'Other';
  };

  const isIncome = (type: string): boolean => {
    return type.includes('received') || type.includes('deposit') || type.includes('admin_add');
  };

  const filteredTransactions = transactions.filter((tx) =>
    formatType(tx.transaction_type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Transaction History</h2>
          <p className="text-zinc-400">Review your financial activity</p>
        </div>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 size-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-zinc-600"
          />
        </div>
        <button className="bg-zinc-900 border border-zinc-800 px-4 rounded-xl text-zinc-400 hover:text-white transition-colors">
          <Filter size={20} />
        </button>
        <button className="bg-zinc-900 border border-zinc-800 px-4 rounded-xl text-zinc-400 hover:text-white transition-colors">
          <Calendar size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-2xl text-center">
              <p className="text-zinc-500 text-lg">
                {searchTerm ? 'No matching transactions found' : 'No transaction history yet'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const income = isIncome(tx.transaction_type);
              return (
                <div
                  key={tx.id}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center ${
                        income ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {income ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{formatType(tx.transaction_type)}</p>
                      <p className="text-zinc-500 text-xs">
                        {new Date(tx.timestamp).toLocaleString()} • {getCategory(tx.transaction_type)}
                      </p>
                      {tx.society && (
                        <p className="text-blue-500 text-xs mt-0.5">{tx.society}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        income ? 'text-green-500' : 'text-zinc-200'
                      }`}
                    >
                      {income ? '+' : '-'}$
                      {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                      Completed
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
