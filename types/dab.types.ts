
export enum ReportType {
  DAILY = 'DAILY_TRANSACTION_REPORT',
  MONTHLY = 'MONTHLY_CONSOLIDATED',
  SAR = 'SUSPICIOUS_ACTIVITY_REPORT',
  CTR = 'CASH_THRESHOLD_REPORT'
}

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  VALIDATING = 'VALIDATING',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface DABReport {
  id: string;
  type: ReportType;
  period: string; // e.g. "1403-12-07"
  generatedAt: string;
  status: SubmissionStatus;
  xmlContent?: string;
  dabReference?: string;
  metadata: {
    totalTransactions: number;
    totalVolumeUSD: number;
    suspiciousCount: number;
  };
}
