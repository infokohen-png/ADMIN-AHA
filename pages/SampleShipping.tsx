
import React, { useState, useEffect } from 'react';
import { onSnapshot, query, addDoc, updateDoc, doc, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { alamatPeciCol, kreatorPeciCol, db } from '../services/firebase';
import { SampleShipment, Creator } from '../types';
import { usePlatform } from '../App';

const SampleShipping: React.FC = () => {
  const { platform } = usePlatform();
  const [samples, setSamples] = useState<SampleShipment[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    creatorId: '',
    creatorName: '',
    itemName: '',
    address: '',
    status: 'Pending' as SampleShipment['status']
  });

  useEffect(() => {
    const qS = query(alamatPeciCol, where('platform', '==', platform));
    const unsubS = onSnapshot(qS, (snap) => setSamples(snap.docs.map(d => ({id: d.id, ...d.data()} as SampleShipment))));

    const qC = query(kreatorPeciCol, where('platform', '==', platform));
    const unsubC = onSnapshot(qC, (snap) => setCreators(snap.docs.map(d => ({id: d.id, ...d.data()} as Creator))));

    return () => { unsubS(); unsubC(); };
  }, [platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(alamatPeciCol, { ...form, platform, date: new Date().toISOString().split('T')[0], timestamp: Timestamp.now() });
    setShowModal(false);
    setForm({ creatorId: '', creatorName: '', itemName: '', address: '', status: 'Pending' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus pengiriman?')) await deleteDoc(doc(db, 'ALAMAT PECI', id));
  };

  const updateStatus = async (id: string, newStatus: any) => {
    await updateDoc(doc(db, 'ALAMAT PECI', id), { status: newStatus });
  };

  const btnColor = platform === 'TikTok' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-orange-600 hover:bg-orange-700';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ALAMAT PECI - {platform}</h1>
          <p className="text-slate-500">Kelola pengiriman sampel peci ke kreator.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={`${btnColor} text-white font-bold px-4 py-2 rounded-lg`}>+ Pengiriman</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {samples.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-3 relative group">
            <button onClick={() => handleDelete(s.id!)} className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">🗑️</button>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{s.date}</div>
            <h3 className="font-bold text-lg">@{s.creatorName}</h3>
            <p className="text-sm">📦 {s.itemName}</p>
            <div className="text-xs bg-slate-50 p-2 rounded border">{s.address}</div>
            <select value={s.status} onChange={e => updateStatus(s.id!, e.target.value)} className="w-full text-xs border p-2 rounded-lg bg-white">
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold mb-4">Input Pengiriman</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required value={form.creatorId} onChange={e => { const c = creators.find(x => x.id === e.target.value); if(c) setForm({...form, creatorId: c.id!, creatorName: c.name}); }} className="w-full border p-2 rounded-lg">
                <option value="">Pilih Kreator</option>
                {creators.map(c => <option key={c.id} value={c.id}>@{c.name}</option>)}
              </select>
              <input required placeholder="Nama Produk" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})} className="w-full border p-2 rounded-lg" />
              <textarea required placeholder="Alamat Lengkap" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-2 rounded-lg" rows={3} />
              <button type="submit" className={`w-full ${btnColor} text-white py-2 rounded-lg font-bold`}>Kirim Sampel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleShipping;
