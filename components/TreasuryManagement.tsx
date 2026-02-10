
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

const TreasuryManagement: React.FC = () => {
  const [summary, setSummary] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setSummary(db.getFinancialSummary());
    setLogs(db.getJournal().slice(0, 10));
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">خزانه‌داری عملیاتی</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">موجودی لحظه‌ای صندوق‌های ارزی بر اساس دفتر روزنامه</p>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg">
          <i className="fa fa-print ml-2"></i> چاپ تراز صندوق
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 printable-area">
        {Object.entries(summary).map(([currency, data]: [string, any]) => (
          <div key={currency} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">موجودی {currency}</h4>
             <p className={`text-3xl font-black ${data.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.balance.toLocaleString()}
             </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm no-print">
         <h3 className="text-lg font-black text-slate-800 mb-6">آخرین جابجایی‌های نقدینگی</h3>
         <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div className="flex gap-4">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${log.debit > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <div>
                       <p className="text-xs font-black">{log.description}</p>
                       <p className="text-[9px] text-slate-400">{new Date(log.date).toLocaleTimeString('fa-AF')}</p>
                    </div>
                 </div>
                 <span className="text-sm font-black">{(log.debit || log.credit).toLocaleString()} {log.currency}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default TreasuryManagement;
