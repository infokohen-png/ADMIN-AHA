
import React, { useState, useEffect } from 'react';
import { onSnapshot, query, where, addDoc, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { kreatorPeciCol, db, formatIDR, parseIDR } from '../services/firebase';
import { Creator } from '../types';
import { draftCreatorMessage } from '../services/geminiService';
import { getStoreSettingsByPlatform } from '../services/firebase';
import { usePlatform } from '../App';

const CreatorContact: React.FC = () => {
  const { platform } = usePlatform();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [productName, setProductName] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [storeName, setStoreName] = useState('Aha Moslem Collection');

  const [newCreator, setNewCreator] = useState({
    name: '',
    followers: '',
    contactSource: 'TikTok' as 'TikTok' | 'WhatsApp',
    waNumber: ''
  });

  useEffect(() => {
    getStoreSettingsByPlatform(platform).then(settings => {
      if (settings && (settings as any).storeName) setStoreName((settings as any).storeName);
    });

    const q = query(kreatorPeciCol, where('platform', '==', platform));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Creator));
      setCreators(data);
    });
    return () => unsubscribe();
  }, [platform]);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(kreatorPeciCol, {
        name: newCreator.name,
        followers: parseIDR(newCreator.followers),
        contactSource: newCreator.contactSource,
        waNumber: newCreator.contactSource === 'WhatsApp' ? newCreator.waNumber : '',
        platform,
        timestamp: Timestamp.now()
      });
      setNewCreator({ name: '', followers: '', contactSource: 'TikTok', waNumber: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Gagal');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Hapus kreator ini?')) {
      await deleteDoc(doc(db, 'KREATOR PECI', id));
      if (selectedCreator?.id === id) setSelectedCreator(null);
    }
  };

  const handleDraftMessage = async () => {
    if (!selectedCreator || !productName) return;
    setLoading(true);
    const result = await draftCreatorMessage(selectedCreator.name, storeName, productName);
    setDraft(result);
    setLoading(false);
  };

  const btnColor = platform === 'TikTok' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-orange-600 hover:bg-orange-700';
  const accentText = platform === 'TikTok' ? 'text-rose-600' : 'text-orange-600';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">KREATOR PECI - {platform}</h1>
          <p className="text-slate-500">Daftar kreator untuk kolaborasi peci.</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className={`${btnColor} text-white font-bold px-4 py-2 rounded-lg shadow-sm`}>+ Kreator</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700">Daftar Kreator</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {creators.map(c => (
              <div key={c.id} onClick={() => setSelectedCreator(c)} className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedCreator?.id === c.id ? 'bg-slate-800 text-white shadow-lg' : 'bg-white hover:bg-slate-50'}`}>
                <div>
                  <div className="font-bold">@{c.name}</div>
                  <div className={`text-xs ${selectedCreator?.id === c.id ? 'text-slate-300' : accentText}`}>
                    {c.followers.toLocaleString('id-ID')} Followers
                  </div>
                </div>
                <button onClick={(e) => handleDelete(e, c.id!)} className="text-rose-400 hover:text-rose-600 p-1">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCreator ? (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <h3 className="font-bold text-lg">Draft Undangan untuk @{selectedCreator.name}</h3>
              <input type="text" placeholder="Nama Produk (Misal: Peci Songkok Premium)" className="w-full border p-2 rounded-lg" value={productName} onChange={e => setProductName(e.target.value)} />
              <button onClick={handleDraftMessage} disabled={loading || !productName} className={`w-full ${btnColor} text-white py-2 rounded-lg font-bold disabled:opacity-50`}>{loading ? 'Menghubungi AI...' : 'Tulis Pesan (AI)'}</button>
              {draft && <textarea rows={8} className="w-full border p-4 rounded-xl text-sm bg-slate-50" value={draft} onChange={e => setDraft(e.target.value)} />}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-xl text-slate-400">Pilih kreator untuk mulai.</div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Kreator Baru</h3>
              <button onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCreator} className="space-y-4">
              <input required placeholder="Username" value={newCreator.name} onChange={e => setNewCreator({...newCreator, name: e.target.value})} className="w-full border p-2 rounded-lg" />
              <input required placeholder="Followers" value={newCreator.followers} onChange={e => setNewCreator({...newCreator, followers: formatIDR(e.target.value)})} className="w-full border p-2 rounded-lg" />
              <select value={newCreator.contactSource} onChange={e => setNewCreator({...newCreator, contactSource: e.target.value as any})} className="w-full border p-2 rounded-lg">
                <option value="TikTok">TikTok</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              {newCreator.contactSource === 'WhatsApp' && <input placeholder="0812..." value={newCreator.waNumber} onChange={e => setNewCreator({...newCreator, waNumber: e.target.value})} className="w-full border p-2 rounded-lg" />}
              <button type="submit" className={`w-full ${btnColor} text-white py-2 rounded-lg font-bold`}>Daftarkan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorContact;
