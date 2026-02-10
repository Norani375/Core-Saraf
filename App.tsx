
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import KYCManagement from './components/KYCManagement';
import Journal from './components/Journal';
import ExchangeModule from './components/ExchangeModule';
import HawalaModule from './components/HawalaModule';
import FinancialStatement from './components/FinancialStatement';
import ReportHub from './components/ReportHub';
import TreasuryManagement from './components/TreasuryManagement';
import AMLMonitoring from './components/AMLMonitoring';
import Reporting from './components/Reporting';
import PendingTransactions from './components/PendingTransactions';
import SettingsModule from './components/SettingsModule';
import { MenuItem } from './types';

const MENU: MenuItem[] = [
  { id: 'm1', title: { fa: 'مدیریت و داشبورد', en: 'Management' }, icon: 'fa-gauge-high', path: '/', permission: ['ALL'], isActive: true },
  { id: 'm2', title: { fa: 'روزنامچه (Journal)', en: 'Journal' }, icon: 'fa-book-open', path: '/journal', permission: ['ALL'], isActive: true },
  
  { 
    id: 'm3', 
    title: { fa: 'د افغانستان بانک', en: 'DAB' }, 
    icon: 'fa-landmark', 
    permission: ['ALL'], 
    isActive: true,
    children: [
      { id: 'm3_1', title: { fa: 'پورتال DAB', en: 'DAB Portal' }, icon: 'fa-cloud-arrow-up', path: '/dab-reporting', permission: ['ALL'], isActive: true },
      { id: 'm3_2', title: { fa: 'خرید دالر از DAB', en: 'DAB Purchase' }, icon: 'fa-money-bill-1-wave', path: '/exchange', permission: ['ALL'], isActive: true },
    ]
  },

  { id: 'm4', title: { fa: 'تاییدی معاملات', en: 'Approvals' }, icon: 'fa-shield-check', path: '/compliance', permission: ['ALL'], isActive: true },

  { 
    id: 'm5', 
    title: { fa: 'معاملات / ترانزیکشنز', en: 'Transactions' }, 
    icon: 'fa-money-bill-transfer', 
    permission: ['ALL'], 
    isActive: true,
    children: [
      { id: 'm5_1', title: { fa: 'رسید / برد', en: 'Receipt/Payment' }, icon: 'fa-file-invoice-dollar', path: '/journal', permission: ['ALL'], isActive: true },
      { id: 'm5_2', title: { fa: 'تبادله اسعار', en: 'Exchange' }, icon: 'fa-rotate', path: '/exchange', permission: ['ALL'], isActive: true },
      { id: 'm5_3', title: { fa: 'چک‌ها', en: 'Checks' }, icon: 'fa-money-check', path: '/journal', permission: ['ALL'], isActive: true },
      { id: 'm5_4', title: { fa: 'انتقالات بین حسابات', en: 'Internal' }, icon: 'fa-shuffle', path: '/journal', permission: ['ALL'], isActive: true },
      { id: 'm5_5', title: { fa: 'مصارف', en: 'Expenses' }, icon: 'fa-wallet', path: '/journal', permission: ['ALL'], isActive: true },
    ]
  },

  { 
    id: 'm6', 
    title: { fa: 'حواله‌جات', en: 'Remittance' }, 
    icon: 'fa-paper-plane', 
    permission: ['ALL'], 
    isActive: true,
    children: [
      { id: 'm6_1', title: { fa: 'حواله‌های ارسالی', en: 'Sent' }, icon: 'fa-arrow-up-right-from-square', path: '/hawala', permission: ['ALL'], isActive: true },
      { id: 'm6_2', title: { fa: 'حواله‌های دریافتی', en: 'Received' }, icon: 'fa-arrow-down-left', path: '/hawala', permission: ['ALL'], isActive: true },
      { id: 'm6_3', title: { fa: 'حواله‌های لغوه شده', en: 'Cancelled' }, icon: 'fa-rectangle-xmark', path: '/reports/hawala', permission: ['ALL'], isActive: true },
    ]
  },

  { id: 'm7', title: { fa: 'مدیریت مشتریان', en: 'KYC' }, icon: 'fa-users', path: '/customers', permission: ['ALL'], isActive: true },
  { id: 'm8', title: { fa: 'تشکیلات اداری', en: 'Organization' }, icon: 'fa-sitemap', path: '/', permission: ['ALL'], isActive: true },
  
  { 
    id: 'm9', 
    title: { fa: 'گزارشات و حسابداری', en: 'Accounting' }, 
    icon: 'fa-chart-column', 
    permission: ['ALL'], 
    isActive: true,
    children: [
      { id: 'm9_1', title: { fa: 'گزارشات عمومی', en: 'Reports' }, icon: 'fa-file-chart-line', path: '/reports/all', permission: ['ALL'], isActive: true },
      { id: 'm9_2', title: { fa: 'حسابداری', en: 'Ledger' }, icon: 'fa-vault', path: '/financial', permission: ['ALL'], isActive: true },
      { id: 'm9_3', title: { fa: 'صورت حساب مالی', en: 'Statements' }, icon: 'fa-file-invoice', path: '/financial', permission: ['ALL'], isActive: true },
    ]
  },

  { 
    id: 'm10', 
    title: { fa: 'تنظیمات سیستم', en: 'Settings' }, 
    icon: 'fa-gears', 
    permission: ['ALL'], 
    isActive: true,
    children: [
      { id: 's1', title: { fa: 'حساب شرکت', en: 'Company' }, icon: 'fa-building-circle-check', path: '/settings/company', permission: ['ALL'], isActive: true },
      { id: 's2', title: { fa: 'زبان (Language)', en: 'Language' }, icon: 'fa-language', path: '/settings/general', permission: ['ALL'], isActive: true },
      { id: 's3', title: { fa: 'شاخه‌های مصارف', en: 'Exp Types' }, icon: 'fa-list-check', path: '/settings/expenses', permission: ['ALL'], isActive: true },
      { id: 's4', title: { fa: 'حساب خرج', en: 'Exp Accounts' }, icon: 'fa-wallet', path: '/settings/expenses', permission: ['ALL'], isActive: true },
      { id: 's5', title: { fa: 'مدیریت شعبات', en: 'Branches' }, icon: 'fa-code-branch', path: '/settings/company', permission: ['ALL'], isActive: true },
      { id: 's6', title: { fa: 'اسعار (Currencies)', en: 'Currencies' }, icon: 'fa-coins', path: '/settings/currencies', permission: ['ALL'], isActive: true },
      { id: 's7', title: { fa: 'یوزرها', en: 'Users' }, icon: 'fa-users-gear', path: '/settings/users', permission: ['ALL'], isActive: true },
      { id: 's8', title: { fa: 'تقویم', en: 'Calendar' }, icon: 'fa-calendar-days', path: '/settings/general', permission: ['ALL'], isActive: true },
      { id: 's9', title: { fa: 'بیکپ (Backup)', en: 'Backup' }, icon: 'fa-database', path: '/settings/backup', permission: ['ALL'], isActive: true },
    ]
  },
];

