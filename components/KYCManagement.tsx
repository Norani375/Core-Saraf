
import React, { useState, useEffect } from 'react';
import { KYCStatus, RiskLevel, Customer } from '../types';
import { db } from '../services/db';

const KYCManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
      ...formData,
      kyc_status: KYCStatus.PENDING,
      registration_date: new Date().toLocaleDateString('fa-AF')
    };
    db.saveCustomer(newCustomer);
    setCustomers(db.getCustomers());
    setShowAddForm(false);
    setFormData({ full_name: '', father_name: '', national_id: '', phone: '', risk_level: RiskLevel.LOW });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">بانک اطلاعات مشتریان</h2>
          <p className="text-sm text-slate-500 font-medium">پایگاه داده متمرکز KYC مطابق با استانداردهای AML/CFT</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center gap-3 transition-all"
        >
          <i className={`fa ${showAddForm ? 'fa-times' : 'fa-user-plus'}`}></i>
          {showAddForm ? 'انصراف' : 'ثبت مشتری جدید'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">نام و تخلص کامل</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold"
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">نام پدر</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold"
                value={formData.father_name}
                onChange={e => setFormData({...formData, father_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">شماره تذکره</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-mono font-bold"
                value={formData.national_id}
                onChange={e => setFormData({...formData, national_id: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">شماره تماس</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">سطح ریسک اولیه</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-600 font-bold appearance-none"
                value={formData.risk_level}
                onChange={e => setFormData({...formData, risk_level: e.target.value as RiskLevel})}
              >
                <option value={RiskLevel.LOW}>کم (Low)</option>
                <option value={RiskLevel.MEDIUM}>متوسط (Medium)</option>
                <option value={RiskLevel.HIGH}>بالا (High Risk)</option>
              </select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                ذخیره در دیتابیس
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
            <tr>
              <th className="px-10 py-5">مشتری</th>
              <th className="px-10 py-5">تذکره</th>
              <th className="px-10 py-5">ریسک</th>
              <th className="px-10 py-5">وضعیت KYC</th>
              <th className="px-10 py-5">تاریخ ثبت</th>
              <th className="px-10 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                      {c.full_name[0]}
                    </div>
                    <div>
                      <div className="font-black text-slate-700">{c.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">پدر: {c.father_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6 font-mono text-xs font-black text-slate-500">{c.national_id}</td>
                <td className="px-10 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    c.risk_level === RiskLevel.HIGH ? 'bg-rose-100 text-rose-600' : 
                    c.risk_level === RiskLevel.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {c.risk_level}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      c.kyc_status === KYCStatus.APPROVED ? 'bg-emerald-500' : 
                      c.kyc_status === KYCStatus.REJECTED ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                    }`}></span>
                    <span className="text-xs font-black text-slate-600">{c.kyc_status}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">{c.registration_date}</td>
                <td className="px-10 py-6">
                  <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all">
                    <i className="fa fa-ellipsis-v"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KYCManagement;
