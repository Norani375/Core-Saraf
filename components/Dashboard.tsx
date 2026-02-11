
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { searchRegulatoryNews, askRegulatoryQuestion } from '../services/geminiService';
import { JournalEntry, SystemAuditLog } from '../types';

const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [news, setNews] = useState<{ text: string, sources: any[] } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<{text: string, sources: any[], status?: string} | null>(null);
  const [isChatting, setIsChatting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const data = db.getJournal();
    setEntries(data);
    setLogs(db.getLogs());
    
    searchRegulatoryNews().then(result => {
        setNews(result);
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

  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.description.toLowerCase().includes(q) || 
        e.customerName?.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'ALL') {
      result = result.filter(e => e.category === filterType);
    }
    
    result.sort((a, b) => {
      let comp = sortBy === 'date' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : (a.debit + a.credit) - (b.debit + b.credit);
      return sortDirection === 'desc' ? -comp : comp;
    });
    return result;
  }, [entries, searchQuery, filterType, sortBy, sortDirection]);

  return (
    <div className="space-y-10 animate-in fade-in pb-20 no-print">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">پنل مدیریت صرافی ذکی جابر</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              سیستم نظارتی هوشمند فعال است
            </p>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">وضعیت هوش مصنوعی</p>
            <div className="flex items-center gap-2 mt-1">
               <span className={`w-1.5 h-1.5 rounded-full ${chatResponse?.status === 'quota_exceeded' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
               <p className="text-xs font-black text-slate-700">
                 {chatResponse?.status === 'quota_exceeded' ? 'محدودیت موقت سهمیه' : 'آنلاین و آماده تحلیل'}
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-10">
          {/* AI Advisor Section */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
            {chatResponse?.status === 'quota_exceeded' && (
              <div className="absolute top-0 right-0 left-0 bg-amber-500 text-white text-[9px] font-black py-1 text-center uppercase tracking-widest z-20">
                AI Service Quota Reached - System in Local Mode
              </div>
            )}
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-6">
                 <i className="fa fa-magnifying-glass-shield text-indigo-600"></i>
                 مشاور هوشمند قوانین و بخشنامه‌ها
            </h3>
            <form onSubmit={handleAskLaw} className="relative mb-6">
              <input 
                type="text" 
                placeholder="سوال خود را بپرسید (مثلاً: سقف معاملات روزانه چقدر است؟)" 
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold focus:ring-2 focus:ring-indigo-600 pr-32 text-sm outline-none" 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
              />
              <button type="submit" disabled={isChatting} className="absolute left-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-black text-[10px] hover:bg-indigo-700 transition-all disabled:opacity-50">
                {isChatting ? <i className="fa fa-spinner fa-spin"></i> : 'استعلام'}
              </button>
            </form>
            
            {chatResponse && (
               <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 ${chatResponse.status === 'quota_exceeded' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50/50 border-indigo-100'}`}>
                  <p className={`text-sm leading-relaxed font-medium mb-4 ${chatResponse.status === 'quota_exceeded' ? 'text-amber-800' : 'text-slate-700'}`}>
                    {chatResponse.text}
                  </p>
                  {chatResponse.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {chatResponse.sources.map((s, idx) => (
                        <a key={idx} href={s.uri} target="_blank" className="text-[9px] bg-white border border-indigo-100 px-3 py-1 rounded-full text-indigo-600 font-black hover:bg-indigo-600 hover:text-white transition-all">
                           <i className="fa fa-link mr-1"></i> {s.title}
                        </a>
                      ))}
                    </div>
                  )}
               </div>
            )}
          </div>

          {/* Detailed Recent Transactions Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa fa-list-ul text-indigo-500"></i>
                   آخرین تراکنش‌ها
                </h3>
                <span className="text-[9px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-tighter">Live Monitor</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="relative">
                   <i className="fa fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]"></i>
                   <input type="text" placeholder="جستجو..." className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-[10px] font-bold outline-none focus:border-indigo-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                 </div>
                 <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black outline-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="ALL">همه دسته‌ها</option>
                    <option value="EXCHANGE_BUY">خرید ارز</option>
                    <option value="EXCHANGE_SELL">فروش ارز</option>
                    <option value="HAWALA_SEND">حواله صادره</option>
                    <option value="HAWALA_RECEIVE">حواله وارده</option>
                    <option value="CASH_IN">رسید نقد</option>
                    <option value="CASH_OUT">برد نقد</option>
                 </select>
                 <button onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                    <i className={`fa fa-sort-amount-${sortDirection === 'desc' ? 'down' : 'up'}`}></i>
                    {sortDirection === 'desc' ? 'نزولی (جدیدترین)' : 'صعودی (قدیمی‌ترین)'}
                 </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">شناسه</th>
                    <th className="px-8 py-5">مشتری</th>
                    <th className="px-8 py-5 text-center">زمان و تاریخ</th>
                    <th className="px-8 py-5 text-center">نوع تراکنش</th>
                    <th className="px-8 py-5 text-left">مبلغ و واحد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAndSortedEntries.slice(0, 8).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-8 py-5 font-mono text-[9px] text-slate-300 group-hover:text-indigo-400 transition-colors">
                        {t.id}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${t.debit > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {t.customerName ? t.customerName[0] : '?'}
                          </div>
                          <span className="text-xs font-black text-slate-800">{t.customerName || 'مشتری متفرقه'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="text-[10px] font-black text-slate-600">{new Date(t.date).toLocaleDateString('fa-AF')}</div>
                        <div className="text-[8px] font-bold text-slate-400 mt-0.5">{new Date(t.date).toLocaleTimeString('fa-AF', {hour: '2-digit', minute: '2-digit'})}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">
                          {t.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-left">
                        <div className={`text-sm font-black ${t.debit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.debit > 0 ? '+' : '-'}{(t.debit || t.credit).toLocaleString()}
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.currency}</div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic text-xs">
                         <i className="fa fa-folder-open text-4xl block mb-4 opacity-20"></i>
                         هیچ تراکنشی یافت نشد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-slate-50/30 text-center border-t">
               <Link to="/journal" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-all flex items-center justify-center gap-2">
                 مشاهده کل دفتر روزنامه <i className="fa fa-chevron-left text-[8px]"></i>
               </Link>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           {/* Audit Logs Sidebar */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative min-h-[500px]">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <i className="fa fa-shield-halved text-[120px]"></i>
             </div>
             <div className="relative z-10">
               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <i className="fa fa-shield-halved"></i> لاگ‌های امنیتی سیستم
               </h4>
               <div className="space-y-4">
                  {logs.slice(0, 10).map(log => (
                    <div key={log.id} className="border-b border-white/5 pb-3 hover:bg-white/5 transition-all p-2 rounded-lg cursor-default group">
                       <p className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">{log.details}</p>
                       <div className="flex justify-between items-center mt-1">
                         <p className="text-[8px] text-slate-500 uppercase">{new Date(log.timestamp).toLocaleTimeString('fa-AF')}</p>
                         <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                           log.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-500' : 
                           log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-500'
                         }`}>
                           {log.severity}
                         </span>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
