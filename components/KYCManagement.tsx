
import React, { useState, useEffect, useMemo } from 'react';
import { KYCStatus, RiskLevel, Customer } from '../types';
import { db } from '../services/db';
import { searchEntity } from '../services/geminiService';

enum DrawerMode {
  OFF = 'OFF',
  INTEL = 'INTEL',
  FORM = 'FORM'
}

const KYCManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Drawer Management
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(DrawerMode.OFF);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchingId, setSearchingId] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{ text: string, sources: any[], customerName: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    national_id: '',
    phone: '',
    risk_level: RiskLevel.LOW
  });

  useEffect(() => {
    setCustomers(db.getCustomers());
  }, []);

  const openAddForm = () => {
    setFormData({ full_name: '', father_name: '', national_id: '', phone: '', risk_level: RiskLevel.LOW });
    setEditingId(null);
    setDrawerMode(DrawerMode.FORM);
  };

  const handleEditClick = (customer: Customer) => {
    setFormData({
      full_name: customer.full_name,
      father_name: customer.father_name,
      national_id: customer.national_id,
      phone: customer.phone,
      risk_level: customer.risk_level
    });
    setEditingId(customer.id);
    setDrawerMode(DrawerMode.FORM);
  };

  const handleBackgroundSearch = async (customer: Customer) => {
    setSearchingId(customer.id);
    const result = await searchEntity(customer.full_name);
    setSearchResult({ ...result, customerName: customer.full_name });
    setDrawerMode(DrawerMode.INTEL);
    setSearchingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existingCustomer = customers.find(c => c.id === editingId);
      if (existingCustomer) {
        db.updateCustomer({ ...existingCustomer, ...formData });
      }
    } else {
      const newCustomer: Customer = {
        id: `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
        ...formData,
        kyc_status: KYCStatus.PENDING,
        registration_date: new Date().toLocaleDateString('fa-AF')
      };
      db.saveCustomer(newCustomer);
    }
    setCustomers(db.getCustomers());
    setDrawerMode(DrawerMode.OFF);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-h-screen pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-24 z-40 backdrop-blur-md bg-white/90">
        <div>
           <h2 className="text-xl font-black text-slate-800">لیست اعتبارسنجی مشتریان</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">مدیریت هویت و ریسک انطباق</p>
        </div>

        <button 
          onClick={openAddForm}
          className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <i className="fa fa-user-plus"></i>
          مشتری جدید
        </button>
      </div>

      {/* Results Summary */}
      <div className="px-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        <span>دفتر ثبت هویت مشتریان</span>
        <span>تعداد کل: {customers.length} مورد</span>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
            <tr>
              <th className="px-8 py-5">هویت مشتری</th>
              <th className="px-8 py-5">اطلاعات تماس</th>
              <th className="px-8 py-5">تذکره</th>
              <th className="px-8 py-5">ریسک</th>
              <th className="px-8 py-5">وضعیت</th>
              <th className="px-8 py-5 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      {c.full_name[0]}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-sm">{c.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">پدر: {c.father_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-bold text-slate-600 text-xs">{c.phone}</td>
                <td className="px-8 py-5 font-mono text-[11px] font-black text-slate-400">{c.national_id}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    c.risk_level === RiskLevel.HIGH ? 'bg-rose-100 text-rose-600' : 
                    c.risk_level === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>{c.risk_level}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.kyc_status === KYCStatus.APPROVED ? 'bg-emerald-500' : c.kyc_status === KYCStatus.REJECTED ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></span>
                    <span className="text-[10px] font-black text-slate-600">{c.kyc_status}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <TableActionBtn 
                      icon="fa-magnifying-glass-shield" 
                      onClick={() => handleBackgroundSearch(c)} 
                      loading={searchingId === c.id} 
                      color="indigo" 
                      title="استعلام هوشمند"
                    />
                    <TableActionBtn 
                      icon="fa-edit" 
                      onClick={() => handleEditClick(c)} 
                      color="slate" 
                      title="ویرایش"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Central Unified Drawer */}
      <div className={`fixed inset-y-0 left-0 w-full md:w-[480px] bg-white shadow-[-30px_0_60px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-in-out border-r border-slate-100 flex flex-col ${drawerMode !== DrawerMode.OFF ? 'translate-x-0' : '-translate-x-full'}`}>
        {drawerMode !== DrawerMode.OFF && (
          <>
            <div className={`p-8 ${drawerMode === DrawerMode.INTEL ? 'bg-slate-900' : 'bg-indigo-600'} text-white flex justify-between items-center transition-colors duration-500`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <i className={`fa ${drawerMode === DrawerMode.INTEL ? 'fa-magnifying-glass-shield' : 'fa-user-pen'} text-xl`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-black leading-none">
                    {drawerMode === DrawerMode.INTEL ? searchResult?.customerName : (editingId ? 'ویرایش مشتری' : 'ثبت مشتری جدید')}
                  </h3>
                  <p className="text-[10px] opacity-60 font-black mt-2 uppercase tracking-widest">
                    {drawerMode === DrawerMode.INTEL ? 'Intelligence Report' : 'Customer Profile Management'}
                  </p>
                </div>
              </div>
              <button onClick={() => setDrawerMode(DrawerMode.OFF)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {drawerMode === DrawerMode.INTEL && searchResult && (
                <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                  <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4 text-indigo-900 font-black text-xs uppercase tracking-widest">
                      <i className="fa fa-robot"></i> تحلیل هوشمند Gemini
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{searchResult.text}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">منابع استعلام (Web Sources)</h4>
                    <div className="space-y-3">
                      {searchResult.sources.map((source, idx) => (
                        <a key={idx} href={source.uri} target="_blank" className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <i className="fa fa-link text-indigo-500"></i>
                            <span className="text-xs font-bold text-slate-600 truncate">{source.title || 'Source Link'}</span>
                          </div>
                          <i className="fa fa-arrow-left text-[10px] text-slate-300 group-hover:text-indigo-600 transition-all"></i>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {drawerMode === DrawerMode.FORM && (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                  <div className="grid grid-cols-1 gap-6">
                    <InputGroup label="نام و تخلص کامل" icon="fa-user" value={formData.full_name} onChange={v => setFormData({...formData, full_name: v})} required />
                    <InputGroup label="نام پدر" icon="fa-user-group" value={formData.father_name} onChange={v => setFormData({...formData, father_name: v})} required />
                    <InputGroup label="شماره تذکره / پاسپورت" icon="fa-id-card" value={formData.national_id} onChange={v => setFormData({...formData, national_id: v})} required />
                    <InputGroup label="شماره تماس" icon="fa-phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} required />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">سطح ریسک معاملاتی</label>
                       <div className="grid grid-cols-3 gap-3">
                          {[RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH].map(r => (
                            <button 
                              key={r}
                              type="button"
                              onClick={() => setFormData({...formData, risk_level: r})}
                              className={`py-3 rounded-xl text-[10px] font-black border transition-all ${
                                formData.risk_level === r 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all transform active:scale-[0.98]">
                      {editingId ? 'ذخیره تغییرات پروفایل' : 'ثبت قطعی در سیستم'}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center mt-4 font-bold">اطلاعات پس از ثبت در پورتال مرکزی DAB همگام‌سازی خواهد شد.</p>
                  </div>
                </form>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setDrawerMode(DrawerMode.OFF)} className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">
                انصراف و بستن پنل
              </button>
            </div>
          </>
        )}
      </div>

      {/* Overlay */}
      {drawerMode !== DrawerMode.OFF && <div onClick={() => setDrawerMode(DrawerMode.OFF)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] animate-in fade-in duration-500"></div>}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const FilterChip: React.FC<{ label: string, active: boolean, onClick: () => void, color: string }> = ({ label, active, onClick, color }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap ${
      active 
      ? `bg-slate-900 text-white border-slate-900 shadow-lg` 
      : `bg-white text-slate-500 border-slate-100 hover:bg-slate-50`
    }`}
  >
    {label}
  </button>
);

const InputGroup: React.FC<{ label: string, icon: string, value: string, onChange: (v: string) => void, required?: boolean }> = ({ label, icon, value, onChange, required }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{label}</label>
    <div className="relative">
      <i className={`fa ${icon} absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs`}></i>
      <input 
        type="text" 
        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl pr-11 pl-4 py-4 font-bold outline-none transition-all text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
      />
    </div>
  </div>
);

const TableActionBtn: React.FC<{ icon: string, onClick: () => void, loading?: boolean, color: string, title: string }> = ({ icon, onClick, loading, color, title }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-${color}-600 hover:border-${color}-600 shadow-sm transition-all flex items-center justify-center relative group`}
    title={title}
  >
    {loading ? <i className="fa fa-spinner fa-spin text-xs"></i> : <i className={`fa ${icon} text-xs`}></i>}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
       {title}
    </span>
  </button>
);

export default KYCManagement;
