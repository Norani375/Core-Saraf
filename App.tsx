
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import KYCManagement from './components/KYCManagement';
import TransactionModule from './components/TransactionModule';
import Reporting from './components/Reporting';
import ArchitectureInfo from './components/ArchitectureInfo';
import PendingTransactions from './components/PendingTransactions';
import AMLMonitoring from './components/AMLMonitoring';
import TreasuryManagement from './components/TreasuryManagement';
import SecuritySettings from './components/SecuritySettings';
import LoginVerification from './components/LoginVerification';
import { MenuItem } from './types';

// Centralized Menu Configuration based on User Specification
const MAIN_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    title: { fa: 'داشبورد', ps: 'ډشبورډ', en: 'Dashboard' },
    icon: 'fa-chart-pie',
    path: '/',
    permission: ['ALL'],
    isActive: true,
    module: 'DASHBOARD'
  },
  {
    id: 'customer-management',
    title: { fa: 'مدیریت مشتریان', ps: 'پیرودونکو مدیریت', en: 'Customer Management' },
    icon: 'fa-users',
    permission: ['MANAGER'],
    isActive: true,
    module: 'CUSTOMER',
    children: [
      {
        id: 'customer-list',
        title: { fa: 'لیست مشتریان', ps: 'پیرودونکو لیسټ', en: 'Customer List' },
        icon: 'fa-list-ul',
        path: '/customers/list',
        permission: ['MANAGER'],
        isActive: true,
        module: 'CUSTOMER',
        badge: { count: 23, color: 'warning' }
      },
      {
        id: 'kyc-pending',
        title: { fa: 'در انتظار تأیید KYC', ps: 'د KYC تایید په تمه', en: 'Pending KYC' },
        icon: 'fa-user-check',
        path: '/customers/kyc-pending',
        permission: ['MANAGER'],
        isActive: true,
        module: 'CUSTOMER',
        badge: { count: 15, color: 'danger' }
      }
    ]
  },
  {
    id: 'transactions',
    title: { fa: 'مدیریت معاملات', ps: 'معاملې مدیریت', en: 'Transactions' },
    icon: 'fa-exchange-alt',
    permission: ['TELLER'],
    isActive: true,
    module: 'TRANSACTION',
    children: [
      {
        id: 'new-txn',
        title: { fa: 'ثبت معامله جدید', ps: 'نوی معامله', en: 'New Transaction' },
        icon: 'fa-plus-circle',
        path: '/transactions/new',
        permission: ['TELLER'],
        isActive: true,
        module: 'TRANSACTION'
      },
      {
        id: 'pending-txns',
        title: { fa: 'معاملات در انتظار', ps: 'معاملې په تمه', en: 'Pending Txns' },
        icon: 'fa-clock',
        path: '/transactions/pending',
        permission: ['MANAGER'],
        isActive: true,
        module: 'TRANSACTION',
        badge: { count: 8, color: 'warning' }
      }
    ]
  },
  {
    id: 'compliance',
    title: { fa: 'انطباق و نظارت', ps: 'مطابقت او څارنه', en: 'Compliance' },
    icon: 'fa-shield-halved',
    permission: ['COMPLIANCE'],
    isActive: true,
    module: 'COMPLIANCE',
    children: [
      {
        id: 'aml-monitoring',
        title: { fa: 'نظارت AML/CFT', ps: 'AML/CFT څارنه', en: 'AML/CFT Monitoring' },
        icon: 'fa-radar',
        path: '/compliance/aml',
        permission: ['COMPLIANCE'],
        isActive: true,
        module: 'COMPLIANCE'
      },
      {
        id: 'reporting',
        title: { fa: 'پورتال گزارش‌دهی DAB', ps: 'مرکزي بانک ته راپور', en: 'DAB Reporting' },
        icon: 'fa-file-invoice',
        path: '/reporting',
        permission: ['COMPLIANCE'],
        isActive: true,
        module: 'COMPLIANCE'
      }
    ]
  },
  {
    id: 'treasury',
    title: { fa: 'خزانه‌داری', ps: 'خزانه‌داري', en: 'Treasury' },
    icon: 'fa-vault',
    permission: ['TREASURY'],
    isActive: true,
    module: 'TREASURY',
    children: [
      {
        id: 'cash-management',
        title: { fa: 'مدیریت نقدینگی', ps: 'نغدي مدیریت', en: 'Cash Management' },
        icon: 'fa-wallet',
        path: '/treasury/cash',
        permission: ['TREASURY'],
        isActive: true,
        module: 'TREASURY'
      }
    ]
  },
  {
    id: 'system',
    title: { fa: 'مدیریت سیستم', ps: 'سیستم مدیریت', en: 'System Admin' },
    icon: 'fa-cog',
    permission: ['ADMIN'],
    isActive: true,
    module: 'ADMIN',
    children: [
      {
        id: 'security-settings',
        title: { fa: 'تنظیمات امنیتی (2FA)', ps: 'امنیتي ترتیبات', en: 'Security & 2FA' },
        icon: 'fa-user-shield',
        path: '/admin/settings/security',
        permission: ['ADMIN'],
        isActive: true,
        module: 'ADMIN'
      },
      {
        id: 'architecture',
        title: { fa: 'معماری و امنیت', ps: 'معمارۍ', en: 'Architecture' },
        icon: 'fa-sitemap',
        path: '/admin/architecture',
        permission: ['ADMIN'],
        isActive: true,
        module: 'ADMIN'
      }
    ]
  }
];

