
import React, { useState, useEffect } from 'react';
import { dabService } from '../services/dabService';
import { DABReport, ReportType, SubmissionStatus } from '../types/dab.types';
import { analyzeTransactionAML } from '../services/geminiService';

const Reporting: React.FC = () => {
  const [reports, setReports] = useState<DABReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<DABReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setReports(dabService.getHistory());
  }, []);

  const handleCreateReport = async (type: ReportType) => {
    setIsGenerating(true);
    const today = new Date().toLocaleDateString('fa-AF');
    const newReport = await dabService.generateReport(type, today);
    setReports(dabService.getHistory());
    setActiveReport(newReport);
    setIsGenerating(false);
  };

  const handleFinalSubmit = async (id: string) => {
    setIsSubmitting(true);
    await dabService.submitToPortal(id);
    setReports(dabService.getHistory());
    setActiveReport(null);
    setIsSubmitting(false);
    alert("گزارش با موفقیت توسط پورتال بانک مرکزی (DAB) تایید شد.");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-[#0f172a] text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 -mr-48 -mt-48 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">پورتال گزارش‌دهی DAB</h2>
            <p className="text-indigo-200 max-w-xl font-medium leading-relaxed">
              تولید خودکار فایل‌های XML مطابق با استانداردهای نظارتی بانک مرکزی افغانستان. این ماژول تمام تراکنش‌های روزانه را تجمیع و آماده ارسال می‌کند.
            </p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => handleCreateReport(ReportType.DAILY)}
                disabled={isGenerating}
                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl shadow-white/10 flex items-center gap-3"
              >
                {isGenerating ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-file-export"></i>}
                تولید گزارش روزانه
              </button>
              <button 
                onClick={() => handleCreateReport(ReportType.SAR)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all border border-indigo-400/30 flex items-center gap-3"
              >
                <i className="fa fa-shield-warning"></i>
                گزارش فعالیت مشکوک (SAR)
              </button>
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-8">
              <QuickStat label="گزارشات امروز" value="۰۴" color="emerald" />
              <QuickStat label="در انتظار تایید" value="۰۱" color="amber" />
              <QuickStat label="آخرین همگام‌سازی" value="۱۰:۴۵" color="indigo" />
              <QuickStat label="وضعیت اتصال" value="پایدار" color="emerald" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800">تاریخچه ارسال گزارشات</h3>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400">فیلتر: تمام گزارشات</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                  <tr>
                    <th className="px-10 py-5">نوع گزارش</th>
                    <th className="px-10 py-5">بازه زمانی</th>
                    <th className="px-10 py-5">تراکنش‌ها</th>
                    <th className="px-10 py-5">وضعیت</th>
                    <th className="px-10 py-5 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <i className="fa fa-file-code"></i>
                          </div>
                          <span className="font-black text-slate-700 text-sm">{report.type === ReportType.DAILY ? 'روزانه' : 'مشکوک (SAR)'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-bold text-slate-500 text-xs">{report.period}</td>
                      <td className="px-10 py-6 font-black text-slate-800">{report.metadata.totalTransactions} مورد</td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                          report.status === SubmissionStatus.ACCEPTED ? 'bg-emerald-100 text-emerald-600' :
                          report.status === SubmissionStatus.DRAFT ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-left">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setActiveReport(report)}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center justify-center">
                            <i className="fa fa-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr><td colSpan={5} className="px-10 py-20 text-center text-slate-300 font-bold italic">داده‌ای برای نمایش وجود ندارد</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-10">
           {activeReport ? (
             <div className="bg-white rounded-[3rem] border-2 border-indigo-600 p-10 shadow-2xl animate-in slide-in-from-right-10 duration-500">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-slate-900">پیش‌نمایش گزارش</h3>
                   <button onClick={() => setActiveReport(null)} className="text-slate-400 hover:text-rose-600">
                      <i className="fa fa-times text-xl"></i>
                   </button>
                </div>
                
                <div className="space-y-6">
                   <div className="bg-slate-900 rounded-2xl p-6 font-mono text-[10px] text-indigo-300 h-64 overflow-y-auto custom-scrollbar">
                      <pre>{activeReport.xmlContent}</pre>
                   </div>
                   
                   <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                      <div className="flex justify-between text-xs font-black">
                         <span className="text-slate-400 uppercase">تعداد تراکنش</span>
                         <span className="text-slate-800">{activeReport.metadata.totalTransactions}</span>
                      </div>
                      <div className="flex justify-between text-xs font-black">
                         <span className="text-slate-400 uppercase">حجم تقریبی (USD)</span>
                         <span className="text-emerald-600">$ {activeReport.metadata.totalVolumeUSD.toLocaleString()}</span>
                      </div>
                   </div>

                   <button 
                    onClick={() => handleFinalSubmit(activeReport.id)}
                    disabled={isSubmitting || activeReport.status === SubmissionStatus.ACCEPTED}
                    className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all ${
                      activeReport.status === SubmissionStatus.ACCEPTED 
                      ? 'bg-emerald-500 text-white opacity-50 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                    }`}
                   >
                      {isSubmitting ? <i className="fa fa-spinner fa-spin mr-2"></i> : <i className="fa fa-paper-plane mr-2"></i>}
                      {activeReport.status === SubmissionStatus.ACCEPTED ? 'ارسال شده و تایید گردید' : 'ارسال نهایی به پورتال DAB'}
                   </button>
                </div>
             </div>
           ) : (
             <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center space-y-6 min-h-[500px]">
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-slate-200">
                   <i className="fa fa-file-circle-check text-4xl"></i>
                </div>
                <div className="space-y-2">
                   <p className="font-black text-slate-400">گزارشی انتخاب نشده است</p>
                   <p className="text-xs text-slate-400 px-6">برای مشاهده جزئیات یا ارسال، یکی از گزارشات لیست را انتخاب کنید یا گزارش جدیدی بسازید.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const QuickStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-black text-${color}-400`}>{value}</p>
  </div>
);

export default Reporting;
