
import React, { useState, useEffect } from 'react';
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
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(DrawerMode.OFF);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchingId, setSearchingId] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{ text: string, sources: any[], customerName: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    national_id: '',
    phone: '',
    risk_level: RiskLevel.LOW,
    registration_date: ''
  });

  useEffect(() => {
    // بارگذاری از منبع واحد دیتابیس
    setCustomers(db.getCustomers());
  }, []);

  const openAddForm = () => {
    setFormData({ 
      full_name: '', 
      father_name: '', 
      national_id: '', 
      phone: '', 
      risk_level: RiskLevel.LOW,
      registration_date: new Date().toLocaleDateString('fa-AF') 
    });
    setEditingId(null);
    setDrawerMode(DrawerMode.FORM);
  };

  const handleEditClick = (customer: Customer) => {
    setFormData({
      full_name: customer.full_name,
      father_name: customer.father_name,
      national_id: customer.national_id,
      phone: customer.phone,
      risk_level: customer.risk_level,
      registration_date: customer.registration_date
    });
    setEditingId(customer.id);
    setDrawerMode(DrawerMode.FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = localStorage.getItem('current_user_name') || 'مدیر سیستم';
    
    if (editingId) {
      const existing = customers.find(c => c.id === editingId);
      if (existing) {
        // شناسایی فیلدهای تغییر یافته برای لاگ سیستم
        const changes: string[] = [];
        if (existing.full_name !== formData.full_name) changes.push(`نام: [${existing.full_name} -> ${formData.full_name}]`);
        if (existing.father_name !== formData.father_name) changes.push(`نام پدر: [${existing.father_name} -> ${formData.father_name}]`);
        if (existing.national_id !== formData.national_id) changes.push(`تذکره: [${existing.national_id} -> ${formData.national_id}]`);
        if (existing.phone !== formData.phone) changes.push(`تلفن: [${existing.phone} -> ${formData.phone}]`);
        if (existing.risk_level !== formData.risk_level) changes.push(`ریسک: [${existing.risk_level} -> ${formData.risk_level}]`);

        db.updateCustomer({ ...existing, ...formData });
        
        const changeDetails = changes.length > 0 ? `تغییرات: ${changes.join(' | ')}` : 'بدون تغییر در مقادیر';
        db.saveLog(currentUser, 'KYC_UPDATE', `ویرایش پروفایل ${formData.full_name} (${editingId}). ${changeDetails}`, 'INFO');
      }
    } else {
      const newCustomer: Customer = {
        id: `CUST-${Date.now()}`,
        ...formData,
        kyc_status: KYCStatus.PENDING
      };
      db.saveCustomer(newCustomer);
      
      const creationDetails = `اطلاعات اولیه: نام: ${formData.full_name} | پدر: ${formData.father_name} | تذکره: ${formData.national_id} | ریسک: ${formData.risk_level}`;
      db.saveLog(currentUser, 'KYC_CREATE', `ثبت مشتری جدید در سیستم. ${creationDetails}`, 'INFO');
    }
    
    // بلافاصله لیست را از دیتابیس مجدداً بارگذاری کن تا تغییرات اعمال شود
    const updatedList = db.getCustomers();
    setCustomers(updatedList);
    setDrawerMode(DrawerMode.OFF);
    setEditingId(null);
  };

  const handleBackgroundSearch = async (customer: Customer) => {
    setSearchingId(customer.id);
    const result = await searchEntity(customer.full_name);
    setSearchResult({ ...result, customerName: customer.full_name });
    setDrawerMode(DrawerMode.INTEL);
    setSearchingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm sticky top-24 z-40 backdrop-blur-md">
        <div>
           <h2 className="text-xl font-black text-slate-800">مدیریت هویت و KYC</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">بانک جامع اطلاعات مشتریان</p>
        </div>
        <button onClick={openAddForm} className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl flex items-center gap-2">
          <i className="fa fa-user-plus"></i> افزودن مشتری جدید
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
            <tr>
              <th className="px-8 py-5">هویت مشتری</th>
              <th className="px-8 py-5">تذکره</th>
              <th className="px-8 py-5">سطح ریسک</th>
              <th className="px-8 py-5">تاریخ ثبت</th>
              <th className="px-8 py-5 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-5">
                  <div className="font-black text-slate-800 text-sm">{c.full_name}</div>
                  <div className="text-[10px] text-slate-400 font-bold">پدر: {c.father_name}</div>
                </td>
                <td className="px-8 py-5 font-mono text-[11px] font-black text-slate-400">{c.national_id}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black ${
                    c.risk_level === RiskLevel.HIGH ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>{c.risk_level}</span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-500 text-[11px]">{c.registration_date}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleBackgroundSearch(c)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center">
                      <i className="fa fa-magnifying-glass-shield"></i>
                    </button>
                    <button onClick={() => handleEditClick(c)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center">
                      <i className="fa fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-300 italic font-bold">هیچ مشتری در سیستم ثبت نشده است.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* مودال ثبت/ویرایش */}
      <div className={`fixed inset-y-0 left-0 w-full md:w-[480px] bg-white shadow-2xl z-[100] transform transition-transform duration-500 ${drawerMode !== DrawerMode.OFF ? 'translate-x-0' : '-translate-x-full'}`}>
        {drawerMode !== DrawerMode.OFF && (
          <div className="flex flex-col h-full">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-black">{editingId ? 'ویرایش پروفایل' : 'ثبت مشتری جدید'}</h3>
              <button onClick={() => setDrawerMode(DrawerMode.OFF)}><i className="fa fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-y-auto">
               <InputGroup label="نام و تخلص کامل" value={formData.full_name} onChange={v => setFormData({...formData, full_name: v})} required />
               <InputGroup label="نام پدر" value={formData.father_name} onChange={v => setFormData({...formData, father_name: v})} required />
               <InputGroup label="شماره تذکره" value={formData.national_id} onChange={v => setFormData({...formData, national_id: v})} required />
               <InputGroup label="شماره تماس" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} required />
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">سطح ریسک</label>
                  <select className="w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 font-bold outline-none" value={formData.risk_level} onChange={e => setFormData({...formData, risk_level: e.target.value as any})}>
                    <option value={RiskLevel.LOW}>کم ریسک (Low)</option>
                    <option value={RiskLevel.MEDIUM}>ریسک متوسط (Medium)</option>
                    <option value={RiskLevel.HIGH}>پر ریسک (High)</option>
                  </select>
               </div>
               <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">ذخیره نهایی اطلاعات</button>
            </form>
          </div>
        )}
      </div>

      {drawerMode !== DrawerMode.OFF && <div onClick={() => setDrawerMode(DrawerMode.OFF)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90]"></div>}
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, required?: boolean }> = ({ label, value, onChange, required }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 font-bold outline-none transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
    />
  </div>
);

export default KYCManagement;
