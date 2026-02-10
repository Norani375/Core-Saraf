
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionService, CustomerService, AuditService } from '../services/mockBackend';
import { searchRegulatoryNews } from '../services/geminiService';
import { Transaction, SystemAuditLog } from '../types';

const Dashboard: React.FC = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [news, setNews] = useState<{ text: string, sources: any[] } | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [stats, setStats] = useState({
    volume: 0,
    customers: 0,
    suspicious: 0,
    rate: 74.20
  });

  useEffect(() => {
    const data = TransactionService.list();
    const custs = CustomerService.list();
    const auditLogs = AuditService.getLogs();
    
    setTxns(data);
    setLogs(auditLogs);
    
    setStats({
      volume: data.reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount : curr.amount / curr.rate), 0),
      customers: custs.length,
      suspicious: data.filter(t => t.is_suspicious).length,
      rate: 74.20
    });

    // Fetch Regulatory News
    searchRegulatoryNews().then(result => {
        setNews(result);
        setLoadingNews(false);
    });
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Minimal Header */}
      <div className="flex justify-between items-end pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">وضعیت عملیاتی</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            نظارت زنده شعبه مرکزی
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">بروزرسانی نهایی</p>
          <p className="text-sm font-black text-slate-900">{new Date().toLocaleTimeString('fa-AF')}</p>
        </div>
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="حجم معاملات (USD)" value={stats.volume.toLocaleString()} trend="+2.4%" color="indigo" />
        <MetricCard label="مشتریان فعال" value={stats.customers.toString()} trend="KYC" color="emerald" />
        <MetricCard label="هشدارهای AML" value={stats.suspicious.toString()} trend="High Priority" color="rose" isCritical={stats.suspicious > 0} />
        <MetricCard label="نرخ لحظه‌ای USD" value={stats.rate.toString()} trend="DAB Feed" color="slate" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Chart Area */}
        <div className="xl:col-span-8 space-y-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">نوسانات نقدینگی هفتگی</h3>
              <select className="bg-slate-50 border-none rounded-xl px-4 py-1.5 text-[10px] font-black text-slate-400 outline-none">
                <option>۷ روز گذشته</option>
                <option>۳۰ روز گذشته</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'شنبه', v: 4000 }, { name: 'یکشنبه', v: 5200 }, { name: 'دوشنبه', v: 3800 },
                  { name: 'سه‌شنبه', v: 6500 }, { name: 'چهارشنبه', v: 4800 }, { name: 'پنجشنبه', v: 7200 }
                ]}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold'}}
                    cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} fill="url(#chartGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clean Transaction List */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">آخرین فعالیت‌ها</h3>
              <button className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 transition-colors">مشاهده پورتفولیو</button>
            </div>
            <div className="divide-y divide-slate-50">
              {txns.slice(0, 4).map(t => (
                <div key={t.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-default group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      t.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type === 'BUY' ? 'خ' : 'ف'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{t.customer_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.timestamp).toLocaleTimeString('fa-AF')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{t.amount.toLocaleString()} <span className="text-[10px] text-slate-400">{t.currency}</span></p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      t.status === 'COMPLETED' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'
                    }`}>{t.status}</span>
                  </div>
                </div>
              ))}
              {txns.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold text-xs italic">تراکنشی یافت نشد</div>
              )}
            </div>
          </div>
        </div>

        {/* Side Rail - Critical Info & Logs */}
        <div className="xl:col-span-4 space-y-6">
          
           {/* Regulatory News Feed - New Component using Google Search */}
           <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-slate-800">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                   <i className="fa fa-globe"></i> Global Intel
                 </h4>
                 {loadingNews && <i className="fa fa-spinner fa-spin text-indigo-400"></i>}
               </div>
               
               <div className="space-y-4">
                  {loadingNews ? (
                    <div className="space-y-2 animate-pulse">
                       <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                       <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                       <div className="h-2 bg-slate-700 rounded w-5/6"></div>
                    </div>
                  ) : news ? (
                    <>
                       <div className="text-xs font-medium leading-relaxed text-slate-300 line-clamp-6">
                          {news.text}
                       </div>
                       {news.sources.length > 0 && (
                         <div className="pt-2 border-t border-white/10 mt-2">
                            <p className="text-[9px] text-slate-500 font-bold mb-1">Sources:</p>
                            <div className="flex flex-wrap gap-2">
                               {news.sources.slice(0, 2).map((s: any, idx: number) => (
                                 <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[9px] bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors truncate max-w-[120px]">
                                    {s.title || 'Source Link'}
                                 </a>
                               ))}
                            </div>
                         </div>
                       )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">Unable to load news feed.</p>
                  )}
               </div>
             </div>
           </div>

          {/* Quick Compliance Widget */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance Health</h4>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <p className="text-2xl font-black text-slate-800">۹۸.۴٪</p>
                   <p className="text-[10px] text-slate-400 font-bold">DAB Compliance Score</p>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[98%] transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Audit Feed */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Audit Feed</h4>
            <div className="space-y-6">
              {logs.slice(0, 3).map(log => (
                <div key={log.id} className="flex gap-4">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    log.severity === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                    log.severity === 'WARNING' ? 'bg-amber-500' : 'bg-slate-200'
                  }`}></div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-800 leading-snug">{log.details}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(log.timestamp).toLocaleTimeString('fa-AF')}</p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-[10px] text-slate-300 font-bold italic">No logs available</p>}
            </div>
            <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
              Full System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string, trend: string, color: string, isCritical?: boolean }> = ({ label, value, trend, color, isCritical }) => (
  <div className={`bg-white p-7 rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-${color}-200 flex flex-col justify-between h-40 group ${isCritical ? 'ring-2 ring-rose-100 border-rose-200' : ''}`}>
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center group-hover:bg-${color}-600 group-hover:text-white transition-all shadow-sm`}>
        <i className={`fa ${isCritical ? 'fa-triangle-exclamation' : 'fa-chart-simple'} text-sm`}></i>
      </div>
      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>{trend}</span>
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

export default Dashboard;
