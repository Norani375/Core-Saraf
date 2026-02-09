
import React, { useState } from 'react';

const INITIAL_PENDING = [
  { id: "TXN-4891", customer: "غلام فاروق", type: "حواله", amount: "500,000 AFN", time: "۱۰:۴۲", reason: "نیاز به تایید دستی برای مبالغ بالا" },
  { id: "TXN-4895", customer: "جمال خان", type: "خرید USD", amount: "$5,000", time: "۱۱:۱۵", reason: "بررسی انطباق KYC" },
  { id: "TXN-4898", customer: "شیر احمد", type: "فروش EUR", amount: "€3,200", time: "۱۱:۴۰", reason: "نیاز به استعلام نرخ شعبه" }
];

const PendingTransactions: React.FC = () => {
  const [txns, setTxns] = useState(INITIAL_PENDING);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setTxns(prev => prev.filter(t => t.id !== id));
    alert(`تراکنش ${id} با موفقیت ${action === 'approve' ? 'تایید' : 'لغو'} شد.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">معاملات در انتظار تایید</h2>
          <p className="text-sm text-slate-500 font-medium">تایید نهایی معاملات حساس و مبالغ بالا توسط مدیر شعبه</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-black border border-amber-200">
          {txns.length} مورد در انتظار
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
            <tr>
              <th className="px-8 py-5">شناسه</th>
              <th className="px-8 py-5">مشتری</th>
              <th className="px-8 py-5">نوع معامله</th>
              <th className="px-8 py-5">مبلغ</th>
              <th className="px-8 py-5">علت توقف</th>
              <th className="px-8 py-5">زمان ثبت</th>
              <th className="px-8 py-5 text-center">عملیات تایید</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {txns.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5 font-mono text-slate-400 text-[10px] font-bold">{txn.id}</td>
                <td className="px-8 py-5 font-black text-slate-700">{txn.customer}</td>
                <td className="px-8 py-5"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase">{txn.type}</span></td>
                <td className="px-8 py-5 font-black text-indigo-900">{txn.amount}</td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">{txn.reason}</td>
                <td className="px-8 py-5 text-slate-400 font-bold text-[10px]">{txn.time}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleAction(txn.id, 'approve')}
                      className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                    >
                      <i className="fa fa-check"></i>
                    </button>
                    <button 
                      onClick={() => handleAction(txn.id, 'reject')}
                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {txns.length === 0 && (
          <div className="p-20 text-center space-y-4">
             <i className="fa fa-circle-check text-5xl text-slate-100"></i>
             <p className="text-slate-400 font-bold">هیچ تراکنشی در انتظار تایید وجود ندارد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTransactions;
