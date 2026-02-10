
import { db } from './db';
import { xmlGenerator } from './xmlGenerator';
import { DABReport, ReportType, SubmissionStatus } from '../types/dab.types';

export const dabService = {
  generateReport: async (type: ReportType, period: string): Promise<DABReport> => {
    // دریافت تراکنش‌های واقعی از دیتابیس مرکزی
    const allTransactions = db.getJournal();
    
    // فیلتر کردن تراکنش‌های مربوط به امروز (period)
    const filtered = allTransactions.filter(t => t.date.startsWith(period.replace(/\//g, '-')));
    
    // تبدیل JournalEntry به فرمت مورد نیاز xmlGenerator (در صورت تفاوت تایپ)
    const formattedTxns = filtered.map(t => ({
      id: t.id,
      customer_id: t.customerId || 'N/A',
      customer_name: t.customerName || 'ناشناس',
      type: t.category,
      amount: t.debit || t.credit,
      currency: t.currency,
      rate: t.rate,
      status: (t.debit || t.credit) > 50000 ? 'SUSPICIOUS' : 'COMPLETED',
      is_suspicious: (t.debit || t.credit) > 50000,
      timestamp: t.date
    }));

    const xml = xmlGenerator.generateDailyXML(formattedTxns as any, 'KBL-786');
    
    const report: DABReport = {
      id: `DAB-REP-${Date.now()}`,
      type,
      period,
      generatedAt: new Date().toISOString(),
      status: SubmissionStatus.DRAFT,
      xmlContent: xml,
      metadata: {
        totalTransactions: filtered.length,
        totalVolumeUSD: filtered.reduce((acc, curr) => acc + (curr.currency === 'USD' ? (curr.debit || curr.credit) : 0), 0),
        suspiciousCount: filtered.filter(f => (f.debit || f.credit) > 50000).length
      }
    };

    const existing = JSON.parse(localStorage.getItem('dab_reports') || '[]');
    localStorage.setItem('dab_reports', JSON.stringify([report, ...existing]));
    
    return report;
  },

  getHistory: (): DABReport[] => {
    return JSON.parse(localStorage.getItem('dab_reports') || '[]');
  },

  submitToPortal: async (reportId: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reports = dabService.getHistory();
        const updated = reports.map(r => 
          r.id === reportId ? { ...r, status: SubmissionStatus.ACCEPTED, dabReference: `DAB-REF-${Math.floor(Math.random() * 900000)}` } : r
        );
        localStorage.setItem('dab_reports', JSON.stringify(updated));
        resolve("SUCCESS");
      }, 1500);
    });
  }
};
