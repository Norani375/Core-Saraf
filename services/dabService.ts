
import { TransactionService } from './mockBackend';
import { xmlGenerator } from './xmlGenerator';
import { DABReport, ReportType, SubmissionStatus } from '../types/dab.types';

export const dabService = {
  generateReport: async (type: ReportType, period: string): Promise<DABReport> => {
    const transactions = TransactionService.list();
    // فیلتر بر اساس دوره زمانی (در واقعیت)
    const filtered = transactions; 
    
    const xml = xmlGenerator.generateDailyXML(filtered, 'KBL-001');
    
    const report: DABReport = {
      id: `DAB-REP-${Date.now()}`,
      type,
      period,
      generatedAt: new Date().toISOString(),
      status: SubmissionStatus.DRAFT,
      xmlContent: xml,
      metadata: {
        totalTransactions: filtered.length,
        totalVolumeUSD: filtered.reduce((acc, curr) => acc + curr.amount, 0),
        suspiciousCount: filtered.filter(f => f.is_suspicious).length
      }
    };

    // ذخیره در دیتابیس لوکال
    const existing = JSON.parse(localStorage.getItem('dab_reports') || '[]');
    localStorage.setItem('dab_reports', JSON.stringify([report, ...existing]));
    
    return report;
  },

  getHistory: (): DABReport[] => {
    return JSON.parse(localStorage.getItem('dab_reports') || '[]');
  },

  submitToPortal: async (reportId: string): Promise<string> => {
    // شبیه‌سازی ارسال به API بانک مرکزی
    return new Promise((resolve) => {
      setTimeout(() => {
        const reports = dabService.getHistory();
        const updated = reports.map(r => 
          r.id === reportId ? { ...r, status: SubmissionStatus.ACCEPTED, dabReference: `DAB-REF-${Math.floor(Math.random() * 90000)}` } : r
        );
        localStorage.setItem('dab_reports', JSON.stringify(updated));
        resolve("SUCCESS");
      }, 2000);
    });
  }
};
