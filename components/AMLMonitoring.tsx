
import React from 'react';

const ALERTS = [
  { id: "AML-902", type: "Structuring", customer: "محمود صدیقی", score: 85, date: "۱۴۰۳/۱۲/۰۷", status: "New" },
  { id: "AML-898", type: "High Value Cash", customer: "زرین صرافی", score: 42, date: "۱۴۰۳/۱۲/۰۶", status: "Reviewing" },
  { id: "AML-895", type: "Sanction Match", customer: "نامشخص", score: 98, date: "۱۴۰۳/۱۲/۰۶", status: "Critical" }
];

const AMLMonitoring: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">نظارت AML/CFT</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">تحلیل هوشمند تراکنش‌ها و شناسایی الگوهای مشکوک پولشویی</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase">هشدارها</p>
                <p className="text-lg font-black text-slate-800">۱۲ مورد</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <i className="fa fa-triangle-exclamation"></i>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800">هشدارهای اخیر (Alerts)</h3>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">مشاهده تاریخچه</button>
            </div>
            <div className="divide-y divide-slate-50">
               {ALERTS.map(alert => (
                 <div key={alert.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${alert.score > 70 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                          <span className="text-lg">{alert.score}</span>
                          <span className="text-[8px] uppercase">Score</span>
                       </div>
                       <div>
                          <h4 className="font-black text-slate-800">{alert.type}</h4>
                          <p className="text-xs text-slate-500 font-medium">مشتری: {alert.customer}</p>
                       </div>
                    </div>
                    <div className="text-right space-y-2">
                       <div className="flex gap-2 justify-end">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${alert.status === 'Critical' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                             {alert.status}
                          </span>
                       </div>
                       <p className="text-[10px] text-slate-400 font-bold">{alert.date}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-indigo-400">
                <i className="fa fa-list-check"></i> چک‌لیست انطباق
              </h3>
              <div className="space-y-4">
                 <CheckItem label="بروزرسانی لیست تحریم UN" checked />
                 <CheckItem label="گزارش STR ماهانه" checked={false} />
                 <CheckItem label="تطبیق موجودی بانک مرکزی" checked />
                 <CheckItem label="بازبینی KYC مشتریان پرریسک" checked={false} />
              </div>
           </div>

           <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">DAB Standard</p>
              <h4 className="text-xl font-black mb-4">گزارش STR خودکار</h4>
              <p className="text-xs font-medium leading-relaxed opacity-80 mb-6">سیستم بصورت هوشمند موارد مشکوک را شناسایی و پیش‌نویس گزارش را برای ارسال به بانک مرکزی آماده می‌کند.</p>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl text-[10px] font-black hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20">
                تولید گزارش‌های جدید
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ label: string, checked: boolean }> = ({ label, checked }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
     <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'}`}>
        {checked && <i className="fa fa-check text-[10px]"></i>}
     </div>
     <span className={`text-xs font-medium ${checked ? 'text-slate-300 line-through opacity-50' : 'text-slate-100'}`}>{label}</span>
  </div>
);

export default AMLMonitoring;
