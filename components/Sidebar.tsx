
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { usePlatform, useAuth } from '../App';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { platform, setPlatform } = usePlatform();
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Penjualan', path: '/sales', icon: '📈' },
    { name: 'Keuangan', path: '/financials', icon: '💰' },
    { name: 'Hubungi Kreator', path: '/creators', icon: '💬' },
    { name: 'Pengiriman Sampel', path: '/samples', icon: '📦' },
  ];

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      await signOut(auth);
    }
  };

  const themeClass = platform === 'TikTok' ? 'text-rose-500' : 'text-orange-600';
  const activeBgClass = platform === 'TikTok' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600';

  return (
    <div className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b">
        <h1 className={`text-lg font-bold text-slate-800 flex flex-col gap-0.5`}>
          <span className={`${themeClass} text-xs uppercase tracking-widest`}>Admin Panel</span>
          <span className="flex items-center gap-2">
            <span className="text-xl">🕋</span> Aha Moslem
          </span>
        </h1>
      </div>

      <div className="p-4 border-b">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setPlatform('TikTok')}
            className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${platform === 'TikTok' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
          >
            TikTok
          </button>
          <button
            onClick={() => setPlatform('Shopee')}
            className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${platform === 'Shopee' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500'}`}
          >
            Shopee
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? `${activeBgClass} font-semibold`
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-4">
        {user && (
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Login Sebagai</div>
            <div className="text-xs font-bold text-slate-700 truncate">{user.displayName || user.email}</div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-semibold text-sm"
        >
          <span className="text-xl">🚪</span>
          Keluar
        </button>

        <div className="text-[10px] text-slate-400 text-center">
          © 2024 Aha Moslem Collection
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
