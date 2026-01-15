
import React, { createContext, useState, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import CreatorContact from './pages/CreatorContact';
import SampleShipping from './pages/SampleShipping';
import Financials from './pages/Financials';
import Login from './pages/Login';
import { Platform } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

interface PlatformContextType {
  platform: Platform;
  setPlatform: (p: Platform) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
};

const App: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('TikTok');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Menghubungkan ke server...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <PlatformContext.Provider value={{ platform, setPlatform }}>
        <Router>
          {user ? (
            <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/financials" element={<Financials />} />
                  <Route path="/creators" element={<CreatorContact />} />
                  <Route path="/samples" element={<SampleShipping />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </Router>
      </PlatformContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
