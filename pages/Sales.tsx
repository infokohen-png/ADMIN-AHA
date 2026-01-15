
import React, { useState, useEffect } from 'react';
import { onSnapshot, query, addDoc, Timestamp, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { omsetPeciCol, db, formatIDR, parseIDR } from '../services/firebase';
import { SalesRecord } from '../types';
import { usePlatform } from '../App';

const Sales: React.FC = () => {
  const { platform } = usePlatform();
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    revenue: '', 
    itemsSold: '' 
  });

  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);
  const [editForm, setEditForm] = useState({ 
    date: '', 
    revenue: '', 
    itemsSold: '' 
  });

  useEffect(() => {
    setLoading(true);
    const q = query(omsetPeciCol, where('platform', '==', platform));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesRecord));
      data.sort((a, b) => b.date.localeCompare(a.date));
      setSales(data);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });
    return () => unsubscribe();
  }, [platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(omsetPeciCol, {
        date: form.date,
        revenue: parseIDR(form.revenue),
        itemsSold: Number(form.itemsSold.replace(/\D/g, '')),
        platform: platform,
        timestamp: Timestamp.now()
      });
      setForm({ date: new Date().toISOString().split('T')[0], revenue: '', itemsSold: '' });
    } catch (err) {
      alert('Gagal menambah data');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord?.id) return;
    try {
      const docRef = doc(db, 'OMSET PECI', editingRecord.id);
      await updateDoc(docRef, {
        date: editForm.date,
        revenue: parseIDR(editForm.revenue),
        itemsSold: Number(editForm.itemsSold.replace(/\D/g, ''))
      });
      setEditingRecord(null);
    } catch (err) {
      alert('Gagal memperbarui data');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data ini?')) {
      await deleteDoc(doc(db, 'OMSET PECI', id));
    }
  };

  const btnColor = platform === 'TikTok' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-orange-600 hover:bg-orange-700';
  const focusRing = platform === 'TikTok' ? 'focus:ring-rose-400' : 'focus:ring-orange-500';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">OMSET PECI - {platform}</h1>
        <p className="text-slate-500">Kelola riwayat omset peci harian.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm space-y-4 h-fit sticky top-8">
          <h3 className="font-bold text-slate-700">Tambah Omset</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 ${focusRing}`} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Omset (IDR)</label>
            <input 
              type="text" 
              placeholder="Contoh: 1.000.000" 
              value={form.revenue} 
              onChange={e => setForm({...form, revenue: formatIDR(e.target.value)})} 
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 ${focusRing}`} 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Barang Terjual</label>
            <input 
              type="text" 
              placeholder="0" 
              value={form.itemsSold} 
              onChange={e => setForm({...form, itemsSold: formatIDR(e.target.value)})} 
              className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 ${focusRing}`} 
              required 
            />
          </div>
          <button type="submit" className={`w-full ${btnColor} text-white font-bold py-2 rounded-lg shadow-sm transition-all`}>Simpan Data</button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Tanggal</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Omset</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Terjual</th>
                <th className="px-6 py-4 text-right text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center">Memuat...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-400 italic">Belum ada data.</td></tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{s.date}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">Rp {s.revenue.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{s.itemsSold.toLocaleString('id-ID')} Unit</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setEditingRecord(s); setEditForm({ date: s.date, revenue: formatIDR(s.revenue), itemsSold: formatIDR(s.itemsSold) }); }} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(s.id!)} className="text-rose-600 hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Edit OMSET PECI</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full border p-2 rounded-lg" required />
              <input type="text" value={editForm.revenue} onChange={e => setEditForm({...editForm, revenue: formatIDR(e.target.value)})} className="w-full border p-2 rounded-lg" placeholder="Omset" required />
              <input type="text" value={editForm.itemsSold} onChange={e => setEditForm({...editForm, itemsSold: formatIDR(e.target.value)})} className="w-full border p-2 rounded-lg" placeholder="Terjual" required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingRecord(null)} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold">Batal</button>
                <button type="submit" className={`flex-1 ${btnColor} text-white py-2 rounded-lg font-bold`}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
