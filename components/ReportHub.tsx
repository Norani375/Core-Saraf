
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
        case 'exchange': 
          setData(all.filter(e => !e.isDeleted && (e.category === 'EXCHANGE_BUY' || e.category === 'EXCHANGE_SELL'))); 
          break;
        case 'hawala': 
          setData(all.filter(e => !e.isDeleted && (e.category === 'HAWALA_SEND' || e.category === 'HAWALA_RECEIVE'))); 
          break;
        case 'deleted': 
          setData(all.filter(e => e.isDeleted)); 
          break;
        case 'lctr': 
          setData(all.filter(e => !e.isDeleted && (Math.abs(e.debit + e.credit) > 10000))); 
          break;
        default: 
          setData([]);
      }
    }
  }, [type]);

  const getTitle = () => {
    switch(type) {
      case 'exchange': return 'گزارش معاملات صرافی و تبادله اسعار';
      case 'hawala': return 'گزارش تفصیلی حواله‌جات صادره و وارده';
      case 'deleted': return 'لیست تراکنش‌های حذف شده (Audit Log)';
      case 'lctr': return 'گزارش تراکنش‌های حجیم (LCTR - بالای ۱۰ هزار دلار)';
      case 'customers': return 'لیست کامل مشتریان و سوابق KYC';
      default: return 'گزارش جامع سیستم';
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${getTitle()} - ${new Date().toLocaleDateString('fa-AF')}`;
    window.print();
    document.title = originalTitle;
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;

    let headers: string[] = [];
    let rows: any[] = [];

    if (type === 'customers') {
      headers = ["ID", "Full Name", "Father Name", "National ID", "Phone", "Risk Level", "Registration Date"];
      rows = (data as Customer[]).map(c => [
        c.id,
        c.full_name,
        c.father_name,
        c.national_id,
        c.phone,
        c.risk_level,
        c.registration_date
      ]);
    } else {
      headers = ["ID", "Date", "Description", "Customer", "Amount", "Currency", "Rate", "Category"];
      if (type === 'hawala') headers.push("Agent", "Commission");
      
      rows = (data as JournalEntry[]).map(item => {
        const base = [
            item.id,
            new Date(item.date).toLocaleDateString('fa-AF'),
            item.description,
            item.customerName || '---',
            (item.debit || item.credit),
            item.currency,
            item.rate,
            item.category
          ];
          if (type === 'hawala') base.push(item.agentName || '---', item.commission || 0);
          return base;
      });
    }

    const csvContent = "\uFEFF" + 
      [headers.join(","), ...rows.map(r => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${type}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Action Header - مخفی در چاپ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center border border-slate-100"
            title="بازگشت"
          >
            <i className="fa fa-arrow-right"></i>
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800">{getTitle()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              تعداد رکوردهای استخراج شده: <span className="text-indigo-600">{data.length}</span> مورد
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportCSV} 
            className="flex-1 md:flex-none px-4 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa fa-file-excel text-emerald-600"></i> خروجی Excel
          </button>
          <button 
            onClick={handlePrint} 
            className="flex-1 md:flex-none px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <i className="fa fa-file-pdf"></i> خروجی PDF
          </button>
          <button 
            onClick={handlePrint} 
            className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa fa-print"></i> چاپ گزارش رسمی
          </button>
        </div>
      </div>

      {/* منطقه چاپی گزارش */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden printable-area p-10 min-h-[80vh]">
        
        {/* سربرگ رسمی مخصوص چاپ */}
        <div className="print-only text-center border-b-2 border-slate-200 pb-8 mb-8 space-y-3">
           <div className="flex justify-between items-center px-4">
              <div className="text-right">
                 <h1 className="text-2xl font-black text-slate-900">{config.company.name}</h1>
                 <p className="text-[10px] font-bold text-slate-500">جواز فعالیت: {config.company.license}</p>
                 <p className="text-[10px] font-bold text-slate-500">شماره تماس: {config.company.phone}</p>
              </div>
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center">
                 <i className="fa fa-vault text-white text-3xl"></i>
              </div>
           </div>
           <div className="h-px bg-slate-100 w-full my-4"></div>
           <h2 className="text-xl font-black text-indigo-700 uppercase tracking-widest">{getTitle()}</h2>
           <div className="flex justify-center gap-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pt-2">
              <span>تاریخ تنظیم گزارش: {new Date().toLocaleDateString('fa-AF')}</span>
              <span>کد سیستم: ZJ-CORE-V2</span>
              <span>تعداد کل معاملات: {data.length}</span>
           </div>
        </div>

        {/* بدنه جداول گزارش */}
        {type === 'customers' ? (
          <table className="w-full text-right border-collapse text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <tr>
                <th className="p-4 border">شناسه</th>
                <th className="p-4 border">نام و تخلص کامل</th>
                <th className="p-4 border">نام پدر</th>
                <th className="p-4 border">تذکره / پاسپورت</th>
                <th className="p-4 border text-center">شماره تماس</th>
                <th className="p-4 border text-center">سطح ریسک</th>
                <th className="p-4 border text-center">تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody>
              {(data as Customer[]).map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="p-4 border font-mono text-slate-400 text-[9px]">{c.id}</td>
                  <td className="p-4 border font-black text-slate-800">{c.full_name}</td>
                  <td className="p-4 border text-slate-600">{c.father_name}</td>
                  <td className="p-4 border font-mono font-bold text-slate-500">{c.national_id}</td>
                  <td className="p-4 border font-bold text-slate-600 text-center">{c.phone}</td>
                  <td className="p-4 border text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                      c.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>{c.risk_level}</span>
                  </td>
                  <td className="p-4 border font-bold text-slate-400 text-center">{c.registration_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-right border-collapse text-[11px]">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <tr>
                <th className="p-4 border">شناسه Ref</th>
                <th className="p-4 border">تاریخ</th>
                <th className="p-4 border">شرح عملیات</th>
                <th className="p-4 border">مشتری</th>
                {type === 'hawala' && <th className="p-4 border">ایجنت / واسط</th>}
                <th className="p-4 border text-center">مبلغ</th>
                <th className="p-4 border text-center">واحد</th>
                {type === 'hawala' && <th className="p-4 border text-center">کمیسیون</th>}
                <th className="p-4 border text-center">نرخ (AFN)</th>
              </tr>
            </thead>
            <tbody>
              {(data as JournalEntry[]).map(item => (
                <tr key={item.id} className={`hover:bg-slate-50/50 ${item.isDeleted ? 'bg-rose-50/50 grayscale opacity-50' : ''}`}>
                  <td className="p-4 border font-mono text-[9px] text-slate-400">{item.id}</td>
                  <td className="p-4 border font-bold text-slate-500">{new Date(item.date).toLocaleDateString('fa-AF')}</td>
                  <td className="p-4 border font-bold text-slate-800">
                    {item.description}
                  </td>
                  <td className="p-4 border font-black text-indigo-700">
                    {item.customerName || 'مشتری متفرقه'}
                  </td>
                  {type === 'hawala' && (
                    <td className="p-4 border font-black text-emerald-600">
                      {item.agentName || '---'}
                    </td>
                  )}
                  <td className="p-4 border font-black text-slate-900 text-center text-xs">
                    {(item.debit || item.credit).toLocaleString()}
                  </td>
                  <td className="p-4 border font-black text-center">
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{item.currency}</span>
                  </td>
                  {type === 'hawala' && (
                    <td className="p-4 border font-black text-amber-600 text-center">
                      {item.commission?.toLocaleString() || '0'}
                    </td>
                  )}
                  <td className="p-4 border font-bold text-slate-400 text-center">{item.rate || '1.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* بخش امضاهای رسمی (فقط در چاپ) */}
        <div className="print-only mt-24 grid grid-cols-3 gap-12 text-center">
            <div className="space-y-16">
               <p className="text-[10px] font-black text-slate-500 uppercase border-b border-slate-100 pb-2">مهر و امضاء مشتری / شخص</p>
               <div className="h-10"></div>
            </div>
            <div className="space-y-16">
               <p className="text-[10px] font-black text-slate-500 uppercase border-b border-slate-100 pb-2">تایید محاسبات و خزانه</p>
               <div className="h-10"></div>
            </div>
            <div className="space-y-16">
               <p className="text-[10px] font-black text-slate-500 uppercase border-b border-slate-100 pb-2">مدیریت عالی صرافی</p>
               <div className="h-10"></div>
            </div>
        </div>

        {/* فوتر امنیتی گزارش (فقط در چاپ) */}
        <div className="print-only mt-16 text-center border-t border-slate-100 pt-6">
           <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
              Zaki Jaber SarafCore Enterprise - Official Audit Document - Unauthorized Copying Prohibited
           </p>
           <p className="text-[7px] text-slate-400 mt-2 italic font-mono">
              System Hash: {Math.random().toString(36).substring(2, 10).toUpperCase()} | Print Date: {new Date().toISOString()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default ReportHub;
