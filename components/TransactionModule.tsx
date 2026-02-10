
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeTransactionAML, searchEntity } from '../services/geminiService';
import { TransactionService, CustomerService } from '../services/mockBackend';
import { rateService, ExchangeRate, HistoricalRate } from '../services/rateService';
import { Transaction, UserRole } from '../types';

const TransactionModule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [amlResult, setAmlResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [liveRates, setLiveRates] = useState<ExchangeRate[]>([]);
  const [historyData, setHistoryData] = useState<HistoricalRate[]>([]);
  const [lastRateUpdate, setLastRateUpdate] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // Role Check for Permissions
  const currentUserRole = (localStorage.getItem('current_role') as UserRole) || UserRole.TELLER;
  const canExport = [UserRole.ADMIN, UserRole.COMPLIANCE, UserRole.TELLER].includes(currentUserRole);

  // Web Check States
  const [checkingWeb, setCheckingWeb] = useState(false);
  const [webCheckResult, setWebCheckResult] = useState<{ text: string, sources: any[] } | null>(null);
  
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'BUY' as any,
    amount: '',
    currency: localStorage.getItem('last_selected_currency') || 'USD',
    rate: 74.20,
    counterparty: ''
  });

  useEffect(() => {
    setCustomers(CustomerService.list());
    setRecentTransactions(TransactionService.list().slice(0, 5));
    refreshRates();

    const interval = setInterval(() => {
      refreshRates();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch historical data when currency changes
  useEffect(() => {
    rateService.fetchHistoricalRates(formData.currency).then(setHistoryData);
  }, [formData.currency]);

  const refreshRates = async () => {
    const rates = await rateService.fetchLiveRates();
    setLiveRates(rates);
    setLastRateUpdate(new Date().toLocaleTimeString('fa-AF'));
    
    const currentPair = `${formData.currency}/AFN`;
    const activeRate = rates.find(r => r.pair === currentPair);
    if (activeRate) {
      setFormData(prev => ({ ...prev, rate: parseFloat(activeRate.rate.toFixed(4)) }));
      if (errors.rate) {
          setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.rate;
              return newErrors;
          });
      }
    }
  };

  const handleExportCSV = () => {
    const data = TransactionService.list();
    if (data.length === 0) {
      alert("تراکنشی برای خروجی گرفتن وجود ندارد.");
      return;
    }

    const headers = ["ID", "Customer", "Type", "Amount", "Currency", "Rate", "Status", "AML Score", "Timestamp"];
    const rows = data.map(t => [
      t.id,
      `"${t.customer_name.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.currency,
      t.rate,
      t.status,
      t.aml_score || 0,
      t.timestamp
    ]);

    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sarafcore_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateField = (name: string, value: any) => {
    let error = '';
    if (name === 'amount') {
      if (!value) error = 'وارد کردن مبلغ الزامی است';
      else if (isNaN(Number(value)) || Number(value) <= 0) error = 'مبلغ باید عددی مثبت باشد';
    }
    if (name === 'rate') {
      if (!value) error = 'نرخ تبدیل الزامی است';
      else if (isNaN(Number(value)) || Number(value) <= 0) error = 'نرخ تبدیل نامعتبر است';
    }
    if (name === 'customerId') {
        if (!value) error = 'انتخاب مشتری الزامی است';
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[name] = error;
      else delete newErrors[name];
      return newErrors;
    });
    return error;
  };

  const handleInputChange = (field: string, value: any) => {
     setFormData(prev => ({ ...prev, [field]: value }));
     validateField(field, value);
     if (field === 'counterparty') {
        setWebCheckResult(null); // Clear previous check if name changes
     }
  };

  const handleWebCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.counterparty || formData.counterparty.length < 3) {
        alert("لطفاً نام معتبر وارد کنید");
        return;
    }
    setCheckingWeb(true);
    const result = await searchEntity(formData.counterparty);
    setWebCheckResult(result);
    setCheckingWeb(false);
  };

  const calculateCommission = (amount: number) => {
    return amount * 0.005;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountErr = validateField('amount', formData.amount);
    const rateErr = validateField('rate', formData.rate);
    const custErr = validateField('customerId', formData.customerId);

    if (amountErr || rateErr || custErr) {
        return;
    }

    setLoading(true);
    setAmlResult(null);

    const selectedCust = customers.find(c => c.id === formData.customerId);
    
    const result = await analyzeTransactionAML({
      ...formData,
      customer: selectedCust,
      timestamp: new Date().toISOString()
    });

    setAmlResult(result);
    setShowModal(true);

    const newTxn: Transaction = {
      id: `TXN-${Math.floor(Math.random() * 900000) + 100000}`,
      customer_id: formData.customerId,
      customer_name: selectedCust?.full_name || 'ناشناس',
      type: formData.type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      rate: formData.rate,
      status: result.is_suspicious ? 'SUSPICIOUS' : 'COMPLETED',
      is_suspicious: result.is_suspicious,
      aml_score: result.risk_score,
      aml_reason: result.reasoning,
      timestamp: new Date().toISOString()
    };

    TransactionService.create(newTxn);
    setRecentTransactions(prev => [newTxn, ...prev].slice(0, 5));
    setLoading(false);
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData({ ...formData, currency });
    localStorage.setItem('last_selected_currency', currency);
  };

  const getFieldWarning = (fieldName: string) => {
    if (!amlResult || !amlResult.flagged_fields) return null;
    return amlResult.flagged_fields.find((f: any) => f.field === fieldName);
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'border-rose-500 bg-rose-50 animate-shake shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'MEDIUM': return 'border-amber-500 bg-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      default: return 'border-indigo-400 bg-indigo-50';
    }
  };
  
  const getInputClass = (fieldName: string) => {
    if (errors[fieldName]) return 'border-rose-500 bg-rose-50 focus:border-rose-500 shadow-inner';
    const warning = getFieldWarning(fieldName);
    if (warning) return getSeverityClass(warning.severity);
    return 'border-transparent focus:border-indigo-500';
  };

  const commission = calculateCommission(parseFloat(formData.amount) || 0);
  const totalPayable = (parseFloat(formData.amount) || 0) * formData.rate;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {liveRates.map((rate) => (
          <div key={rate.pair} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2 group hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600 font-black text-[8px]">
                {rate.pair.split('/')[0]}
              </div>
              <span className={`text-[9px] font-black ${rate.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {rate.change >= 0 ? '+' : ''}{rate.change}%
              </span>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{rate.pair}</p>
              <p className="text-md font-black text-slate-800">{rate.rate.toFixed(rate.rate < 1 ? 4 : 2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">ثبت معامله جدید</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">فرم هوشمند با قابلیت پایش زنده ریسک</p>
          </div>
          <div className="flex gap-3 items-center">
             {canExport && (
               <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all group"
               >
                 <i className="fa fa-file-csv text-slate-400 group-hover:text-indigo-600"></i>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">خروجی CSV</span>
               </button>
             )}
             <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <i className="fa fa-clock text-indigo-400 animate-spin-slow"></i>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DAB Feed Sync: {lastRateUpdate}</span>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Selection */}
          <div className={`space-y-2 transition-all duration-500`}>
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">مشتری اصلی (KYC)</label>
              <div className="flex gap-2">
                  {errors.customerId && <span className="text-[9px] font-black text-rose-500">{errors.customerId}</span>}
                  {getFieldWarning('customerId') && (
                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('customerId').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                      <i className="fa fa-shield-exclamation"></i> ریسک {getFieldWarning('customerId').severity}
                    </span>
                  )}
              </div>
            </div>
            <select 
              className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-bold transition-all outline-none ${getInputClass('customerId')}`}
              value={formData.customerId}
              onChange={e => handleInputChange('customerId', e.target.value)}
              required
            >
              <option value="">جستجو در لیست مشتریان...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name} | {c.national_id}</option>
              ))}
            </select>
          </div>

          {/* Counterparty with Web Check */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">طرف مقابل (Counterparty)</label>
              {getFieldWarning('counterparty') && (
                <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('counterparty').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                  <i className="fa fa-user-secret"></i> هویت مشکوک
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type="text" 
                className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-bold outline-none transition-all ${getInputClass('counterparty')} pr-24`}
                placeholder="نام طرف دوم یا ذینفع نهایی"
                value={formData.counterparty}
                onChange={e => handleInputChange('counterparty', e.target.value)}
              />
              <button
                 type="button"
                 onClick={handleWebCheck}
                 disabled={checkingWeb || !formData.counterparty}
                 className="absolute left-2 top-2 bottom-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 rounded-2xl text-[10px] font-black transition-colors flex items-center gap-2"
              >
                 {checkingWeb ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-globe"></i>}
                 Web Check
              </button>
            </div>
            {webCheckResult && (
                <div className="mt-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs animate-in slide-in-from-top-2">
                    <div className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                        <i className="fa fa-search"></i> نتایج جستجوی وب (Gemini Flash)
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-2">{webCheckResult.text}</p>
                    {webCheckResult.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {webCheckResult.sources.slice(0,3).map((s: any, idx) => (
                                <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-500 bg-white px-2 py-0.5 rounded border border-indigo-100 truncate max-w-[150px]">
                                    <i className="fa fa-external-link-alt mr-1"></i> {s.title || 'Source'}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">مبلغ و ارز</label>
              <div className="flex gap-2">
                  {errors.amount && <span className="text-[9px] font-black text-rose-500">{errors.amount}</span>}
                  {getFieldWarning('amount') && (
                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('amount').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                      <i className="fa fa-chart-line-down"></i> انحراف مبلغ
                    </span>
                  )}
              </div>
            </div>
            <div className="relative">
              <input 
                type="number" 
                className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-black text-2xl outline-none transition-all ${getInputClass('amount')}`}
                placeholder="0.00"
                value={formData.amount}
                onChange={e => handleInputChange('amount', e.target.value)}
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <select 
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-indigo-600 outline-none"
                  value={formData.currency}
                  onChange={e => handleCurrencyChange(e.target.value)}
                 >
                   <option value="USD">USD</option>
                   <option value="EUR">EUR</option>
                   <option value="AFN">AFN</option>
                   <option value="PKR">PKR</option>
                   <option value="IRR">IRR</option>
                 </select>
              </div>
            </div>
          </div>

          {/* Final Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">نرخ تبدیل نهایی</label>
              <div className="flex gap-2">
                  {errors.rate && <span className="text-[9px] font-black text-rose-500">{errors.rate}</span>}
                  {getFieldWarning('rate') && (
                    <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('rate').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                      <i className="fa fa-scale-unbalanced"></i> نرخ غیرمتعارف
                    </span>
                  )}
              </div>
            </div>
            <div className="relative">
              <input 
                type="number" 
                step="0.0001"
                className={`w-full bg-indigo-50/50 border-2 rounded-3xl px-6 py-4 font-black text-xl text-indigo-700 outline-none transition-all ${getInputClass('rate')}`}
                value={formData.rate}
                onChange={e => handleInputChange('rate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Historical Rate Chart */}
          <div className="md:col-span-2 bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 relative overflow-hidden">
             <div className="flex justify-between items-center mb-4 px-2 relative z-10">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <i className="fa fa-arrow-trend-up"></i>
                   روند قیمت {formData.currency}/AFN (۷ روز گذشته)
                </h4>
                <span className="text-[10px] font-black text-indigo-500 bg-white border border-indigo-100 px-3 py-1 rounded-full shadow-sm">
                  Historical Analysis
                </span>
             </div>
             <div className="h-40 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={historyData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                        cursor={{stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4'}}
                      />
                      <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} fill="url(#rateGrad)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} />
                      <YAxis domain={['auto', 'auto']} hide />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button 
              type="submit" 
              disabled={loading || Object.keys(errors).length > 0}
              className={`w-full py-6 rounded-[2rem] font-black text-white text-lg transition-all shadow-2xl relative overflow-hidden group ${loading || Object.keys(errors).length > 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black active:scale-[0.98]'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                   <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                   <span>در حال تحلیل نظارتی AML...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                   <i className="fa fa-magnifying-glass-chart"></i>
                   <span>ثبت و تحلیل تراکنش</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Activity Display for Module Context */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">تراکنش‌های اخیر شعبه</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">Recent Log Feed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-10 py-4">شناسه</th>
                <th className="px-10 py-4">مشتری</th>
                <th className="px-10 py-4">مبلغ</th>
                <th className="px-10 py-4">نرخ</th>
                <th className="px-10 py-4">وضعیت AML</th>
                <th className="px-10 py-4">زمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransactions.map(txn => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-4 font-mono text-[10px] text-slate-400">{txn.id}</td>
                  <td className="px-10 py-4 font-black text-slate-700 text-xs">{txn.customer_name}</td>
                  <td className="px-10 py-4 font-black text-slate-900 text-xs">{txn.amount.toLocaleString()} {txn.currency}</td>
                  <td className="px-10 py-4 font-bold text-slate-500 text-[10px]">{txn.rate} AFN</td>
                  <td className="px-10 py-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                      txn.is_suspicious ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {txn.is_suspicious ? 'Suspicious' : 'Clean'}
                    </span>
                  </td>
                  <td className="px-10 py-4 text-[10px] font-bold text-slate-400">
                    {new Date(txn.timestamp).toLocaleTimeString('fa-AF')}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-300 font-bold italic text-xs">تراکنشی یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Modal */}
      {showModal && amlResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
            
            <div className={`p-8 flex justify-between items-center ${amlResult.is_suspicious ? 'bg-rose-600' : 'bg-indigo-600'} text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <i className={`fa ${amlResult.is_suspicious ? 'fa-triangle-exclamation' : 'fa-check-circle'} text-2xl`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-black">گزارش نهایی و تحلیل انطباق</h3>
                  <p className="text-[10px] opacity-80 font-black uppercase tracking-widest">SarafCore Compliance Engine Output</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">اطلاعات مالی</h4>
                  <div className="space-y-4">
                    <DetailRow label="مبلغ ناخالص" value={`${parseFloat(formData.amount).toLocaleString()} ${formData.currency}`} />
                    <DetailRow label="نرخ تبدیل" value={`${formData.rate} AFN`} />
                    <DetailRow label="کمیسیون معامله" value={`${commission.toFixed(4)} ${formData.currency}`} color="rose" />
                    <DetailRow label="کل قابل پرداخت" value={`${totalPayable.toLocaleString()} AFN`} isBold />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">اطلاعات هویتی</h4>
                  <div className="space-y-4">
                    <DetailRow label="مشتری" value={customers.find(c => c.id === formData.customerId)?.full_name || 'ناشناس'} />
                    <DetailRow label="طرف مقابل" value={formData.counterparty || 'ثبت نشده'} />
                    <DetailRow label="زمان ثبت" value={new Date().toLocaleTimeString('fa-AF')} />
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border-2 ${amlResult.is_suspicious ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${amlResult.is_suspicious ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      <h4 className="font-black text-slate-800">تحلیل هوش مصنوعی (Gemini 3 Pro)</h4>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${amlResult.is_suspicious ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                      نمره ریسک: {amlResult.risk_score}%
                   </div>
                </div>

                <div className="bg-white/80 p-6 rounded-3xl border border-white mb-6">
                   <p className="text-sm font-bold text-slate-700 leading-relaxed">{amlResult.reasoning}</p>
                </div>

                {amlResult.flagged_fields && amlResult.flagged_fields.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amlResult.flagged_fields.map((f: any, idx: number) => (
                      <div key={idx} className={`flex gap-4 items-start p-4 rounded-2xl border transition-all ${
                        f.severity === 'HIGH' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'
                      }`}>
                         <i className={`fa fa-circle-exclamation ${f.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'} mt-1`}></i>
                         <div>
                            <span className={`text-[9px] font-black uppercase block mb-1 ${f.severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                              {f.field === 'customerId' ? 'پروفایل مشتری' : f.field === 'amount' ? 'مبلغ تراکنش' : f.field === 'rate' ? 'نرخ تبدیل' : f.field === 'counterparty' ? 'طرف مقابل' : f.field}
                              {' - '} {f.severity}
                            </span>
                            <p className="text-xs font-bold text-slate-700 leading-tight">{f.reason}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl">
                 <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">اقدام پیشنهادی (Action Plan)</p>
                    <p className="text-sm font-black text-indigo-400">{amlResult.suggested_action}</p>
                 </div>
                 <i className="fa fa-shield-halved text-4xl text-white/10"></i>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all shadow-sm"
              >
                بستن و بازگشت
              </button>
              {amlResult.is_suspicious ? (
                <button 
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20"
                  onClick={() => { alert("گزارش STR با موفقیت برای DAB تولید و در صف ارسال قرار گرفت."); setShowModal(false); }}
                >
                  <i className="fa fa-file-export mr-2"></i>
                  ارسال گزارش مشکوک به DAB
                </button>
              ) : (
                <button 
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
                  onClick={() => setShowModal(false)}
                >
                  <i className="fa fa-print mr-2"></i>
                  چاپ رسید و تایید نهایی
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const DetailRow: React.FC<{ label: string, value: string, color?: string, isBold?: boolean }> = ({ label, value, color, isBold }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm ${isBold ? 'font-black' : 'font-bold'} ${color === 'rose' ? 'text-rose-600' : 'text-slate-800'}`}>{value}</span>
  </div>
);

export default TransactionModule;
