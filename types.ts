
export type Platform = 'TikTok' | 'Shopee';

export interface StoreSettings {
  storeName: string;
  adminName: string;
  platform: Platform;
}

export interface SalesRecord {
  id?: string;
  date: string;
  revenue: number;
  itemsSold: number;
  platform: Platform;
  timestamp: any;
}

export interface FinancialRecord {
  id?: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  platform: Platform;
  timestamp: any;
}

export interface SampleShipment {
  id?: string;
  creatorId: string; // Linked to Creator collection
  creatorName: string;
  itemName: string;
  address: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Returned';
  trackingNumber?: string;
  date: string;
  platform: Platform;
}

export interface Creator {
  id?: string;
  name: string;
  followers: number;
  contactSource: 'TikTok' | 'WhatsApp';
  waNumber?: string;
  platform: Platform;
  timestamp: any;
}