const SidebarItem: React.FC<{ item: MenuItem, lang: 'fa' | 'en' }> = ({ item, lang }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasActiveChild = item.children?.some(c => location.pathname.startsWith(c.path || 'none'));

  return (
    <div className="mb-1">
      {item.path && !item.children ? (
        <Link to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <i className={`fa ${item.icon} w-5 text-center text-xs`}></i>
          <span className="text-[11px] font-black">{item.title[lang]}</span>
        </Link>
      ) : (
        <>
          <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${hasActiveChild || open ? 'bg-slate-800/50 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`}>
            <div className="flex items-center gap-3">
              <i className={`fa ${item.icon} w-5 text-center text-xs`}></i>
              <span className="text-[11px] font-black">{item.title[lang]}</span>
            </div>
            <i className={`fa fa-chevron-down text-[8px] transition-transform ${open || hasActiveChild ? 'rotate-180' : ''}`}></i>
          </button>
          {(open || hasActiveChild) && (
            <div className="mr-6 pr-2 mt-1 space-y-1 border-r border-slate-700/50 animate-in slide-in-from-top-1 duration-200">
              {item.children?.map(child => (
                <Link key={child.id} to={child.path || '/'} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${location.pathname === child.path ? 'text-white bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-300'}`}>
                   <i className={`fa ${child.icon} text-[9px]`}></i>
                   <span className="text-[10px] font-black">{child.title[lang]}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8fafc] text-slate-800" dir="rtl">
        <aside className="w-64 bg-[#0f172a] text-white flex-shrink-0 flex flex-col sticky h-screen top-0 z-[60] shadow-2xl no-print border-l border-slate-800">
          <div className="p-6 border-b border-slate-800/50 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <i className="fa fa-vault text-lg"></i>
              </div>
              <div className="flex flex-col">
                 <h1 className="text-xs font-black text-white leading-none">صرافی ذکی جابر</h1>
                 <span className="text-[7px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Core System v2.5</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
            {MENU.map(item => <SidebarItem key={item.id} item={item} lang="fa" />)}
          </nav>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/customers" element={<KYCManagement />} />
            <Route path="/exchange" element={<ExchangeModule />} />
            <Route path="/hawala" element={<HawalaModule />} />
            <Route path="/compliance" element={<PendingTransactions />} />
            <Route path="/dab-reporting" element={<Reporting />} />
            <Route path="/financial" element={<FinancialStatement />} />
            <Route path="/reports/:type" element={<ReportHub />} />
            <Route path="/settings/:section" element={<SettingsModule />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
