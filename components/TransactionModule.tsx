
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeTransactionAML } from '../services/geminiService';
import { db } from '../services/db';
import { rateService, ExchangeRate, HistoricalRate } from '../services/rateService';
import { JournalEntry, UserRole, Customer } from '../types';

const TransactionModule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [amlResult, setAmlResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [liveRates, setLiveRates] = useState<ExchangeRate[]>([]);
  const [historyData, setHistoryData] = useState<HistoricalRate[]>([]);
  const [lastRateUpdate, setLastRateUpdate] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [recentTransactions, setRecentTransactions] = useState<JournalEntry[]>([]);
  
  const currentUserRole = (localStorage.getItem('current_role') as UserRole) || UserRole.ADMIN;
  const canExport = [UserRole.ADMIN, UserRole.COMPLIANCE].includes(currentUserRole);

  const [formData, setFormData] = useState({
    customerId: '',
    type: 'EXCHANGE_BUY' as any,
    amount: '',
    currency: 'USD',
    rate: 74.20,
    counterparty: ''
  });

  useEffect(() => {
    // استفاده از سرویس مرکزی db
    setCustomers(db.getCustomers());
    setRecentTransactions(db.getJournal().slice(0, 5));
    refreshRates();

    const interval = setInterval(refreshRates, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    rateService.fetchHistoricalRates(formData.currency).then(setHistoryData);
  }, [formData.currency]);

  const refreshRates = async () => {
    const rates = await rateService.fetchLiveRates();
    setLiveRates(rates);
    setLastRateUpdate(new Date().toLocaleTimeString('fa-AF'));
    
    const activeRate = rates.find(r => r.pair === `${formData.currency}/AFN`);
    if (activeRate) {
      setFormData(prev => ({ ...prev, rate: parseFloat(activeRate.rate.toFixed(4)) }));
    }
  };

  const handleExportCSV = () => {
    const data = db.getJournal();
    if (data.length === 0) return;
    const headers = ["ID", "Customer", "Category", "Amount", "Currency", "Rate", "Date"];
    const rows = data.map(t => [
      t.id,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      t.category,
      (t.debit || t.credit),
      t.currency,
      t.rate,
      t.date
    ]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `sarafcore_export_${Date.now()}.csv`);
    link.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.customerId) return;

    setLoading(true);
    const selectedCust = customers.find(c => c.id === formData.customerId);
    
    const aml = await analyzeTransactionAML({
      ...formData,
      customer: selectedCust,
      timestamp: new Date().toISOString()
    });

    setAmlResult(aml);
    setShowModal(true);

    const newEntry: JournalEntry = {
      id: `EXCH-${Date.now()}`,
      date: new Date().toISOString(),
      description: `تبادله اسعار: ${formData.type === 'EXCHANGE_BUY' ? 'خرید' : 'فروش'} ${formData.currency}`,
      category: formData.type,
      debit: formData.type === 'EXCHANGE_BUY' ? parseFloat(formData.amount) : 0,
      credit: formData.type === 'EXCHANGE_SELL' ? parseFloat(formData.amount) : 0,
      currency: formData.currency,
      rate: formData.rate,
      customerId: formData.customerId,
      customerName: selectedCust?.full_name || 'ناشناس'
    };

    db.saveEntry(newEntry);
    setRecentTransactions(db.getJournal().slice(0, 5));
    setLoading(false);
  };

  const getInputClass = (fieldName: string) => {
    return 'border-transparent focus:border-indigo-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* نرخ‌های زنده */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {liveRates.map((rate) => (
          <div key={rate.pair} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase">{rate.pair}</span>
              <span className={`text-[9px] font-black ${rate.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {rate.change}%
              </span>
            </div>
            <p className="text-md font-black text-slate-800 mt-1">{rate.rate.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">ثبت معامله صرافی</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">یکپارچه با سیستم KYC و انطباق نظارتی</p>
          </div>
          <div className="flex gap-3">
             <button onClick={handleExportCSV} className="px-4 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all">
               <i className="fa fa-file-csv text-slate-400"></i>
               <span className="text-[9px] font-black text-slate-500 uppercase">خروجی CSV</span>
             </button>
             <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase">آپدیت: {lastRateUpdate}</span>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">انتخاب مشتری</label>
            <select 
              className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-bold transition-all outline-none ${getInputClass('customerId')}`}
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
              required
            >
              <option value="">جستجو در لیست مشتریان...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">نوع معامله</label>
            <select 
              className="w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-bold outline-none"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="EXCHANGE_BUY">خرید از مشتری</option>
              <option value="EXCHANGE_SELL">فروش به مشتری</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">مبلغ</label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-black text-2xl outline-none"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                 <select className="bg-white border rounded-xl px-3 py-1.5 text-xs font-black" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                   <option value="USD">USD</option>
                   <option value="EUR">EUR</option>
                   <option value="AFN">AFN</option>
                 </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">نرخ تبدیل</label>
            <input 
              type="number" 
              step="0.0001"
              className="w-full bg-indigo-50 border-2 rounded-3xl px-6 py-4 font-black text-xl outline-none"
              value={formData.rate}
              onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})}
              required
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-6 rounded-[2rem] font-black text-white text-lg transition-all shadow-2xl ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black'}`}
            >
              {loading ? 'در حال تحلیل AML...' : 'تایید و ثبت معامله'}
            </button>
          </div>
        </form>
      </div>

      {/* نمایش تراکنش‌های اخیر */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-10 py-5">شناسه</th>
              <th className="px-10 py-5">مشتری</th>
              <th className="px-10 py-5">مبلغ</th>
              <th className="px-10 py-5">زمان</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(t => (
              <tr key={t.id} className="border-t border-slate-50">
                <td className="px-10 py-4 font-mono text-[10px] text-slate-400">{t.id}</td>
                <td className="px-10 py-4 font-black text-slate-700">{t.customerName}</td>
                <td className="px-10 py-4 font-black text-slate-900">{(t.debit || t.credit).toLocaleString()} {t.currency}</td>
                <td className="px-10 py-4 text-[10px] text-slate-400 font-bold">{new Date(t.date).toLocaleTimeString('fa-AF')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مودال نتیجه تحلیل */}
      {showModal && amlResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className={`p-8 text-white ${amlResult.is_suspicious ? 'bg-rose-600' : 'bg-emerald-600'}`}>
               <h3 className="text-xl font-black">نتیجه تحلیل انطباق</h3>
               <p className="text-xs opacity-80 mt-1">تراکنش از نظر AML بررسی شد</p>
            </div>
            <div className="p-10 space-y-6">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{amlResult.reasoning}</p>
               </div>
               <button onClick={() => setShowModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">تایید و بازگشت</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionModule;
