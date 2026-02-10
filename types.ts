
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

export interface Transaction {
  id: string;
  customer_id: string;
  customer_name: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  amount: number;
  currency: string;
  rate: number;
  status: 'COMPLETED' | 'PENDING' | 'SUSPICIOUS' | 'CANCELLED';
  is_suspicious: boolean;
  aml_score?: number;
  aml_reason?: string;
  timestamp: string;
}

export interface MenuItem {
  id: string;
  title: {
    fa: string;
    ps: string;
    en: string;
  };
  icon: string;
  path?: string;
  children?: MenuItem[];
  permission: (UserRole | 'ALL')[];
  badge?: {
    count: number;
    color: 'primary' | 'success' | 'warning' | 'danger';
  };
  isActive: boolean;
  module: string;
}

export interface UserSecurityState {
  is2FAEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin: string;
}

export interface SystemAuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
