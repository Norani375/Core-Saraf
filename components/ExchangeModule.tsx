
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { rateService, ExchangeRate } from '../services/rateService';
import { analyzeTransactionAML } from '../services/geminiService';
import { JournalEntry, Customer, TransactionType } from '../types';

const ExchangeModule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [amlResult, setAmlResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState<JournalEntry | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [liveRates, setLiveRates] = useState<ExchangeRate[]>([]);
  const [config, setConfig] = useState(db.getConfig());
  
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'EXCHANGE_BUY' as TransactionType,
    amount: '',
    currency: db.getConfig().currencies.find(c => c.active)?.code || 'USD',
    rate: 74.20,
    description: ''
  });

  useEffect(() => {
    setCustomers(db.getCustomers());
    refreshRates();
    const interval = setInterval(refreshRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshRates = async () => {
    const rates = await rateService.fetchLiveRates();
    setLiveRates(rates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.customerId) return;
    
    setLoading(true);
    const selectedCust = customers.find(c => c.id === formData.customerId);
    
    try {
      const aml = await analyzeTransactionAML({ ...formData, customer: selectedCust });
      setAmlResult(aml);

      const entry: JournalEntry = {
        id: `EXCH-${Date.now()}`,
        date: new Date().toISOString(),
        description: `${formData.type === 'EXCHANGE_BUY' ? 'خرید' : 'فروش'} ارز - ${formData.description}`,
        category: formData.type,
        debit: formData.type === 'EXCHANGE_BUY' ? parseFloat(formData.amount) : 0,
        credit: formData.type === 'EXCHANGE_SELL' ? parseFloat(formData.amount) : 0,
        currency: formData.currency,
        rate: formData.rate,
        customerId: formData.customerId,
        customerName: selectedCust?.full_name || 'ناشناس'
      };

      db.saveEntry(entry);
      setReceipt(entry);
      setShowModal(true);
    } catch (error) {
      alert("خطا در ثبت معامله");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative no-print">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
          <i className="fa fa-money-bill-transfer text-indigo-600"></i>
          ثبت معامله صرافی
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع معامله</label>
            <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 font-bold outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
              <option value="EXCHANGE_BUY">خرید ارز (Buy)</option>
              <option value="EXCHANGE_SELL">فروش ارز (Sell)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مشتری</label>
            <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 font-bold outline-none" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required>
              <option value="">انتخاب مشتری...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مبلغ و واحد</label>
            <div className="relative">
              <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 font-black text-xl outline-none" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <select 
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-lg text-[10px] font-black" 
                value={formData.currency} 
                onChange={e => setFormData({...formData, currency: e.target.value})}
              >
                {config.currencies.filter(c => c.active).map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نرخ تبدیل نهایی</label>
            <input type="number" step="0.01" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 font-black text-xl outline-none" value={formData.rate} onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})} />
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">
              {loading ? <i className="fa fa-spinner fa-spin"></i> : 'تایید و ثبت معامله'}
            </button>
          </div>
        </form>
      </div>

      {showModal && receipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm printable-modal-overlay">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center no-print">
              <h3 className="text-xl font-black">رسید تراکنش / انطباق</h3>
              <button onClick={() => setShowModal(false)}><i className="fa fa-times"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 printable-area">
              <div className="text-center space-y-2 border-b-2 border-slate-100 pb-6">
                 <h2 className="text-2xl font-black text-slate-900">{config.company.name}</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">رسید رسمی خرید و فروش ارز</p>
                 <p className="text-[10px] text-slate-400">{config.company.address}</p>
                 <p className="text-[10px] text-slate-400">{new Date(receipt.date).toLocaleString('fa-AF')}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">شناسه معامله:</span>
                    <span className="font-black font-mono">{receipt.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">نام مشتری:</span>
                    <span className="font-black">{receipt.customerName}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">مبلغ اصلی:</span>
                    <span className="font-black">{(receipt.debit || receipt.credit).toLocaleString()} {receipt.currency}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">معادل افغانی:</span>
                    <span className="font-black text-indigo-600">{((receipt.debit || receipt.credit) * receipt.rate).toLocaleString()} AFN</span>
                  </div>
                </div>
              </div>
              <div className="pt-10 text-center space-y-12">
                 <div className="grid grid-cols-2 gap-20">
                    <div className="border-t-2 border-slate-100 pt-2 text-[10px] font-black text-slate-400">امضا و مهر مشتری</div>
                    <div className="border-t-2 border-slate-100 pt-2 text-[10px] font-black text-slate-400">امضا و مهر صرافی</div>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t flex gap-4 no-print">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white border rounded-2xl font-black text-sm">بستن</button>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl">چاپ رسید</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeModule;
