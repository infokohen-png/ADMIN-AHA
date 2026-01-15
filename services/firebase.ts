
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, setDoc, onSnapshot, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Platform } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAOAf-kxpVVV4XMZl3DdFd02_LeTrpYOSg",
  authDomain: "olah-data-f30c7.firebaseapp.com",
  projectId: "olah-data-f30c7",
  storageBucket: "olah-data-f30c7.firebasestorage.app",
  messagingSenderId: "427010174214",
  appId: "1:427010174214:web:94f5507545260702fd0287",
  measurementId: "G-MHXZ7DBV4N"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Updated Collection References
export const omsetPeciCol = collection(db, 'OMSET PECI');
export const keuanganPeciCol = collection(db, 'KEUANGAN PECI');
export const kreatorPeciCol = collection(db, 'KREATOR PECI');
export const alamatPeciCol = collection(db, 'ALAMAT PECI');
export const settingsCol = collection(db, 'settings');

// Helper for number formatting (thousands separator)
export const formatIDR = (val: string | number) => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
  if (!num) return '';
  return new Intl.NumberFormat('id-ID').format(Number(num));
};

export const parseIDR = (formattedVal: string) => {
  return Number(formattedVal.replace(/\./g, '')) || 0;
};

// Helpers for Settings
export const getStoreSettingsByPlatform = async (platform: Platform) => {
  const q = query(settingsCol, where('platform', '==', platform));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

export const updateStoreSettingsByPlatform = async (platform: Platform, data: any) => {
  const docId = `config_${platform.toLowerCase()}`;
  const docRef = doc(db, 'settings', docId);
  await setDoc(docRef, { ...data, platform }, { merge: true });
};
