
import { Customer, JournalEntry, SystemAuditLog, TransactionType } from '../types';

const KEYS = {
  CUSTOMERS: 'zj_customers_v3', // نسخه جدید برای اطمینان از پاکسازی تداخلات قبلی
  JOURNAL: 'zj_journal_v3',
  LOGS: 'zj_audit_logs_v3',
  CONFIG: 'zj_system_config_v3'
};

export interface SystemConfig {
  company: {
    name: string;
    license: string;
    phone: string;
    address: string;
  };
  currencies: { code: string; symbol: string; isBase: boolean; active: boolean }[];
  expenseCategories: string[];
  branches: { id: string; name: string; active: boolean }[];
  language: 'fa' | 'pa' | 'en';
  calendar: 'solar' | 'gregorian';
}

const DEFAULT_CONFIG: SystemConfig = {
  company: {
    name: "شرکت صرافی و خدمات پولی ذکی جابر",
    license: "AF-LICENSE-7860",
    phone: "+93 700 123 456",
    address: "کابل، سرای شهزاده"
  },
  currencies: [
    { code: 'USD', symbol: '$', isBase: true, active: true },
    { code: 'AFN', symbol: '؋', isBase: false, active: true },
    { code: 'PKR', symbol: 'Rs', isBase: false, active: true },
    { code: 'EUR', symbol: '€', isBase: false, active: true }
  ],
  expenseCategories: ['معاشات', 'کرایه', 'برق و انترنت', 'مالیات', 'متفرقه'],
  branches: [
    { id: 'MAIN', name: 'شعبه مرکزی کابل', active: true },
    { id: 'HERAT', name: 'شعبه هرات', active: true }
  ],
  language: 'fa',
  calendar: 'solar'
};

export const db = {
  // --- Config ---
  getConfig: (): SystemConfig => {
    const data = localStorage.getItem(KEYS.CONFIG);
    if (!data) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    return JSON.parse(data);
  },
  saveConfig: (config: SystemConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
    db.saveLog('ADMIN', 'CONFIG_UPDATE', 'تنظیمات سیستم بروزرسانی شد', 'INFO');
  },

  // --- Customers (KYC) ---
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomer: (c: Customer) => {
    const list = db.getCustomers();
    const newList = [c, ...list];
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(newList));
  },
  updateCustomer: (c: Customer) => {
    const list = db.getCustomers().map(item => item.id === c.id ? c : item);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
  },

  // --- Journal & Transactions ---
  getJournal: (includeDeleted = false): JournalEntry[] => {
    const data = localStorage.getItem(KEYS.JOURNAL);
    const list: JournalEntry[] = data ? JSON.parse(data) : [];
    return includeDeleted ? list : list.filter(item => !item.isDeleted);
  },
  saveEntry: (entry: JournalEntry) => {
    const list = db.getJournal(true);
    const newList = [entry, ...list];
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(newList));
    db.saveLog('SYSTEM', 'TXN_ENTRY', `ثبت ${entry.category}: ${entry.id}`, (entry.debit + entry.credit) > 100000 ? 'WARNING' : 'INFO');
  },
  deleteEntry: (id: string) => {
    const list = db.getJournal(true).map(item => 
      item.id === id ? { ...item, isDeleted: true } : item
    );
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(list));
    db.saveLog('ADMIN', 'TXN_DEL', `حذف رکورد: ${id}`, 'CRITICAL');
  },

  // --- Logs ---
  getLogs: (): SystemAuditLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveLog: (userId: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const logs = db.getLogs();
    const newLog: SystemAuditLog = {
      id: `LOG-${Date.now()}`,
      userId,
      action,
      module: action.split('_')[0],
      details,
      timestamp: new Date().toISOString(),
      severity
    };
    localStorage.setItem(KEYS.LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  },

  getFinancialSummary: () => {
    const entries = db.getJournal();
    const summary: Record<string, { totalIn: number, totalOut: number, balance: number }> = {};
    entries.forEach(e => {
      if (!summary[e.currency]) {
        summary[e.currency] = { totalIn: 0, totalOut: 0, balance: 0 };
      }
      summary[e.currency].totalIn += (e.debit || 0);
      summary[e.currency].totalOut += (e.credit || 0);
      summary[e.currency].balance = summary[e.currency].totalIn - summary[e.currency].totalOut;
    });
    return summary;
  }
};