const SidebarItem: React.FC<{ item: MenuItem, lang: 'fa' | 'ps' | 'en' }> = ({ item, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  
  const isChildActive = (menuItem: MenuItem): boolean => {
    if (menuItem.path === location.pathname) return true;
    if (menuItem.children) return menuItem.children.some(child => isChildActive(child));
    return false;
  };

  const isActive = isChildActive(item);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const title = item.title[lang];

  if (!hasChildren) {
    return (
      <Link 
        to={item.path || '#'} 
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
          location.pathname === item.path 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <i className={`fa ${item.icon} w-5 text-center ${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}></i>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {item.badge && (
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
            item.badge.color === 'warning' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            {item.badge.count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
          isActive && !isOpen ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <i className={`fa ${item.icon} w-5 text-center ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`}></i>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <i className={`fa fa-chevron-down text-[8px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      
      {isOpen && (
        <div className="mr-6 pr-2 space-y-1 border-r border-slate-800 animate-in slide-in-from-top-2 duration-300">
          {item.children?.map(child => (
            <SidebarItem key={child.id} item={child} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'fa' | 'ps' | 'en'>(() => {
    return (localStorage.getItem('lang') as any) || 'fa';
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    return localStorage.getItem('2fa_enabled') === 'true';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [show2FAVerify, setShow2FAVerify] = useState(false);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('2fa_enabled', String(is2FAEnabled));
  }, [is2FAEnabled]);

  // Initial login simulation
  useEffect(() => {
    if (!isLoggedIn) {
      if (is2FAEnabled) {
        setShow2FAVerify(true);
      } else {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setShow2FAVerify(false);
    // In a real app, this would redirect to login
    setTimeout(() => {
      if (is2FAEnabled) setShow2FAVerify(true);
      else setIsLoggedIn(true);
    }, 500);
  };

  if (show2FAVerify) {
    return (
      <LoginVerification 
        onVerify={() => {
          setShow2FAVerify(false);
          setIsLoggedIn(true);
        }}
        onCancel={() => {
          // Simulation: just stay on the lock screen or refresh
          window.location.reload();
        }}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-indigo-400 font-black text-3xl">SECURE BOOTING...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8fafc] text-slate-800" dir={lang === 'en' ? 'ltr' : 'rtl'}>
        {/* Modern Sidebar */}
        <aside className="w-72 bg-[#0f172a] text-white flex-shrink-0 flex flex-col sticky h-screen top-0 z-[60] shadow-2xl">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 transform -rotate-6">
                <i className="fa fa-vault text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter leading-none">Saraf<span className="text-indigo-400">Core</span></h1>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Enterprise EMS v2.5</p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] px-4 mb-4">Management Modules</p>
            {MAIN_MENU.map(item => (
              <SidebarItem key={item.id} item={item} lang={lang} />
            ))}
          </div>

          <div className="p-6 bg-slate-900/80 border-t border-slate-800/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <i className="fa fa-user-shield text-white text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">مدیر انطباق (Admin)</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> سیستمی آنلاین
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Main Stage */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">DAB Connectivity</span>
                <span className="text-emerald-600 text-xs font-black flex items-center gap-2">
                  <i className="fa fa-circle-check"></i> Connected & Syncing
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Security Shield</span>
                  <span className={`text-[10px] font-black flex items-center gap-2 ${is2FAEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <i className={`fa ${is2FAEnabled ? 'fa-shield-check' : 'fa-shield'}`}></i> 2FA {is2FAEnabled ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                {(['fa', 'ps', 'en'] as const).map(l => (
                  <button 
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                      lang === l ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {l === 'fa' ? 'دری' : l === 'ps' ? 'پشتو' : 'ENG'}
                  </button>
                ))}
              </div>
              
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              
              <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center relative group">
                <i className="fa fa-bell text-sm"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-black group-hover:scale-110 transition-transform">3</span>
              </button>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 pl-1 pr-4 py-1 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 group"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center group-hover:scale-95 transition-transform">
                  <i className="fa fa-power-off text-xs"></i>
                </div>
                <span className="text-xs font-black">{lang === 'en' ? 'Sign Out' : 'خروج'}</span>
              </button>
            </div>
          </header>

          <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers/list" element={<KYCManagement />} />
              <Route path="/customers/kyc-pending" element={<KYCManagement />} />
              <Route path="/transactions/new" element={<TransactionModule />} />
              <Route path="/transactions/pending" element={<PendingTransactions />} />
              <Route path="/compliance/aml" element={<AMLMonitoring />} />
              <Route path="/reporting" element={<Reporting />} />
              <Route path="/treasury/cash" element={<TreasuryManagement />} />
              <Route path="/admin/architecture" element={<ArchitectureInfo />} />
              <Route path="/admin/settings/security" element={<SecuritySettings is2FAEnabled={is2FAEnabled} onToggle2FA={setIs2FAEnabled} />} />
              
              {/* Catch-all to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.4s ease-out forwards; }
      `}</style>
    </Router>
  );
};

export default App;
