
import { Customer, Transaction, SystemAuditLog, KYCStatus, RiskLevel } from '../types';

// این فایل شبیه‌ساز دیتابیس و لایه سرویس‌های Node.js است
const STORAGE_KEYS = {
  CUSTOMERS: 'ems_customers_v2',
  TRANSACTIONS: 'ems_transactions_v2',
  AUDIT_LOGS: 'ems_audit_logs_v2',
  USERS: 'ems_users_v2'
};

class MockDatabase {
  private static instance: MockDatabase;
  private constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new MockDatabase();
    return this.instance;
  }

  get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  save<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// --- Customer Service ---
export const CustomerService = {
  list: () => MockDatabase.getInstance().get<Customer>(STORAGE_KEYS.CUSTOMERS),
  create: (customer: Customer) => {
    const db = MockDatabase.getInstance();
    const data = db.get<Customer>(STORAGE_KEYS.CUSTOMERS);
    db.save(STORAGE_KEYS.CUSTOMERS, [customer, ...data]);
    AuditService.log('ADMIN', 'CUSTOMER_CREATE', `مشتری ${customer.full_name} ثبت شد`);
  }
};

// --- Transaction Service ---
export const TransactionService = {
  list: () => MockDatabase.getInstance().get<Transaction>(STORAGE_KEYS.TRANSACTIONS),
  create: (txn: Transaction) => {
    const db = MockDatabase.getInstance();
    const data = db.get<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    db.save(STORAGE_KEYS.TRANSACTIONS, [txn, ...data]);
    AuditService.log('TELLER', 'TXN_CREATE', `معامله ${txn.id} به مبلغ ${txn.amount} ثبت شد`, txn.is_suspicious ? 'CRITICAL' : 'INFO');
  }
};

// --- Audit Service ---
export const AuditService = {
  log: (userId: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
    const db = MockDatabase.getInstance();
    const logs = db.get<SystemAuditLog>(STORAGE_KEYS.AUDIT_LOGS);
    const newLog: SystemAuditLog = {
      id: `LOG-${Date.now()}`,
      userId,
      action,
      module: action.split('_')[0],
      details,
      timestamp: new Date().toISOString(),
      severity
    };
    db.save(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs].slice(0, 100));
  },
  getLogs: () => MockDatabase.getInstance().get<SystemAuditLog>(STORAGE_KEYS.AUDIT_LOGS)
};

// --- Compliance Service (AML Logic) ---
export const ComplianceService = {
  checkRisk: (amount: number, currency: string, history: Transaction[]) => {
    // شبیه‌سازی منطق AML در بک‌اکند
    const threshold = 10000; // سقف ۱۰ هزار دلار برای گزارش اجباری
    if (amount >= threshold && currency === 'USD') return true;
    return false;
  }
};
