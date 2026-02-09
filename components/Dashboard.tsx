
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TransactionService, CustomerService, AuditService } from '../services/mockBackend';
import { Transaction, SystemAuditLog } from '../types';

const Dashboard: React.FC = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
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
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">پیشخوان پایش عملیات</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">مانیتورینگ زنده ترافیک مالی و وضعیت انطباق شعبه مرکزی</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="bg-white border-2 border-slate-100 px-6 py-4 rounded-[2rem] shadow-sm flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node.js API: Connected</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="حجم کل روز (USD)" value={stats.volume.toLocaleString()} trend="+4.5%" icon="fa-vault" color="indigo" />
        <StatCard title="مشتریان فعال" value={stats.customers.toString()} trend="ثبت شده" icon="fa-users" color="emerald" />
        <StatCard title="هشدارهای AML" value={stats.suspicious.toString()} trend="نیاز به بررسی" icon="fa-shield-halved" color="rose" isCritical={stats.suspicious > 0} />
        <StatCard title="نرخ لحظه‌ای" value={stats.rate.toString()} trend="DAB Feed" icon="fa-globe" color="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-800">جریان نقدینگی (۷ روز اخیر)</h3>
                <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Layer</div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'شنبه', v: 4000 }, { name: 'یکشنبه', v: 5200 }, { name: 'دوشنبه', v: 3800 },
                    { name: 'سه‌شنبه', v: 6500 }, { name: 'چهارشنبه', v: 4800 }, { name: 'پنجشنبه', v: 7200 }
                  ]}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontStyle: 'normal'}} />
                    <Area type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={5} fill="url(#chartGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">تراکنش‌های اخیر (Database Records)</h3>
                <button className="text-[10px] font-black text-indigo-600 hover:underline">مشاهده همه</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
                    <tr>
                      <th className="px-10 py-5">شناسه</th>
                      <th className="px-10 py-5">مشتری</th>
                      <th className="px-10 py-5">مبلغ</th>
                      <th className="px-10 py-5">وضعیت نظارتی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {txns.slice(0, 5).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-10 py-6 font-mono text-[10px] font-bold text-slate-400">{t.id}</td>
                        <td className="px-10 py-6 font-black text-slate-700">{t.customer_name}</td>
                        <td className="px-10 py-6 font-black text-slate-900">{t.amount.toLocaleString()} {t.currency}</td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                            t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {txns.length === 0 && (
                      <tr><td colSpan={4} className="px-10 py-20 text-center text-slate-300 font-bold italic">داده‌ای ثبت نشده است</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="space-y-10">
           <div className="bg-[#0f172a] rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-4 text-indigo-400 uppercase tracking-tighter">
                <i className="fa fa-terminal"></i>
                Audit System Logs
              </h3>
              <div className="space-y-6 relative z-10">
                 {logs.slice(0, 4).map(log => (
                   <div key={log.id} className="border-r-2 border-slate-700 pr-4 space-y-1 hover:border-indigo-500 transition-all cursor-default">
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] font-black text-slate-500 uppercase">{log.action}</span>
                         <span className={`w-1.5 h-1.5 rounded-full ${log.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-300 leading-relaxed">{log.details}</p>
                      <p className="text-[8px] text-slate-600 font-black">{new Date(log.timestamp).toLocaleTimeString('fa-AF')}</p>
                   </div>
                 ))}
                 {logs.length === 0 && <p className="text-xs text-slate-600 font-black italic">No activity logged.</p>}
              </div>
              <button className="w-full mt-10 py-4 bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all">
                 System History
              </button>
           </div>

           <div className="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 -mr-24 -mt-24 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-black mb-6">گزارش‌دهی انطباق</h3>
              <p className="text-xs font-medium leading-relaxed opacity-80 mb-8">تمام فعالیت‌ها بر اساس پروتکل‌های FATF و استانداردهای بانک مرکزی بصورت خودکار رمزنگاری و ثبت می‌شوند.</p>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-200">
                    <span>DAB Connectivity</span>
                    <span className="text-emerald-400">Stable</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[94%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, trend: string, icon: string, color: string, isCritical?: boolean }> = ({ title, value, trend, icon, color, isCritical }) => (
  <div className={`bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-2xl transition-all ${isCritical ? 'ring-2 ring-rose-200' : ''}`}>
    <div className="flex justify-between items-start mb-8">
      <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white transition-all shadow-sm`}>
        <i className={`fa ${icon} text-2xl`}></i>
      </div>
      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{trend}</span>
    </div>
    <div>
      <h4 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{value}</h4>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
    </div>
  </div>
);

export default Dashboard;
