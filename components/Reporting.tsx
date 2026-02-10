
import React, { useState, useEffect } from 'react';
import { dabService } from '../services/dabService';
import { DABReport, ReportType, SubmissionStatus } from '../types/dab.types';

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
    alert("گزارش با موفقیت توسط پورتال د افغانستان بانک (DAB) تایید شد.");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-[#0f172a] text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 -mr-48 -mt-48 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">د افغانستان بانک (DAB Portal)</h2>
            <p className="text-indigo-200 max-w-xl font-medium leading-relaxed">
              ارسال خودکار گزارشات روزانه و معاملات مشکوک به سیستم مرکزی بانک مرکزی افغانستان مطابق با لایحه صرافی‌های کشور.
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
                گزارش SAR (مشکوک)
              </button>
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-8">
              <QuickStat label="گزارشات امروز" value="۰۴" color="emerald" />
              <QuickStat label="وضعیت همگام‌سازی" value="بروز" color="emerald" />
              <QuickStat label="اتصال پورتال" value="پایدار" color="indigo" />
              <QuickStat label="کد صرافی" value="ZJ-KBL" color="amber" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800">تاریخچه ارسال گزارشات به بانک مرکزی</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                  <tr>
                    <th className="px-10 py-5">نوع گزارش</th>
                    <th className="px-10 py-5">تاریخ</th>
                    <th className="px-10 py-5">تراکنش‌ها</th>
                    <th className="px-10 py-5">وضعیت DAB</th>
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
                          <span className="font-black text-slate-700 text-sm">{report.type === ReportType.DAILY ? 'روزانه' : 'SAR (مشکوک)'}</span>
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
                          <button onClick={() => setActiveReport(report)} className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center">
                            <i className="fa fa-eye text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-10">
           {activeReport ? (
             <div className="bg-white rounded-[3rem] border-2 border-indigo-600 p-8 shadow-2xl animate-in slide-in-from-right-5 duration-500">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-black text-slate-900">پیش‌نمایش XML</h3>
                   <button onClick={() => setActiveReport(null)} className="text-slate-400"><i className="fa fa-times"></i></button>
                </div>
                
                <div className="space-y-6">
                   <div className="bg-slate-900 rounded-2xl p-6 font-mono text-[9px] text-indigo-300 h-64 overflow-y-auto">
                      <pre>{activeReport.xmlContent}</pre>
                   </div>
                   
                   <button 
                    onClick={() => handleFinalSubmit(activeReport.id)}
                    disabled={isSubmitting || activeReport.status === SubmissionStatus.ACCEPTED}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl"
                   >
                      {isSubmitting ? 'در حال ارسال...' : 'ارسال نهایی به د افغانستان بانک'}
                   </button>
                </div>
             </div>
           ) : (
             <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <i className="fa fa-building-columns text-4xl text-slate-200"></i>
                <p className="font-black text-slate-400 text-xs">گزارشی انتخاب نشده است</p>
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
    <p className={`text-lg font-black text-${color}-400`}>{value}</p>
  </div>
);

export default Reporting;
