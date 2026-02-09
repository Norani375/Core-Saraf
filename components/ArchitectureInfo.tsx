
import React, { useState } from 'react';

type LangCode = 'en' | 'da' | 'pa';

interface LocalizedText {
  title: string;
  subtitle: string;
  gateway: string;
  gatewayDesc: string;
  services: {
    id: string;
    title: string;
    items: string[];
    icon: string;
  }[];
}

const translations: Record<LangCode, LocalizedText> = {
  en: {
    title: "Microservices Architecture",
    subtitle: "A distributed system designed for high availability and regulatory compliance in Afghanistan's financial sector.",
    gateway: "API Gateway",
    gatewayDesc: "Smart Routing, Rate Limiting, Authentication, Centralized Logging",
    services: [
      { id: 'iam', title: 'Identity & Access Management (IAM)', icon: 'fa-user-lock', items: ['Authentication', 'Authorization', 'Session Management', '2FA/OTP Service'] },
      { id: 'kyc', title: 'Customer Management (KYC)', icon: 'fa-id-badge', items: ['Registration & Profiles', 'Document Management', 'Identity Verification', 'Risk Profiling'] },
      { id: 'txn', title: 'Transaction Engine', icon: 'fa-sync', items: ['Exchange Rate Management', 'Transaction Processing', 'Fee Calculation', 'Receipt Issuance'] },
      { id: 'aml', title: 'Compliance & AML', icon: 'fa-shield-virus', items: ['Sanctions Screening', 'Suspicious Pattern Detection', 'Auto-Reporting', 'Alert Management'] },
      { id: 'rep', title: 'Reporting Engine', icon: 'fa-file-medical-alt', items: ['Daily Reports', 'Monthly Reports', 'Special Reports', 'DAB Submission'] },
      { id: 'trs', title: 'Treasury Management', icon: 'fa-vault', items: ['Balance Management', 'Account Reconciliation', 'Accounting', 'Liquidity Forecasting'] },
    ]
  },
  da: {
    title: "معماری مایکرو سرویس‌ها",
    subtitle: "یک سیستم توزیع شده طراحی شده برای پایداری بالا و انطباق نظارتی در بخش مالی افغانستان.",
    gateway: "درگاه API (Gateway)",
    gatewayDesc: "روتینگ هوشمند، محدودیت درخواست (Rate Limiting)، احراز هویت، ثبت لاگ متمرکز",
    services: [
      { id: 'iam', title: 'مدیریت هویت و دسترسی (IAM)', icon: 'fa-user-lock', items: ['احراز هویت', 'مدیریت مجوزها', 'مدیریت نشست‌ها', 'سرویس 2FA/OTP'] },
      { id: 'kyc', title: 'مدیریت مشتریان (KYC)', icon: 'fa-id-badge', items: ['ثبت‌نام و پروفایل', 'مدیریت مستندات', 'تأیید هویت', 'مدیریت ریسک'] },
      { id: 'txn', title: 'موتور معاملات (Transaction Engine)', icon: 'fa-sync', items: ['مدیریت نرخ ارز', 'پردازش معاملات', 'محاسبه کارمزد', 'صدور رسید'] },
      { id: 'aml', title: 'انطباق و AML', icon: 'fa-shield-virus', items: ['بررسی لیست‌های تحریم', 'تشخیص الگوهای مشکوک', 'گزارش‌دهی خودکار', 'مدیریت هشدارها'] },
      { id: 'rep', title: 'موتور گزارش‌دهی', icon: 'fa-file-medical-alt', items: ['تولید گزارش‌های روزانه', 'گزارش‌های ماهانه', 'گزارش‌های ویژه', 'ارسال به بانک مرکزی'] },
      { id: 'trs', title: 'مدیریت خزانه (Treasury)', icon: 'fa-vault', items: ['مدیریت موجودی', 'تطبیق حساب', 'حسابداری', 'پیش‌بینی نقدینگی'] },
    ]
  },
  pa: {
    title: "د مایکرو سرویسونو معمارۍ",
    subtitle: "د افغانستان په مالي سکتور کې د لوړ ثبات او تنظیمي اطاعت لپاره ډیزاین شوی ویشل شوی سیسټم.",
    gateway: "د API دروازه (Gateway)",
    gatewayDesc: "هوښیار روټینګ، د نرخ محدودیت، د هویت تایید، مرکزي ننوتل",
    services: [
      { id: 'iam', title: 'د هویت او لاسرسي مدیریت (IAM)', icon: 'fa-user-lock', items: ['د هویت تایید', 'د واک مدیریت', 'د ناستې مدیریت', 'د 2FA/OTP خدمت'] },
      { id: 'kyc', title: 'د پیرودونکي مدیریت (KYC)', icon: 'fa-id-badge', items: ['راجسټریشن او پروفایل', 'د اسنادو مدیریت', 'د هویت تایید', 'د خطر مدیریت'] },
      { id: 'txn', title: 'د راکړې ورکړې ماشین', icon: 'fa-sync', items: ['د تبادلې نرخ مدیریت', 'د راکړې ورکړې پروسس کول', 'د فیس محاسبه', 'د رسید صادرول'] },
      { id: 'aml', title: 'اطاعت او AML', icon: 'fa-shield-virus', items: ['د بندیزونو لیست معاینه', 'د مشکوکو نمونو موندل', 'اتوماتیک راپور ورکول', 'د خبرتیا مدیریت'] },
      { id: 'rep', title: 'د راپور ورکولو انجن', icon: 'fa-file-medical-alt', items: ['ورځني راپورونه', 'میاشتني راپورونه', 'ځانګړي راپورونه', 'مرکزي بانک ته لیږل'] },
      { id: 'trs', title: 'د خزانې مدیریت', icon: 'fa-vault', items: ['د بانس مدیریت', 'د حساب پخلاینه', 'محاسبه', 'د نغدو پیسو وړاندوینه'] },
    ]
  }
};

