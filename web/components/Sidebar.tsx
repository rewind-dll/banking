import React from 'react';
import { LayoutDashboard, CreditCard, Send, History, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accounts', label: 'Account', icon: CreditCard },
  { id: 'transfer', label: 'Transfer', icon: Send },
  { id: 'history', label: 'History', icon: History },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onClose }) => {
  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6 h-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
          <CreditCard className="text-white size-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">MAZE<span className="text-blue-500">BANK</span></span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <item.icon className={`size-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <button 
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="size-5" />
          <span className="font-medium">Close</span>
        </button>
      </div>
    </div>
  );
};
