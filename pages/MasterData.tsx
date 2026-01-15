
import React, { useState, useEffect } from 'react';
import { getStoreSettingsByPlatform, updateStoreSettingsByPlatform } from '../services/firebase';
import { StoreSettings } from '../types';
import { usePlatform } from '../App';

const MasterData: React.FC = () => {
  const { platform } = usePlatform();
  const [settings, setSettings] = useState<StoreSettings>({ storeName: '', adminName: '', platform });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await getStoreSettingsByPlatform(platform);
      if (data) {
        setSettings(data as StoreSettings);
      } else {
        setSettings({ storeName: '', adminName: '', platform });
      }
    };
    loadData();
  }, [platform]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettingsByPlatform(platform, settings);
      setMessage(`Pengaturan ${platform} berhasil disimpan!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const btnColor = platform === 'TikTok' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-orange-600 hover:bg-orange-700';
  const focusRing = platform === 'TikTok' ? 'focus:ring-rose-400' : 'focus:ring-orange-500';
  const msgColor = platform === 'TikTok' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600';

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Master Data {platform}</h1>
        <p className="text-slate-500">Konfigurasi profil admin dan nama toko khusus untuk platform {platform}.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg mb-4">
          <span className="text-2xl">{platform === 'TikTok' ? '🔴' : '🟠'}</span>
          <div>
            <div className="text-sm font-bold">Platform Aktif</div>
            <div className="text-xs text-slate-500">Anda sedang mengedit data untuk {platform}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Toko ({platform})</label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${focusRing} outline-none transition-all`}
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            placeholder={`Contoh: ${platform} Store Official`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Admin</label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${focusRing} outline-none transition-all`}
            value={settings.adminName}
            onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
            placeholder="Nama lengkap pengelola"
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.includes('Gagal') ? 'bg-red-50 text-red-600' : msgColor}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full ${btnColor} text-white font-bold py-3 rounded-lg disabled:bg-slate-300 transition-colors`}
        >
          {saving ? 'Menyimpan...' : `Simpan Perubahan ${platform}`}
        </button>
      </form>
    </div>
  );
};

export default MasterData;
