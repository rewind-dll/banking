import { useState, FormEvent } from 'react';
import { Send, Users, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { fetchNui } from '../hooks/useNui';

interface BankData {
  player: any;
  societies: any[];
  transactions: any[];
}

interface TransferProps {
  bankData: BankData | null;
}

export const Transfer = ({ bankData }: TransferProps) => {
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTransfer = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!targetId || !amount) return;

    const numAmount = Number(amount);
    const numTargetId = Number(targetId);

    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Invalid amount' });
      return;
    }

    if (isNaN(numTargetId)) {
      setMessage({ type: 'error', text: 'Invalid player ID' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetchNui<{ success: boolean; message: string }>(
        'transfer',
        { targetId: numTargetId, amount: numAmount },
        { success: true, message: 'Transfer successful!' }
      );

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setTargetId('');
        setAmount('');
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Transfer failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Transfer Money</h2>
        <p className="text-zinc-400">Send money to other players instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 px-1">Recipient Player ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Users className="text-zinc-600 group-focus-within:text-blue-500 size-5 transition-colors" />
              </div>
              <input
                type="number"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Enter Player ID"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 px-1">Amount to Transfer</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-zinc-600 group-focus-within:text-blue-500 font-bold text-lg transition-colors">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {message && (
            <div className={`rounded-2xl p-4 flex gap-3 items-center ${
              message.type === 'success' 
                ? 'bg-green-500/5 border border-green-500/10' 
                : 'bg-red-500/5 border border-red-500/10'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="text-green-500 shrink-0" size={20} />
              ) : (
                <XCircle className="text-red-500 shrink-0" size={20} />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </p>
            </div>
          )}

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-3">
            <ShieldCheck className="text-blue-500 shrink-0" size={20} />
            <p className="text-zinc-400 text-xs leading-relaxed">
              Secure transfer enabled. Verify the recipient Player ID before proceeding. Transactions are final and cannot be reversed.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !targetId || !amount}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Send size={20} />
                Confirm Transfer
              </>
            )}
          </button>
        </form>

        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex-1 flex flex-col">
            <h3 className="text-white font-bold mb-4">How to Transfer</h3>
            <div className="space-y-4 flex-1">
              <div className="flex gap-4">
                <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="text-white font-medium text-sm">Enter Player ID</p>
                  <p className="text-zinc-500 text-xs mt-1">Ask the recipient for their server ID</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="text-white font-medium text-sm">Specify Amount</p>
                  <p className="text-zinc-500 text-xs mt-1">Enter the amount you want to transfer</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="text-white font-medium text-sm">Confirm</p>
                  <p className="text-zinc-500 text-xs mt-1">Review details and complete the transfer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-500/20 rounded-3xl p-6">
            <h3 className="text-white font-bold mb-2">Instant Transfers</h3>
            <p className="text-zinc-400 text-sm">
              All transfers are processed instantly. The recipient will be notified immediately upon successful transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
