
export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COMPLIANCE = 'COMPLIANCE',
  TELLER = 'TELLER',
  TREASURY = 'TREASURY'
}

export type TransactionType = 
  | 'EXCHANGE_BUY' 
  | 'EXCHANGE_SELL' 
  | 'HAWALA_SEND' 
  | 'HAWALA_RECEIVE' 
  | 'HAWALA_CANCEL'
  | 'EXPENSE' 
  | 'CASH_IN' 
  | 'CASH_OUT'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'TRANSFER_INTERNAL'
  | 'DAB_AUCTION_BUY'
  | 'TAX_PAYMENT'
  | 'CAPITAL_DEPOSIT';

export interface Customer {
  id: string;
  national_id: string;
  full_name: string;
  father_name: string;
  phone: string;
  kyc_status: KYCStatus;
  risk_level: RiskLevel;
  registration_date: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  category: TransactionType;
  debit: number; // رسید (+)
  credit: number; // برد (-)
  currency: string;
  rate: number;
  customerId?: string;
  customerName?: string;
  // added missing properties to support Hawala (Remittance) tracking
  agentName?: string;
  commission?: number;
  isDeleted?: boolean;
  isReversed?: boolean;
  reversedFromId?: string;
}

export interface MenuItem {
  id: string;
  title: { fa: string; en: string; };
  icon: string;
  path?: string;
  children?: MenuItem[];
  permission: (UserRole | 'ALL')[];
  isActive: boolean;
}

/**
 * Transaction interface for high-level module state and search results.
 * Used across TransactionModule and specialized reporting services.
 */
export interface Transaction {
  id: string;
  customer_id: string;
  customer_name: string;
  type: string;
  amount: number;
  currency: string;
  rate: number;
  status: string;
  is_suspicious: boolean;
  aml_score?: number;
  aml_reason?: string;
  timestamp: string;
}

/**
 * SystemAuditLog interface for tracking administrative and security actions.
 * Integral for compliance and AML monitoring dashboards.
 */
export interface SystemAuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
