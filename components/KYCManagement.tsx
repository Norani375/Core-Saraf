
import React, { useState, useEffect, useMemo } from 'react';
import { KYCStatus, RiskLevel, Customer } from '../types';
import { db } from '../services/db';
import { searchEntity } from '../services/geminiService';

const KYCManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Intelligence Panel State
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

  // Optimized Search Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.national_id.includes(searchTerm) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const resetForm = () => {
    setFormData({ full_name: '', father_name: '', national_id: '', phone: '', risk_level: RiskLevel.LOW });
    setEditingId(null);
    setShowAddForm(false);
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
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackgroundSearch = async (customer: Customer) => {
    setSearchingId(customer.id);
    const result = await searchEntity(customer.full_name);
    setSearchResult({ ...result, customerName: customer.full_name });
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
    resetForm();
  };

  return (
    <div className="relative space-y-8 animate-in fade-in duration-500 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">مدیریت هوشمند مشتریان</h2>
          <p className="text-sm text-slate-500 font-medium">پایگاه داده KYC با قابلیت پایش سوابق آنلاین</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <i className="fa fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text"
              placeholder="جستجوی نام، تذکره یا موبایل..."
              className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
            className={`px-6 py-3 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 transition-all ${
              showAddForm ? 'bg-rose-50 text-rose-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <i className={`fa ${showAddForm ? 'fa-times' : 'fa-plus'}`}></i>
            {showAddForm ? 'بستن' : 'مشتری جدید'}
          </button>
        </div>
      </div>

      {/* Side Intelligence Panel (Drawer) */}
      <div className={`fixed inset-y-0 left-0 w-full md:w-[450px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-out border-r border-slate-100 flex flex-col ${searchResult ? 'translate-x-0' : '-translate-x-full'}`}>
        {searchResult && (
          <>
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="fa fa-magnifying-glass-shield text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black leading-none">{searchResult.customerName}</h3>
                  <p className="text-[10px] text-indigo-300 font-bold mt-2 uppercase tracking-widest">Intelligence Report</p>
                </div>
              </div>
              <button onClick={() => setSearchResult(null)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-4 text-indigo-900 font-black text-xs">
                  <i className="fa fa-robot"></i> تحلیل هوشمند Gemini
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{searchResult.text}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">منابع استعلام (Web Sources)</h4>
                <div className="space-y-3">
                  {searchResult.sources.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <i className="fa fa-link text-indigo-400"></i>
                        <span className="text-xs font-bold text-slate-600 truncate">{source.title || 'مشاهده منبع'}</span>
                      </div>
                      <i className="fa fa-arrow-left text-[10px] text-slate-300 group-hover:text-indigo-600"></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setSearchResult(null)} className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all">بستن گزارش</button>
            </div>
          </>
        )}
      </div>

      {/* Overlay when Drawer is open */}
      {searchResult && <div onClick={() => setSearchResult(null)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] animate-in fade-in duration-300"></div>}

      {/* Add/Edit Form Section */}
      {showAddForm && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <i className={`fa ${editingId ? 'fa-pen-to-square' : 'fa-user-plus'}`}></i>
             </div>
             <h3 className="text-xl font-black text-slate-800">{editingId ? 'ویرایش اطلاعات' : 'ثبت مشتری جدید'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نام و تخلص کامل</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نام پدر</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold" value={formData.father_name} onChange={e => setFormData({...formData, father_name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">شماره تذکره</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold font-mono" value={formData.national_id} onChange={e => setFormData({...formData, national_id: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">شماره تماس</label>
              <input type="text" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">سطح ریسک</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold appearance-none" value={formData.risk_level} onChange={e => setFormData({...formData, risk_level: e.target.value as RiskLevel})}>
                <option value={RiskLevel.LOW}>کم (Low)</option>
                <option value={RiskLevel.MEDIUM}>متوسط (Medium)</option>
                <option value={RiskLevel.HIGH}>بالا (High Risk)</option>
              </select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <button type="submit" className={`w-full py-4 text-white rounded-2xl font-black shadow-xl transition-all ${editingId ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}>
                {editingId ? 'ذخیره تغییرات' : 'ثبت در سیستم'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
            <tr>
              <th className="px-10 py-5">اطلاعات مشتری</th>
              <th className="px-10 py-5">تذکره</th>
              <th className="px-10 py-5">ریسک</th>
              <th className="px-10 py-5">وضعیت KYC</th>
              <th className="px-10 py-5 text-left">عملیات هوشمند</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">{c.full_name[0]}</div>
                    <div>
                      <div className="font-black text-slate-800 text-sm">{c.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">پدر: {c.father_name} • {c.registration_date}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6 font-mono text-[11px] font-black text-slate-500">{c.national_id}</td>
                <td className="px-10 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    c.risk_level === RiskLevel.HIGH ? 'bg-rose-100 text-rose-600' : 
                    c.risk_level === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>{c.risk_level}</span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.kyc_status === KYCStatus.APPROVED ? 'bg-emerald-500' : c.kyc_status === KYCStatus.REJECTED ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></span>
                    <span className="text-[10px] font-black text-slate-600">{c.kyc_status}</span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleBackgroundSearch(c)}
                      disabled={searchingId === c.id}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 shadow-sm transition-all flex items-center justify-center"
                      title="استعلام سوابق زنده"
                    >
                      {searchingId === c.id ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-magnifying-glass-shield"></i>}
                    </button>
                    <button 
                      onClick={() => handleEditClick(c)}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-600 shadow-sm transition-all flex items-center justify-center"
                      title="ویرایش"
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="text-slate-300 font-bold italic text-sm">مشتری با مشخصات "{searchTerm}" یافت نشد.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default KYCManagement;
