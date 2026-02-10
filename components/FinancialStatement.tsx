
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

const FinancialStatement: React.FC = () => {
  const [summary, setSummary] = useState<any>({});

  useEffect(() => {
    setSummary(db.getFinancialSummary());
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">صورت حساب مالی (بلانس شیت)</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">ترازنامه دارایی‌ها، بدهی‌ها و سرمایه شرکت صرافی ذکی جابر</p>
        </div>
        <div className="flex gap-3 no-print">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg">
            <i className="fa fa-print ml-2"></i> چاپ ترازنامه
          </button>
        </div>
      </div>

      {/* Cash Reserves - Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 printable-area">
        {Object.entries(summary).map(([currency, data]: [string, any]) => (
          <div key={currency} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-16 -mt-16 rounded-full opacity-50"></div>
            <div className="relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg mb-6">
                  <i className="fa fa-vault text-2xl"></i>
               </div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">موجودی صندوق ({currency})</h4>
               <div className="flex items-end gap-2 mb-6">
                  <span className={`text-3xl font-black ${data.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {data.balance.toLocaleString()}
                  </span>
                  <span className="text-sm font-black text-slate-400 mb-1">{currency}</span>
               </div>
               
               <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">جمع رسید</p>
                    <p className="text-xs font-black text-emerald-600">+{data.totalIn.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">جمع برد</p>
                    <p className="text-xs font-black text-rose-600">-{data.totalOut.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Ledger Analysis */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl no-print">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-indigo-400">تحلیل شاخه‌های مالی و مالیاتی</h3>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">Manual Ledger Sync</span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-6">
               <h4 className="text-sm font-black text-slate-400 border-b border-white/5 pb-2">شاخه سرمایه</h4>
               <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between">
                     <span className="text-xs font-bold opacity-60">ثبت سرمایه اولیه</span>
                     <span className="text-sm font-black text-emerald-400">AFN 5M</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-xs font-bold opacity-60">افزایش سرمایه</span>
                     <span className="text-sm font-black text-indigo-400">AFN 0</span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-sm font-black text-slate-400 border-b border-white/5 pb-2">شاخه بدهی‌ها</h4>
               <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between">
                     <span className="text-xs font-bold opacity-60">قروض پرداختنی</span>
                     <span className="text-sm font-black text-rose-400">USD 12,500</span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-sm font-black text-slate-400 border-b border-white/5 pb-2">دارایی‌ها و استهلاک</h4>
               <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between">
                     <span className="text-xs font-bold opacity-60">ارزش کل تجهیزات</span>
                     <span className="text-sm font-black text-slate-200">AFN 250K</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-4">
                     <span className="text-xs font-bold opacity-60">درج استهلاک (Dep)</span>
                     <span className="text-xs font-black text-rose-400">-5% Yearly</span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-sm font-black text-slate-400 border-b border-white/5 pb-2">معرفت مالیات</h4>
               <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between">
                     <span className="text-xs font-bold opacity-60">مالیات بر عایدات</span>
                     <span className="text-sm font-black text-amber-400">2% DAB Rate</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-xs font-bold opacity-60">مالیات پرداخت شده</span>
                     <span className="text-sm font-black text-emerald-400">AFN 45K</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FinancialStatement;