const ArchitectureInfo: React.FC = () => {
  const [activeLang, setActiveLang] = useState<LangCode>('da');
  const t = translations[activeLang];
  const isRtl = activeLang !== 'en';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className="flex justify-center gap-2 mb-8 p-1 bg-gray-100 rounded-xl w-fit mx-auto shadow-inner">
        {(['da', 'pa', 'en'] as LangCode[]).map((l) => (
          <button
            key={l}
            onClick={() => setActiveLang(l)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeLang === l ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {l === 'da' ? 'دری' : l === 'pa' ? 'پښتو' : 'English'}
          </button>
        ))}
      </div>

      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t.title}</h2>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </section>

      {/* Visual System Overview */}
      <div className="relative py-12 px-6 bg-slate-50 rounded-[3rem] border border-gray-100 shadow-inner overflow-hidden">
        {/* Background decorative lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* API Gateway - Top Central Node */}
        <div className="relative flex flex-col items-center mb-16">
          <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl border-4 border-indigo-200 w-full max-w-md text-center group hover:bg-indigo-700 transition-all cursor-default">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
              <i className="fa fa-door-open text-3xl"></i>
            </div>
            <h3 className="text-2xl font-black mb-2">{t.gateway}</h3>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              {t.gatewayDesc}
            </p>
          </div>
          {/* Connector to services */}
          <div className="h-16 w-1 bg-gradient-to-b from-indigo-500 to-transparent"></div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {t.services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <i className={`fa ${service.icon} text-2xl`}></i>
                </div>
                <h4 className="text-lg font-black text-gray-800 leading-tight flex-1">
                  {service.title}
                </h4>
              </div>
              <ul className="space-y-3">
                {service.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Technical Spec Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-slate-900 p-10 rounded-3xl text-slate-300 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <i className="fa fa-database text-9xl"></i>
          </div>
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3 relative z-10">
            <i className="fa fa-network-wired text-indigo-400"></i>
            {activeLang === 'en' ? 'Distributed Data Layer' : activeLang === 'da' ? 'لایه داده‌های توزیع شده' : 'ویشل شوی ډاټا پرت'}
          </h3>
          <div className="space-y-4 relative z-10 font-mono text-sm leading-relaxed">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-indigo-400"># ems_master</span>
              <p className="mt-1 text-xs">{activeLang === 'en' ? 'Core KYC & IAM entities' : activeLang === 'da' ? 'موجودیت‌های اصلی KYC و IAM' : 'د KYC او IAM اصلي ډاټا'}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-emerald-400"># ems_shards</span>
              <p className="mt-1 text-xs">{activeLang === 'en' ? 'Sharded transaction logs' : activeLang === 'da' ? 'لاگ‌های تراکنش توزیع شده' : 'ویشل شوي معاملاتي ریکارډونه'}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <span className="text-orange-400"># ems_reporting</span>
              <p className="mt-1 text-xs">{activeLang === 'en' ? 'OLAP Analytics warehouse' : activeLang === 'da' ? 'انبار داده‌های تحلیلی OLAP' : 'د OLAP تحلیلي ګودام'}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-10 rounded-3xl border border-indigo-100 shadow-inner">
          <h3 className="text-2xl font-bold mb-6 text-indigo-900 flex items-center gap-3">
            <i className="fa fa-shield-alt"></i>
            {activeLang === 'en' ? 'Compliance Standards' : activeLang === 'da' ? 'استانداردهای انطباق' : 'د اطاعت معیارونه'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ComplianceCard label="DAB Compliant" sub="AFG Central Bank" />
            <ComplianceCard label="FATF Standards" sub="AML/CFT Framework" />
            <ComplianceCard label="ISO 27001" sub="Information Security" />
            <ComplianceCard label="GDPR Inspired" sub="Data Privacy" />
          </div>
          <div className="mt-8 p-6 bg-white rounded-2xl border border-indigo-100 italic text-sm text-indigo-700 font-medium">
            {activeLang === 'en' 
              ? "All services communicate via gRPC for high performance and strict contract definitions."
              : activeLang === 'da'
              ? "تمام سرویس‌ها برای کارایی بالا و تعریف قراردادهای سخت‌گیرانه از طریق gRPC ارتباط برقرار می‌کنند."
              : "ټول خدمات د لوړ فعالیت او د قرارداد د سخت تعریفونو لپاره د gRPC له لارې اړیکه نیسي."}
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplianceCard: React.FC<{ label: string, sub: string }> = ({ label, sub }) => (
  <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-indigo-900 font-black text-sm">{label}</div>
    <div className="text-[10px] text-indigo-400 font-bold uppercase mt-1">{sub}</div>
  </div>
);

export default ArchitectureInfo;
