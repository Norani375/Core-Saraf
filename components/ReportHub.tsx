
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { JournalEntry, Customer } from '../types';

const ReportHub: React.FC = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [config] = useState(db.getConfig());

  useEffect(() => {
    if (type === 'customers') {
      setData(db.getCustomers());
    } else {
      const all = db.getJournal(true);
      switch(type) {
        case 'exchange': setData(all.filter(e => !e.isDeleted && (e.category === 'EXCHANGE_BUY' || e.category === 'EXCHANGE_SELL'))); break;
        case 'hawala': setData(all.filter(e => !e.isDeleted && (e.category === 'HAWALA_SEND' || e.category === 'HAWALA_RECEIVE'))); break;
        case 'deleted': setData(all.filter(e => e.isDeleted)); break;
        case 'lctr': setData(all.filter(e => !e.isDeleted && (e.debit + e.credit > 10000))); break;
        default: setData([]);
      }
    }
  }, [type]);

  const getTitle = () => {
    switch(type) {
      case 'exchange': return 'گزارش معاملات صرافی و تبادله اسعار';
      case 'hawala': return 'گزارش تفصیلی حواله‌جات صادره و وارده';
      case 'deleted': return 'لیست تراکنش‌های حذف شده (Audit Log)';
      case 'lctr': return 'گزارش تراکنش‌های حجیم (LCTR - بالای ۱۰ هزار)';
      case 'customers': return 'لیست کامل مشتریان و سوابق KYC';
      default: return 'گزارش سیستم';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Action Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100"
          >
            <i className="fa fa-arrow-right"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">{getTitle()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">تعداد کل رکوردهای یافته شده: {data.length}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint} 
            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-black transition-all flex items-center gap-2"
          >
            <i className="fa fa-print"></i> چاپ گزارش رسمی
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden printable-area p-10">
        {/* Header specifically for printing */}
        <div className="print-only text-center border-b-2 border-slate-200 pb-8 mb-8 space-y-2">
           <h1 className="text-3xl font-black text-slate-900">{config.company.name}</h1>
           <p className="text-lg font-black text-indigo-600">{getTitle()}</p>
           <div className="flex justify-center gap-12 text-[10px] font-bold text-slate-500 pt-2">
              <span>تاریخ گزارش: {new Date().toLocaleDateString('fa-AF')}</span>
              <span>جواز: {config.company.license}</span>
              <span>تعداد رکورد: {data.length}</span>
           </div>
        </div>

        {type === 'customers' ? (
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="p-4 border">نام و تخلص کامل</th>
                <th className="p-4 border">نام پدر</th>
                <th className="p-4 border">تذکره / پاسپورت</th>
                <th className="p-4 border">شماره تماس</th>
                <th className="p-4 border">سطح ریسک</th>
                <th className="p-4 border">تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {(data as Customer[]).map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 border font-black text-slate-800">{c.full_name}</td>
                  <td className="p-4 border text-slate-600">{c.father_name}</td>
                  <td className="p-4 border font-mono font-bold text-slate-500">{c.national_id}</td>
                  <td className="p-4 border font-bold text-slate-600">{c.phone}</td>
                  <td className="p-4 border">
                    <span className="text-[10px] font-black uppercase">{c.risk_level}</span>
                  </td>
                  <td className="p-4 border font-bold text-slate-400">{c.registration_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="p-4 border">شناسه (Ref)</th>
                <th className="p-4 border">تاریخ معامله</th>
                <th className="p-4 border">شرح عملیات / مشتری</th>
                <th className="p-4 border text-left">مبلغ (رسید/برد)</th>
                <th className="p-4 border text-center">ارز</th>
                <th className="p-4 border text-center">نرخ</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {(data as JournalEntry[]).map(item => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.isDeleted ? 'bg-rose-50/50' : ''}`}>
                  <td className="p-4 border font-mono text-[10px] text-slate-400">{item.id}</td>
                  <td className="p-4 border font-bold text-slate-500">{new Date(item.date).toLocaleDateString('fa-AF')}</td>
                  <td className="p-4 border">
                     <div className="font-black text-slate-800">{item.description}</div>
                     <div className="text-[9px] text-indigo-500 font-bold mt-1">طرف حساب: {item.customerName || '---'}</div>
                  </td>
                  <td className="p-4 border font-black text-slate-900 text-left text-sm">
                    {(item.debit || item.credit).toLocaleString()}
                  </td>
                  <td className="p-4 border font-black text-slate-500 text-center">{item.currency}</td>
                  <td className="p-4 border font-bold text-slate-400 text-center">{item.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Print Signature Section */}
        <div className="print-only mt-24 grid grid-cols-3 gap-10 text-center">
            <div className="space-y-12">
               <p className="text-[10px] font-black text-slate-400 uppercase">مهر و تایید شعبه</p>
               <div className="h-px bg-slate-200 w-32 mx-auto"></div>
            </div>
            <div className="space-y-12">
               <p className="text-[10px] font-black text-slate-400 uppercase">بخش محاسبات</p>
               <div className="h-px bg-slate-200 w-32 mx-auto"></div>
            </div>
            <div className="space-y-12">
               <p className="text-[10px] font-black text-slate-400 uppercase">مدیریت عملیات</p>
               <div className="h-px bg-slate-200 w-32 mx-auto"></div>
            </div>
        </div>

        <div className="print-only mt-10 text-center border-t border-slate-100 pt-6">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">SarafCore Enterprise v2.5 - Official Audit Report - Secure Document</p>
        </div>
      </div>
    </div>
  );
};

export default ReportHub;
