
import React, { useState } from 'react';

interface SecuritySettingsProps {
  is2FAEnabled: boolean;
  onToggle2FA: (enabled: boolean) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ is2FAEnabled, onToggle2FA }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const mockSecret = "JBSWY3DPEHPK3PXP";

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate API delay
    setTimeout(() => {
      setIsVerifying(false);
      if (verificationCode.length === 6) {
        onToggle2FA(true);
        setShowSetup(false);
        setStep(1);
        setVerificationCode('');
      } else {
        alert("کد نامعتبر است. لطفاً کد ۶ رقمی را وارد کنید.");
      }
    }, 1000);
  };

  const handleDisable = () => {
    if (window.confirm("آیا از غیرفعال کردن تایید دو مرحله‌ای اطمینان دارید؟ این کار امنیت حساب شما را کاهش می‌دهد.")) {
      onToggle2FA(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">امنیت و دسترسی</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">مدیریت لایه‌های حفاظتی و تنظیمات ورود به سیستم</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 space-y-10">
          {/* 2FA Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${is2FAEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <i className={`fa ${is2FAEnabled ? 'fa-shield-check' : 'fa-shield-slash'} text-2xl`}></i>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">تایید هویت دو مرحله‌ای (2FA)</h3>
                <p className="text-sm text-slate-500 font-medium max-w-md">
                  با فعال‌سازی این قابلیت، هنگام ورود به سیستم علاوه بر کلمه عبور، نیاز به وارد کردن کد از اپلیکیشن Authenticator خواهید داشت.
                </p>
              </div>
            </div>
            
            <div>
              {is2FAEnabled ? (
                <button 
                  onClick={handleDisable}
                  className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                >
                  غیرفعال‌سازی
                </button>
              ) : (
                <button 
                  onClick={() => setShowSetup(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                >
                  فعال‌سازی هوشمند
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Session History (Mock) */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <i className="fa fa-history text-slate-400"></i>
              آخرین فعالیت‌های ورود
            </h3>
            <div className="space-y-3">
              <SessionItem device="Windows 11 - Chrome" location="Kabul, AF" time="همین حالا" current />
              <SessionItem device="iPhone 14 - Safari" location="Herat, AF" time="۲ ساعت پیش" />
              <SessionItem device="MacBook Pro - Chrome" location="Dubai, UAE" time="دیروز" />
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800">راه اندازی 2FA</h3>
                <button onClick={() => { setShowSetup(false); setStep(1); }} className="text-slate-400 hover:text-slate-800">
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-8">
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                    <i className="fa fa-info-circle text-indigo-600 mt-1"></i>
                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                      ابتدا اپلیکیشن Google Authenticator یا Microsoft Authenticator را روی گوشی خود نصب کنید.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <div className="p-4 bg-white border-4 border-slate-100 rounded-3xl shadow-inner">
                      {/* Placeholder for QR Code */}
                      <div className="w-48 h-48 bg-slate-800 rounded-2xl flex items-center justify-center text-white relative overflow-hidden">
                        <i className="fa fa-qrcode text-8xl opacity-20"></i>
                        <div className="absolute inset-4 border-2 border-indigo-400/30 rounded-lg"></div>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/SarafCore:admin?secret=JBSWY3DPEHPK3PXP&issuer=SarafCore" alt="QR Code" className="relative z-10 w-40 h-40" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">کد امنیتی پشتیبان</p>
                      <code className="text-lg font-mono font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                        {mockSecret}
                      </code>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all"
                  >
                    اسکن کردم، مرحله بعد
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-500 font-medium">کد ۶ رقمی تولید شده در اپلیکیشن را وارد کنید:</p>
                  </div>

                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full max-w-[200px] text-center text-4xl font-black tracking-[0.5em] py-4 border-b-4 border-slate-200 focus:border-indigo-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                      بازگشت
                    </button>
                    <button 
                      onClick={handleVerify}
                      disabled={verificationCode.length !== 6 || isVerifying}
                      className={`flex-1 py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${
                        verificationCode.length === 6 && !isVerifying 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isVerifying ? <i className="fa fa-spinner fa-spin"></i> : 'تایید و فعال‌سازی'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SessionItem: React.FC<{ device: string, location: string, time: string, current?: boolean }> = ({ device, location, time, current }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${current ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
        <i className={`fa ${device.toLowerCase().includes('phone') ? 'fa-mobile-screen' : 'fa-laptop'}`}></i>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-slate-700">{device}</p>
          {current && <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">فعلی</span>}
        </div>
        <p className="text-[10px] text-slate-400 font-bold">{location}</p>
      </div>
    </div>
    <span className="text-[10px] text-slate-400 font-bold">{time}</span>
  </div>
);

export default SecuritySettings;
