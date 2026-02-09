
import React, { useState } from 'react';

interface LoginVerificationProps {
  onVerify: () => void;
  onCancel: () => void;
}

const LoginVerification: React.FC<LoginVerificationProps> = ({ onVerify, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setLoading(true);
    setError(false);
    
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      if (code === '123456' || code.length === 6) { // Accept any 6 digit for demo, or a specific one
        onVerify();
      } else {
        setError(true);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0f172a] animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-10 border border-slate-200">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/40 transform rotate-12">
            <i className="fa fa-vault text-3xl text-white"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800">تایید هویت دو مرحله‌ای</h2>
          <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed">
            حساب شما با تایید دو مرحله‌ای محافظت می‌شود. لطفاً کد ۶ رقمی اپلیکیشن را وارد کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setError(false);
              }}
              className={`w-full text-center text-5xl font-black tracking-[0.4em] py-6 rounded-3xl bg-slate-50 border-2 transition-all focus:outline-none ${
                error ? 'border-rose-300 text-rose-600 bg-rose-50' : 'border-slate-100 focus:border-indigo-600'
              }`}
              placeholder="000000"
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-600 font-black text-center animate-in slide-in-from-top-1">
                کد وارد شده صحیح نیست. مجدداً تلاش کنید.
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={code.length !== 6 || loading}
            className={`w-full py-5 rounded-3xl font-black text-white shadow-2xl transition-all ${
              code.length === 6 && !loading 
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 active:scale-[0.98]' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? <i className="fa fa-spinner fa-spin text-xl"></i> : 'تایید و ورود به سیستم'}
          </button>

          <button 
            type="button"
            onClick={onCancel}
            className="w-full text-sm font-black text-slate-400 hover:text-slate-600 transition-colors"
          >
            انصراف و خروج
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">SarafCore Security Shield v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default LoginVerification;
