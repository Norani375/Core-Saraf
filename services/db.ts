
import { Customer, Transaction, SystemAuditLog, KYCStatus, RiskLevel } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'ems_customers',
  TRANSACTIONS: 'ems_transactions',
  AUDIT_LOGS: 'ems_audit_logs',
  RATES: 'ems_rates'
};

// Initial Mock Data
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-1001', national_id: '102938475', full_name: 'محمد ابراهیم هاشمی', father_name: 'عبدالرحیم', phone: '0700123456', kyc_status: KYCStatus.APPROVED, risk_level: RiskLevel.LOW, registration_date: '۱۴۰۳/۰۱/۱۵' },
  { id: 'CUST-1002', national_id: '556677889', full_name: 'نعمت‌الله وردک', father_name: 'جمعه خان', phone: '0788990011', kyc_status: KYCStatus.PENDING, risk_level: RiskLevel.MEDIUM, registration_date: '۱۴۰۳/۱۲/۰۵' },
];

export const db = {
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  },
  saveCustomer: (customer: Customer) => {
    const customers = db.getCustomers();
    const updated = [customer, ...customers];
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
    db.logAudit('ADMIN', 'CUSTOMER_CREATE', `ثبت مشتری جدید: ${customer.full_name}`, 'INFO');
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransaction: (txn: Transaction) => {
    const txns = db.getTransactions();
    const updated = [txn, ...txns];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    db.logAudit('TELLER', 'TRANSACTION_CREATE', `ثبت معامله: ${txn.id} به مبلغ ${txn.amount} ${txn.currency}`, txn.is_suspicious ? 'CRITICAL' : 'INFO');
  },
  logAudit: (userId: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const logs = db.getAuditLogs();
    const newLog: SystemAuditLog = {
      id: `LOG-${Date.now()}`,
      userId,
      action,
      module: action.split('_')[0],
      details,
      timestamp: new Date().toISOString(),
      severity
    };
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([newLog, ...logs].slice(0, 100)));
  },
  getAuditLogs: (): SystemAuditLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  }
};
