
import React, { useState, useEffect } from 'react';
import { analyzeTransactionAML } from '../services/geminiService';
import { TransactionService, CustomerService } from '../services/mockBackend';
import { rateService, ExchangeRate } from '../services/rateService';
import { Transaction } from '../types';

const TransactionModule: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [amlResult, setAmlResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [liveRates, setLiveRates] = useState<ExchangeRate[]>([]);
  const [lastRateUpdate, setLastRateUpdate] = useState<string>('');
  
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'BUY' as any,
    amount: '',
    currency: localStorage.getItem('last_selected_currency') || 'USD',
    rate: 74.20,
    counterparty: ''
  });

  // دریافت لیست مشتریان و نرخ‌های اولیه
  useEffect(() => {
    setCustomers(CustomerService.list());
    refreshRates();

    const interval = setInterval(() => {
      refreshRates();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshRates = async () => {
    const rates = await rateService.fetchLiveRates();
    setLiveRates(rates);
    setLastRateUpdate(new Date().toLocaleTimeString('fa-AF'));
    
    const currentPair = `${formData.currency}/AFN`;
    const activeRate = rates.find(r => r.pair === currentPair);
    if (activeRate) {
      setFormData(prev => ({ ...prev, rate: parseFloat(activeRate.rate.toFixed(4)) }));
    }
  };

  useEffect(() => {
    const currentPair = `${formData.currency}/AFN`;
    const activeRate = liveRates.find(r => r.pair === currentPair);
    if (activeRate) {
      setFormData(prev => ({ ...prev, rate: parseFloat(activeRate.rate.toFixed(4)) }));
    }
  }, [formData.currency, liveRates]);

  const calculateCommission = (amount: number) => {
    return amount * 0.005;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="text-right">
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
              {getFieldWarning('customerId') && (
                <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('customerId').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                  <i className="fa fa-shield-exclamation"></i> ریسک {getFieldWarning('customerId').severity}
                </span>
              )}
            </div>
            <select 
              className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-bold transition-all outline-none ${
                getFieldWarning('customerId') ? getSeverityClass(getFieldWarning('customerId').severity) : 'border-transparent focus:border-indigo-500'
              }`}
              value={formData.customerId}
              onChange={e => setFormData({...formData, customerId: e.target.value})}
              required
            >
              <option value="">جستجو در لیست مشتریان...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.full_name} | {c.national_id}</option>
              ))}
            </select>
          </div>

          {/* Counterparty */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">طرف مقابل (Counterparty)</label>
              {getFieldWarning('counterparty') && (
                <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('counterparty').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                  <i className="fa fa-user-secret"></i> هویت مشکوک
                </span>
              )}
            </div>
            <input 
              type="text" 
              className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-bold outline-none transition-all ${
                getFieldWarning('counterparty') ? getSeverityClass(getFieldWarning('counterparty').severity) : 'border-transparent focus:border-indigo-500'
              }`}
              placeholder="نام طرف دوم یا ذینفع نهایی"
              value={formData.counterparty}
              onChange={e => setFormData({...formData, counterparty: e.target.value})}
            />
          </div>

          {/* Amount and Currency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">مبلغ و ارز</label>
              {getFieldWarning('amount') && (
                <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('amount').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                  <i className="fa fa-chart-line-down"></i> انحراف مبلغ
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type="number" 
                className={`w-full bg-slate-50 border-2 rounded-3xl px-6 py-4 font-black text-2xl outline-none transition-all ${
                  getFieldWarning('amount') ? getSeverityClass(getFieldWarning('amount').severity) : 'border-transparent focus:border-indigo-500'
                }`}
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
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
              {getFieldWarning('rate') && (
                <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${getFieldWarning('rate').severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'}`}>
                  <i className="fa fa-scale-unbalanced"></i> نرخ غیرمتعارف
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type="number" 
                step="0.0001"
                className={`w-full bg-indigo-50/50 border-2 rounded-3xl px-6 py-4 font-black text-xl text-indigo-700 outline-none transition-all ${
                  getFieldWarning('rate') ? getSeverityClass(getFieldWarning('rate').severity) : 'border-transparent focus:border-indigo-500'
                }`}
                value={formData.rate}
                onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-6 rounded-[2rem] font-black text-white text-lg transition-all shadow-2xl relative overflow-hidden group ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black active:scale-[0.98]'}`}
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
