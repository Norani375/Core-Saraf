
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { JournalEntry, TransactionType } from '../types';

const Journal: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<JournalEntry | null>(null);
  const [config] = useState(db.getConfig());
  
  const [formData, setFormData] = useState({
    description: '',
    customerName: '',
    category: 'CASH_IN' as TransactionType,
    amount: '',
    currency: config.currencies.find(c => c.active)?.code || 'USD',
    type: 'DEBIT' 
  });

  useEffect(() => {
    setEntries(db.getJournal());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    
    const newEntry: JournalEntry = {
      id: `JR-${Date.now()}`,
      date: new Date().toISOString(),
      description: formData.description,
      customerName: formData.customerName,
      category: formData.category,
      debit: formData.type === 'DEBIT' ? amountNum : 0,
      credit: formData.type === 'CREDIT' ? amountNum : 0,
      currency: formData.currency,
      rate: 1
    };

    db.saveEntry(newEntry);
    setEntries(db.getJournal());
    setShowAddModal(false);
    
    // نمایش رسید بلافاصله بعد از ثبت برای تایید نهایی
    setSelectedReceipt(newEntry);
    setShowReceiptModal(true);
    
    setFormData({ description: '', customerName: '', category: 'CASH_IN', amount: '', currency: 'USD', type: 'DEBIT' });
  };

  const handlePrintReceipt = (entry: JournalEntry) => {
    setSelectedReceipt(entry);
    setShowReceiptModal(true);
  };

  const handleReverse = (entry: JournalEntry) => {
    if (window.confirm(`آیا از "برگشت" این معامله اطمینان دارید؟ یک تراکنش معکوس برای اصلاح بیلانس ثبت خواهد شد.`)) {
      const reversalEntry: JournalEntry = {
        id: `REV-${Date.now()}`,
        date: new Date().toISOString(),
        description: `برگشت معامله (اصلاحی): ${entry.description}`,
        customerName: entry.customerName,
        category: entry.debit > 0 ? 'CASH_OUT' : 'CASH_IN',
        debit: entry.credit,
        credit: entry.debit,
        currency: entry.currency,
        rate: entry.rate,
        isReversed: true,
        reversedFromId: entry.id
      };
      db.saveEntry(reversalEntry);
      setEntries(db.getJournal());
      alert("معامله با موفقیت برگشت داده شد.");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("آیا از حذف دایمی این رکورد اطمینان دارید؟ (پیشنهاد می‌شود از دکمه برگشت استفاده کنید)")) {
      db.deleteEntry(id);
      setEntries(db.getJournal());
    }
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100"
            title="بازگشت به داشبورد"
          >
            <i className="fa fa-arrow-right"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">روزنامچه و ترانزیکشنز</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">مدیریت نقدینگی و اسناد حسابداری</p>
          </div>
        </div>
        <div className="flex gap-4">
           <input 
            type="text" 
            placeholder="جستجو در روزنامچه..." 
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none w-48 focus:ring-2 focus:ring-indigo-500/20"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
           />
           <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
           >
             <i className="fa fa-plus"></i> ثبت جدید
           </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden no-print">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
            <tr>
              <th className="px-8 py-5 border">تاریخ</th>
              <th className="px-8 py-5 border">نوع معامله</th>
              <th className="px-8 py-5 border">تفاصیل / مشتری</th>
              <th className="px-8 py-5 border bg-emerald-50/30">رسید (+)</th>
              <th className="px-8 py-5 border bg-rose-50/30">برد (-)</th>
              <th className="px-8 py-5 border text-center">ارز</th>
              <th className="px-8 py-5 text-left border">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.filter(e => e.description.toLowerCase().includes(filter.toLowerCase()) || e.customerName?.toLowerCase().includes(filter.toLowerCase())).map(e => (
              <tr key={e.id} className={`hover:bg-slate-50/50 transition-all group ${e.isReversed ? 'bg-amber-50/30' : ''}`}>
                <td className="px-8 py-5 border">
                   <div className="text-[10px] font-black">{new Date(e.date).toLocaleDateString('fa-AF')}</div>
                </td>
                <td className="px-8 py-5 border">
                   <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-tighter">{e.category}</span>
                </td>
                <td className="px-8 py-5 border">
                   <div className={`text-xs font-black ${e.isReversed ? 'text-amber-700' : 'text-slate-800'}`}>{e.description}</div>
                   {e.customerName && <div className="text-[9px] text-indigo-500 font-bold mt-1">مشتری: {e.customerName}</div>}
                </td>
                <td className="px-8 py-5 border font-black text-emerald-600 text-xs bg-emerald-50/10">
                   {e.debit > 0 ? e.debit.toLocaleString() : '-'}
                </td>
                <td className="px-8 py-5 border font-black text-rose-600 text-xs bg-rose-50/10">
                   {e.credit > 0 ? e.credit.toLocaleString() : '-'}
                </td>
                <td className="px-8 py-5 border text-[10px] font-black text-slate-500 text-center">
                   {e.currency}
                </td>
                <td className="px-8 py-5 text-left border">
                   <div className="flex gap-2 justify-end">
                      <button onClick={() => handlePrintReceipt(e)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center justify-center" title="چاپ رسید رسمی">
                         <i className="fa fa-print text-[10px]"></i>
                      </button>
                      {!e.isReversed && (
                        <button onClick={() => handleReverse(e)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-600 transition-all flex items-center justify-center" title="برگشت معامله (Reversal)">
                           <i className="fa fa-rotate-left text-[10px]"></i>
                        </button>
                      )}
                      <button onClick={() => handleDelete(e.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-600 transition-all flex items-center justify-center" title="حذف دایمی">
                         <i className="fa fa-trash-can text-[10px]"></i>
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal (رسید چاپی تراکنش) */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md no-print" onClick={(e) => e.target === e.currentTarget && setShowReceiptModal(false)}>
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center no-print">
               <h3 className="text-lg font-black flex items-center gap-3">
                 <i className="fa fa-file-invoice-dollar"></i> رسید اسناد حسابداری
               </h3>
               <button onClick={() => setShowReceiptModal(false)} className="hover:text-rose-500 transition-colors"><i className="fa fa-times text-xl"></i></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-white printable-area">
               {/* هدر رسید مخصوص چاپ */}
               <div className="text-center space-y-4 border-b-2 border-slate-200 pb-8 mb-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="text-right space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{config.company.name}</h2>
                        <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-500">
                           <span>جواز فعالیت: {config.company.license}</span>
                           <span>شماره تماس: {config.company.phone}</span>
                           <span>آدرس: {config.company.address}</span>
                        </div>
                     </div>
                     <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-2">
                           <i className="fa fa-vault text-white text-4xl"></i>
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SarafCore Secure</span>
                     </div>
                  </div>
                  
                  <div className="bg-indigo-50/50 py-3 rounded-2xl border border-indigo-100">
                     <h3 className="text-xl font-black text-indigo-700 uppercase tracking-[0.2em]">رسید نهایی تراکنش (Voucher)</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 text-[10px] font-black text-slate-500 uppercase">
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-slate-400 mb-1">شماره سند (Ref)</p>
                        <p className="text-slate-900 font-mono">{selectedReceipt.id}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-slate-400 mb-1">تاریخ و ساعت</p>
                        <p className="text-slate-900">{new Date(selectedReceipt.date).toLocaleString('fa-AF')}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-slate-400 mb-1">واحد مالی</p>
                        <p className="text-slate-900">{selectedReceipt.currency}</p>
                     </div>
                  </div>
               </div>

               {/* بدنه رسید */}
               <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                     <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <span className="text-slate-400 font-black uppercase text-[10px]">بنام مشتری / شخص:</span>
                        <span className="font-black text-slate-800 text-lg">{selectedReceipt.customerName || 'مشتری متفرقه'}</span>
                     </div>
                     
                     <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <span className="text-slate-400 font-black uppercase text-[10px]">بابت (تفاصیل معامله):</span>
                        <span className="font-bold text-slate-700 text-sm">{selectedReceipt.description}</span>
                     </div>

                     <div className="flex justify-between items-center p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl shadow-indigo-600/10 text-white">
                        <div className="space-y-1">
                           <span className="text-indigo-200 font-black uppercase text-[10px]">مبلغ نهایی رسید/برد:</span>
                           <p className="text-xs opacity-70">{(selectedReceipt.debit > 0) ? 'رسید وجه به صرافی' : 'برد وجه از صرافی'}</p>
                        </div>
                        <div className="text-right">
                           <span className="font-black text-4xl leading-none">{(selectedReceipt.debit || selectedReceipt.credit).toLocaleString()}</span>
                           <span className="font-black text-indigo-300 mr-3 text-xl">{selectedReceipt.currency}</span>
                        </div>
                     </div>
                  </div>

                  {/* بخش امضاها */}
                  <div className="pt-20 grid grid-cols-2 gap-20 text-center">
                    <div className="space-y-16">
                       <p className="text-[10px] font-black text-slate-500 uppercase border-b border-slate-200 pb-3">محل امضاء و اثر انگشت مشتری</p>
                       <div className="h-12 border border-dashed border-slate-100 rounded-xl"></div>
                    </div>
                    <div className="space-y-16">
                       <p className="text-[10px] font-black text-slate-500 uppercase border-b border-slate-200 pb-3">مهر و تایید صندوق‌دار</p>
                       <div className="h-12 border border-dashed border-slate-100 rounded-xl"></div>
                    </div>
                  </div>
                  
                  {/* فوتر امنیتی */}
                  <div className="pt-12 text-center border-t border-slate-100">
                     <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">
                        SarafCore Enterprise v2.5 - Official Accounting Document - Valid with Stamp Only
                     </p>
                     <p className="text-[7px] text-slate-400 mt-2 font-mono italic">
                        Verification Code: {selectedReceipt.id.split('-')[1]} | Auth ID: {Math.random().toString(36).substring(7).toUpperCase()}
                     </p>
                  </div>
               </div>
            </div>

            {/* دکمه‌های کنترل مودال */}
            <div className="p-8 bg-slate-50 border-t flex gap-4 no-print">
               <button 
                  onClick={() => setShowReceiptModal(false)} 
                  className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors"
               >
                  بستن و بازگشت
               </button>
               <button 
                  onClick={triggerBrowserPrint} 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
               >
                  <i className="fa fa-print"></i> چاپ نهایی رسید (Print)
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Modal (مخفی در پرینت) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in no-print" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
               <h3 className="text-xl font-black">ثبت معامله جدید</h3>
               <button onClick={() => setShowAddModal(false)}><i className="fa fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-2xl">
                 <button type="button" onClick={() => setFormData({...formData, type: 'DEBIT'})} className={`py-3 rounded-xl text-xs font-black transition-all ${formData.type === 'DEBIT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'}`}>رسید (+)</button>
                 <button type="button" onClick={() => setFormData({...formData, type: 'CREDIT'})} className={`py-3 rounded-xl text-xs font-black transition-all ${formData.type === 'CREDIT' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'}`}>برد (-)</button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع ترانزیکشن</label>
                  <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-black text-xs outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    <option value="CASH_IN">رسید وجه نقد</option>
                    <option value="CASH_OUT">برد وجه نقد</option>
                    <option value="CHECK_IN">چک وارده</option>
                    <option value="CHECK_OUT">چک صادره</option>
                    <option value="TRANSFER_INTERNAL">انتقال بین حسابات</option>
                    <option value="EXPENSE">مصارف دفتر</option>
                    <option value="DAB_AUCTION_BUY">خرید از د افغانستان بانک</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نام طرف حساب / مشتری</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-bold outline-none" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مبلغ و واحد پولی</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-black text-xl outline-none" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تفاصیل معامله</label>
                  <textarea 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3.5 font-bold outline-none text-sm min-h-[100px]" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">
                   تایید و ثبت در روزنامچه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
