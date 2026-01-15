
import React, { useEffect, useState, useMemo } from 'react';
import { onSnapshot, query, where } from 'firebase/firestore';
import { omsetPeciCol } from '../services/firebase';
import { SalesRecord } from '../types';
import { usePlatform } from '../App';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

const Dashboard: React.FC = () => {
  const { platform } = usePlatform();
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Date filter state: Default to last 30 days
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    setLoading(true);
    const q = query(
      omsetPeciCol, 
      where('platform', '==', platform),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesRecord));
      data.sort((a, b) => a.date.localeCompare(b.date));
      setSalesData(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [platform, startDate, endDate]);

  // Simplified Calculations
  const totals = useMemo(() => {
    const revenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
    const items = salesData.reduce((acc, curr) => acc + curr.itemsSold, 0);
    return { revenue, items };
  }, [salesData]);

  const themeColor = platform === 'TikTok' ? '#f43f5e' : '#ea580c';
  const accentColor = platform === 'TikTok' ? 'text-rose-500' : 'text-orange-600';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>🕋</span> Dashboard {platform}
          </h1>
          <p className="text-slate-500 text-sm">Analisa Omset dan Penjualan Peci.</p>
        </div>

        {/* Small Date Filter UI */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm self-start md:self-auto hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Dari</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border-none bg-transparent focus:ring-0 p-0 font-medium text-slate-700 outline-none cursor-pointer"
            />
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sampai</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border-none bg-transparent focus:ring-0 p-0 font-medium text-slate-700 outline-none cursor-pointer"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-800"></div>
          <p className="text-slate-400 text-sm font-medium">Menganalisa Data...</p>
        </div>
      ) : (
        <>
          {/* Main Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm group hover:shadow-md transition-shadow">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Omset</div>
              <div className={`text-3xl font-bold ${accentColor} mt-1`}>Rp {totals.revenue.toLocaleString('id-ID')}</div>
              <div className="h-1 w-12 bg-slate-100 mt-4 rounded-full group-hover:w-full transition-all duration-500"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm group hover:shadow-md transition-shadow">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Peci Terjual</div>
              <div className="text-3xl font-bold text-blue-600 mt-1">{totals.items.toLocaleString('id-ID')} Peci</div>
              <div className="h-1 w-12 bg-slate-100 mt-4 rounded-full group-hover:w-full transition-all duration-500"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Tren Omset (Area Chart) */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500">📈</span> Analisa Tren Omset
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp ${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any) => [`Rp ${val.toLocaleString('id-ID')}`, 'Omset']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke={themeColor} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Volume Penjualan Peci (Bar Chart) */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">📦</span> Volume Penjualan Peci
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: any) => [`${val.toLocaleString('id-ID')} Peci`, 'Terjual']}
                    />
                    <Bar dataKey="itemsSold" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Peci Terjual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {salesData.length === 0 && (
            <div className="p-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-slate-400 font-medium">Tidak ada data ditemukan untuk periode ini.</p>
              <button 
                onClick={() => { setStartDate(thirtyDaysAgo); setEndDate(today); }}
                className="mt-4 text-xs font-bold text-blue-600 hover:underline"
              >
                Reset Filter Tanggal
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
