
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { JournalEntry, SystemAuditLog } from '../types';

const AMLMonitoring: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);

  useEffect(() => {
    const transactions = db.getJournal();
    const logs = db.getLogs();

    // شناسایی تراکنش‌های مشکوک (مبالغ بالای ۵۰ هزار افغانی یا معادل آن)
    const amlAlerts = transactions
      .filter(t => (t.debit + t.credit) > 50000)
      .map(t => ({
        id: `AML-${t.id.split('-')[1]}`,
        type: (t.debit + t.credit) > 100000 ? "High Value Transfer" : "Structuring Alert",
        customer: t.customerName || "ناشناس",
        score: (t.debit + t.credit) > 100000 ? 95 : 75,
        date: new Date(t.date).toLocaleDateString('fa-AF'),
        status: "Review Pending"
      }));

    setAlerts(amlAlerts);
    setAuditLogs(logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'WARNING'));
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">نظارت و انطباق (AML/CFT)</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">تحلیل خودکار تراکنش‌های پرریسک بر اساس قوانین بانک مرکزی</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl flex items-center gap-4">
              <span className="text-2xl font-black text-rose-600">{alerts.length}</span>
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">هشدار ریسک</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800">هشدارهای هوشمند سیستم</h3>
              <span className="text-[10px] font-black text-slate-400">بر اساس الگوریتم‌های AML</span>
            </div>
            <div className="divide-y divide-slate-50">
               {alerts.map(alert => (
                 <div key={alert.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${alert.score > 80 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                          <span className="text-lg">{alert.score}</span>
                          <span className="text-[8px] uppercase">Score</span>
                       </div>
                       <div>
                          <h4 className="font-black text-slate-800">{alert.type}</h4>
                          <p className="text-xs text-slate-500 font-medium">مشتری: {alert.customer}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="px-3 py-1 rounded-full text-[9px] font-black bg-slate-900 text-white uppercase">{alert.status}</span>
                       <p className="text-[10px] text-slate-400 font-bold mt-2">{alert.date}</p>
                    </div>
                 </div>
               ))}
               {alerts.length === 0 && (
                 <div className="p-20 text-center text-slate-300 font-black italic">هیچ فعالیت مشکوکی شناسایی نشد.</div>
               )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-lg font-black mb-6 text-indigo-400">لاگ‌های امنیتی منتقدانه</h3>
              <div className="space-y-4">
                 {auditLogs.slice(0, 5).map(log => (
                   <div key={log.id} className="border-b border-white/5 pb-3">
                      <p className="text-[11px] font-bold text-slate-300">{log.details}</p>
                      <p className="text-[8px] text-slate-500 mt-1 uppercase">{new Date(log.timestamp).toLocaleTimeString('fa-AF')} • {log.severity}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AMLMonitoring;
