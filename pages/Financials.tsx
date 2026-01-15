
import React, { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, addDoc, Timestamp, where, doc, deleteDoc } from 'firebase/firestore';
import { keuanganPeciCol, db, formatIDR, parseIDR } from '../services/firebase';
import { FinancialRecord } from '../types';
import { usePlatform } from '../App';

const Financials: React.FC = () => {
  const { platform } = usePlatform();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Income' | 'Expense'>('Income');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [form, setForm] = useState({ 
    category: '', 
    amount: '', 
    description: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    setLoading(true);
    const q = query(keuanganPeciCol, where('platform', '==', platform));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialRecord));
      data.sort((a, b) => b.date.localeCompare(a.date));
      setRecords(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [platform]);

  // Financial Analysis Calculations
  const analysis = useMemo(() => {
    const income = records.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
    const expense = records.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
    const adsExpense = records.filter(r => r.type === 'Expense' && r.category.toLowerCase() === 'iklan').reduce((sum, r) => sum + r.amount, 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      adsExpense,
      adsRatio: expense > 0 ? (adsExpense / expense) * 100 : 0
    };
  }, [records]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCategory = activeTab === 'Income' ? 'Uang Cair' : (isCustomCategory ? form.category : 'Iklan');
      
      await addDoc(keuanganPeciCol, {
        type: activeTab,
        category: finalCategory,
        amount: parseIDR(form.amount),
        description: form.description,
        date: form.date,
        platform: platform,
        timestamp: Timestamp.now()
      });
      
      setForm({ category: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      setIsCustomCategory(false);
    } catch (err) {
      alert('Gagal simpan data keuangan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data ini?')) {
      await deleteDoc(doc(db, 'KEUANGAN PECI', id));
    }
  };

  const btnColor = platform === 'TikTok' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-orange-600 hover:bg-orange-700';
  const focusRing = platform === 'TikTok' ? 'focus:ring-rose-400' : 'focus:ring-orange-500';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">KEUANGAN PECI - {platform}</h1>
        <p className="text-slate-500">Analisa dan pencatatan keuangan operasional peci.</p>
      </header>

      {/* Analysis Cards - Reduced to 3 columns since Profit Bersih is removed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pemasukan</div>
          <div className="text-xl font-bold text-emerald-600">Rp {analysis.totalIncome.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pengeluaran</div>
          <div className="text-xl font-bold text-rose-600">Rp {analysis.totalExpense.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Biaya Iklan</div>
          <div className="text-xl font-bold text-slate-800">Rp {analysis.adsExpense.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-400 mt-1">{analysis.adsRatio.toFixed(1)}% dari total biaya</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6 h-fit sticky top-8">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setActiveTab('Income'); setIsCustomCategory(false); }} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Income
            </button>
            <button 
              onClick={() => setActiveTab('Expense')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'Expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Expense
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'Expense' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Kategori Pengeluaran</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${!isCustomCategory ? `${btnColor} text-white border-transparent` : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    Iklan
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsCustomCategory(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${isCustomCategory ? `${btnColor} text-white border-transparent` : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    Custom (Lainnya)
                  </button>
                </div>
                
                {isCustomCategory && (
                  <input 
                    type="text" 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})} 
                    className={`w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 ${focusRing} animate-in slide-in-from-top-1 duration-200`} 
                    placeholder="Masukkan nama kategori..." 
                    required 
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Jumlah (IDR)</label>
              <input 
                type="text" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: formatIDR(e.target.value)})} 
                className={`w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 ${focusRing}`} 
                placeholder="0" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Keterangan</label>
              <input 
                type="text" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className={`w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 ${focusRing}`} 
                placeholder="Misal: Top up saldo iklan..." 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Tanggal</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
                className={`w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 ${focusRing}`} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] ${activeTab === 'Income' ? 'bg-emerald-600 hover:bg-emerald-700' : btnColor}`}
            >
              Simpan {activeTab === 'Income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50">
            <h3 className="font-bold text-slate-700 text-sm">Riwayat Transaksi</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider">Kategori & Ket</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-[10px] tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-[10px] tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400">Memuat data...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">Belum ada transaksi tercatat.</td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{r.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.category}
                      </span>
                      {r.description && <div className="text-[11px] text-slate-400 mt-1 ml-1">{r.description}</div>}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${r.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.type === 'Income' ? '+' : '-'} Rp {r.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(r.id!)} 
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financials;
