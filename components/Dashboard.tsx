
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionService, CustomerService, AuditService } from '../services/mockBackend';
import { searchRegulatoryNews, askRegulatoryQuestion } from '../services/geminiService';
import { Transaction, SystemAuditLog } from '../types';

const Dashboard: React.FC = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [news, setNews] = useState<{ text: string, sources: any[] } | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<{text: string, sources: any[]} | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  const [stats, setStats] = useState({
    volume: 0,
    customers: 0,
    suspicious: 0,
    rate: 74.20
  });

  useEffect(() => {
    const data = TransactionService.list();
    setTxns(data);
    setLogs(AuditService.getLogs());
    setStats({
      volume: data.reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount : curr.amount / curr.rate), 0),
      customers: CustomerService.list().length,
      suspicious: data.filter(t => t.is_suspicious).length,
      rate: 74.20
    });

    searchRegulatoryNews().then(result => {
        setNews(result);
        setLoadingNews(false);
    });
  }, []);

  const handleAskLaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setIsChatting(true);
    const result = await askRegulatoryQuestion(chatInput);
    setChatResponse(result);
    setIsChatting(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      {/* Header & Market Ticker */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">پنل مدیریت نظارتی صرافی</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              سیستم متصل به پورتال نظارتی DAB
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">نرخ لحظه‌ای شهزاده</p>
            <p className="text-xl font-black text-emerald-600">74.25 <span className="text-xs text-slate-400">AFN</span></p>
          </div>
        </div>
        
        <div className="bg-slate-900 h-10 rounded-xl flex items-center overflow-hidden border border-slate-800">
           <div className="flex-shrink-0 bg-indigo-600 h-full flex items-center px-4 text-[10px] font-black text-white uppercase">Live Market</div>
           <div className="flex gap-12 animate-marquee whitespace-nowrap px-4 text-[10px] font-bold text-slate-400 uppercase">
              <span>USD/AFN: 74.25 <i className="fa fa-caret-up text-emerald-500"></i></span>
              <span>EUR/AFN: 80.40 <i className="fa fa-caret-down text-rose-500"></i></span>
              <span>SAR/AFN: 19.80 <i className="fa fa-caret-up text-emerald-500"></i></span>
              <span>PKR/AFN: 0.26 <i className="fa fa-caret-down text-rose-500"></i></span>
              <span>Toman/AFN: 0.0012 <i className="fa fa-caret-up text-emerald-500"></i></span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="گردش ارزی (USD)" value={stats.volume.toLocaleString()} trend="+2.4%" color="indigo" />
        <MetricCard label="پروفایل‌های KYC" value={stats.customers.toString()} trend="Active" color="emerald" />
        <MetricCard label="هشدارهای ریسک" value={stats.suspicious.toString()} trend="High Risk" color="rose" isCritical={stats.suspicious > 0} />
        <MetricCard label="وضعیت انطباق" value="عالی" trend="DAB Audit" color="slate" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          {/* Main Intelligence Section */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                 <i className="fa fa-magnifying-glass-shield text-indigo-600"></i>
                 مشاور هوشمند قوانین و مقررات (Grounding AI)
              </h3>
            </div>
            
            <form onSubmit={handleAskLaw} className="relative mb-6">
              <input 
                type="text"
                placeholder="در مورد قوانین جدید لیلام، سقف معاملات یا AML بپرسید..."
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold focus:ring-2 focus:ring-indigo-600 pr-32"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isChatting}
                className="absolute left-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                {isChatting ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-paper-plane"></i>}
                استعلام زنده
              </button>
            </form>

            {chatResponse && (
               <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 animate-in slide-in-from-top-4">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">{chatResponse.text}</p>
                  {chatResponse.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                       {chatResponse.sources.map((s, idx) => (
                         <a key={idx} href={s.uri} target="_blank" className="text-[9px] bg-white border border-indigo-100 px-3 py-1 rounded-full text-indigo-600 font-black flex items-center gap-1">
                            <i className="fa fa-link"></i> {s.title}
                         </a>
                       ))}
                    </div>
                  )}
               </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">معاملات اخیر در پورتال</h3>
              <button className="text-[9px] font-black text-indigo-600 hover:underline">مشاهده دفتر کل</button>
            </div>
            <div className="divide-y divide-slate-50">
              {txns.slice(0, 5).map(t => (
                <div key={t.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${t.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {t.type[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{t.customer_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{t.id} • {new Date(t.timestamp).toLocaleTimeString('fa-AF')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{t.amount.toLocaleString()} <span className="text-[10px] text-slate-400">{t.currency}</span></p>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${t.is_suspicious ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {t.is_suspicious ? 'AML ALERT' : 'COMPLIANT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-slate-800 shadow-2xl">
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <i className="fa fa-newspaper"></i> هوش نظارتی بازار
                 </h4>
                 {loadingNews && <i className="fa fa-spinner fa-spin text-indigo-400"></i>}
               </div>
               
               <div className="space-y-4">
                  {news ? (
                    <>
                       <div className="text-xs font-medium leading-relaxed text-slate-300 line-clamp-[10] bg-white/5 p-4 rounded-2xl border border-white/5">
                          {news.text}
                       </div>
                       <div className="flex flex-col gap-2 mt-4">
                          {news.sources.slice(0, 2).map((s: any, idx: number) => (
                            <a key={idx} href={s.uri} target="_blank" className="text-[9px] bg-indigo-500/10 px-3 py-2 rounded-xl text-indigo-300 font-bold flex justify-between group hover:bg-indigo-500/20">
                               <span className="truncate">{s.title}</span>
                               <i className="fa fa-arrow-left text-[8px]"></i>
                            </a>
                          ))}
                       </div>
                    </>
                  ) : <div className="animate-pulse h-40 bg-slate-800 rounded-2xl"></div>}
               </div>
             </div>
           </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Audit & Security</h4>
            <div className="space-y-4">
              {logs.slice(0, 3).map(log => (
                <div key={log.id} className="flex gap-3 items-start">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${log.severity === 'CRITICAL' ? 'bg-rose-500 shadow-sm' : 'bg-indigo-400'}`}></div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">{log.details}</p>
                    <p className="text-[8px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleTimeString('fa-AF')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, trend: string, color: string, isCritical?: boolean }> = ({ label, value, trend, color, isCritical }) => (
  <div className={`bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md h-40 flex flex-col justify-between group ${isCritical ? 'border-rose-200' : ''}`}>
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>
        <i className={`fa ${isCritical ? 'fa-warning' : 'fa-chart-line'} text-sm`}></i>
      </div>
      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>{trend}</span>
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

export default Dashboard;
