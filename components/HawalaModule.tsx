
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { JournalEntry, Customer } from '../types';

const HawalaModule: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    type: 'HAWALA_SEND' as any,
    customerId: '',
    amount: '',
    currency: 'USD',
    agent: '',
    commission: '',
    description: ''
  });

  useEffect(() => {
    setCustomers(db.getCustomers());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    const amountNum = parseFloat(formData.amount);
    const commNum = parseFloat(formData.commission) || 0;

    const entry: JournalEntry = {
      id: `HWL-${Date.now()}`,
      date: new Date().toISOString(),
      description: `حواله ${formData.type === 'HAWALA_SEND' ? 'صادره' : 'وارده'} - ${formData.description}`,
      category: formData.type,
      debit: formData.type === 'HAWALA_RECEIVE' ? amountNum : 0,
      credit: formData.type === 'HAWALA_SEND' ? amountNum : 0,
      currency: formData.currency,
      rate: 1,
      customerId: formData.customerId,
      customerName: customer?.full_name || 'ناشناس',
      agentName: formData.agent,
      commission: commNum
    };

    db.saveEntry(entry);
    setReceipt(entry);
    setShowModal(true);
    setFormData({ type: 'HAWALA_SEND', customerId: '', amount: '', currency: 'USD', agent: '', commission: '', description: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden relative no-print">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
          <i className="fa fa-paper-plane text-indigo-600"></i>
          ثبت حواله جدید (Hawala Entry)
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع حواله</label>
            <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-bold outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="HAWALA_SEND">حواله صادره (ارسال)</option>
              <option value="HAWALA_RECEIVE">حواله وارده (دریافت)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مشتری</label>
            <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-bold outline-none" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} required>
              <option value="">انتخاب مشتری...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مبلغ حواله</label>
            <div className="relative">
              <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-black text-xl outline-none" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              <select className="absolute left-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-lg text-[10px] font-black" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                <option value="USD">USD</option>
                <option value="AFN">AFN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">کمیسیون</label>
            <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-bold outline-none" placeholder="0.00" value={formData.commission} onChange={e => setFormData({...formData, commission: e.target.value})} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نام واسط / ایجنت (Agent)</label>
            <input type="text" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-bold outline-none" placeholder="نام صرافی واسط یا شهر مقصد" value={formData.agent} onChange={e => setFormData({...formData, agent: e.target.value})} />
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">
               تایید و ثبت حواله
            </button>
          </div>
        </form>
      </div>

      {showModal && receipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm printable-modal-overlay">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center no-print">
              <h3 className="text-xl font-black">حواله خط صادره / وارده</h3>
              <button onClick={() => setShowModal(false)}><i className="fa fa-times"></i></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-8 printable-area">
              <div className="text-center space-y-2 border-b-2 border-slate-100 pb-6">
                 <h2 className="text-2xl font-black text-slate-900">صرافی اسمارک کورت (Hawala Service)</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">رسید رسمی انتقال وجه (حواله خط)</p>
                 <p className="text-[10px] text-slate-400">{new Date(receipt.date).toLocaleString('fa-AF')}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">شناسه حواله:</span>
                    <span className="font-black font-mono">{receipt.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">نام مشتری:</span>
                    <span className="font-black">{receipt.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">مقصد / ایجنت:</span>
                    <span className="font-black text-indigo-600">{receipt.agentName || '-'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">مبلغ حواله:</span>
                    <span className="font-black">{(receipt.debit || receipt.credit).toLocaleString()} {receipt.currency}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">کمیسیون:</span>
                    <span className="font-black">{receipt.commission?.toLocaleString()} {receipt.currency}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">نوع:</span>
                    <span className="font-black">{receipt.category === 'HAWALA_SEND' ? 'صادره' : 'وارده'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-20 text-center space-y-20">
                 <div className="grid grid-cols-2 gap-20">
                    <div className="border-t-2 border-slate-100 pt-2 text-[10px] font-black text-slate-400">امضا مشتری</div>
                    <div className="border-t-2 border-slate-100 pt-2 text-[10px] font-black text-slate-400">امضا و مهر صرافی</div>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t flex gap-4 no-print">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white border rounded-2xl font-black text-sm">بستن</button>
              <button onClick={handlePrint} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl">چاپ حواله خط</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HawalaModule;
