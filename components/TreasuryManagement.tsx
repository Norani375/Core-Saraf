
import React from 'react';

const TreasuryManagement: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">خزانه‌داری و مدیریت نقدینگی</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">نظارت بر موجودی فیزیکی و دیجیتالی ارزها در شعبه مرکزی</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <i className="fa fa-sync"></i> تطبیق موجودی
          </button>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
            <i className="fa fa-plus"></i> شارژ صندوق
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BalanceCard currency="USD" amount="142,500.00" label="دلار آمریکا" color="indigo" />
        <BalanceCard currency="AFN" amount="8,240,000" label="افغانی افغانستان" color="emerald" />
        <BalanceCard currency="EUR" amount="12,400.00" label="یورو اروپا" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
           <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <i className="fa fa-history text-indigo-500"></i>
              تراکنش‌های اخیر خزانه
           </h3>
           <div className="space-y-4">
              <TreasuryLog type="In" amount="+ $10,000" note="شارژ روزانه از شعبه مرکزی" date="۱۰:۱۵" />
              <TreasuryLog type="Out" amount="- 500,000 AFN" note="تسویه حواله آقای وردک" date="۱۱:۳۰" />
              <TreasuryLog type="In" amount="+ €2,000" note="خرید فیزیکی - مشتری حضوری" date="۱۲:۰۵" />
              <TreasuryLog type="Out" amount="- $5,000" note="انتقال به گاوصندوق اصلی" date="۱۳:۴۵" />
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
           <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <i className="fa fa-chart-pie text-emerald-500"></i>
              توزیع نقدینگی (Liquidity Mix)
           </h3>
           <div className="space-y-6">
              <MixBar label="USD (دلار)" percent={65} color="indigo" />
              <MixBar label="AFN (افغانی)" percent={25} color="emerald" />
              <MixBar label="EUR (یورو)" percent={8} color="blue" />
              <MixBar label="Other (سایر)" percent={2} color="slate" />
           </div>
           <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-slate-400 font-black uppercase">ارزش کل (به دلار)</p>
                 <p className="text-2xl font-black text-slate-800">$ 265,480.00</p>
              </div>
              <button className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-50 transition-colors">
                مشاهده گزارش کامل
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const BalanceCard: React.FC<{ currency: string, amount: string, label: string, color: string }> = ({ currency, amount, label, color }) => (
  <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 -mr-16 -mt-16 rounded-full opacity-50 group-hover:scale-110 transition-transform`}></div>
    <div className="relative z-10">
       <div className={`w-14 h-14 rounded-2xl bg-${color}-600 text-white flex items-center justify-center shadow-lg mb-6`}>
          <i className="fa fa-money-bill-transfer text-2xl"></i>
       </div>
       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
       <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-slate-800">{amount}</span>
          <span className="text-sm font-black text-slate-400 mb-1">{currency}</span>
       </div>
    </div>
  </div>
);

const TreasuryLog: React.FC<{ type: 'In' | 'Out', amount: string, note: string, date: string }> = ({ type, amount, note, date }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
     <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'In' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
           <i className={`fa ${type === 'In' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}`}></i>
        </div>
        <div>
           <p className="text-xs font-black text-slate-700">{note}</p>
           <p className="text-[10px] text-slate-400 font-bold">{date}</p>
        </div>
     </div>
     <span className={`text-sm font-black ${type === 'In' ? 'text-emerald-600' : 'text-rose-600'}`}>{amount}</span>
  </div>
);

const MixBar: React.FC<{ label: string, percent: number, color: string }> = ({ label, percent, color }) => (
  <div className="space-y-2">
     <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
        <span>{label}</span>
        <span>{percent}%</span>
     </div>
     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full bg-${color}-600 rounded-full`} style={{ width: `${percent}%` }}></div>
     </div>
  </div>
);

export default TreasuryManagement;
