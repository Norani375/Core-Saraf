
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, SystemConfig } from '../services/db';

const SettingsModule: React.FC = () => {
  const { section } = useParams();
  const [activeTab, setActiveTab] = useState(section || 'company');
  const [config, setConfig] = useState<SystemConfig>(db.getConfig());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (section) setActiveTab(section);
  }, [section]);

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    db.saveConfig(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleBackup = () => {
    const data = { ...localStorage };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SarafCore_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">تنظیمات هوشمند سیستم</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">تغییرات شما مستقیماً بر تمام محاسبات و فرم‌ها اعمال می‌شود</p>
        </div>
        {isSaved && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black animate-bounce">
            تنظیمات با موفقیت ذخیره شد
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        <aside className="w-full lg:w-72 bg-slate-50 border-l border-slate-100 p-8 space-y-2">
          <TabButton id="company" label="هویت صرافی" icon="fa-building" active={activeTab === 'company'} onClick={setActiveTab} />
          <TabButton id="currencies" label="مدیریت اسعار" icon="fa-coins" active={activeTab === 'currencies'} onClick={setActiveTab} />
          <TabButton id="expenses" label="انواع مخارج" icon="fa-list-check" active={activeTab === 'expenses'} onClick={setActiveTab} />
          <TabButton id="branches" label="شعبات فعال" icon="fa-code-branch" active={activeTab === 'branches'} onClick={setActiveTab} />
          <TabButton id="backup" label="پشتیبان‌گیری" icon="fa-database" active={activeTab === 'backup'} onClick={setActiveTab} />
        </aside>

        <div className="flex-1 p-12 overflow-y-auto bg-white">
          {activeTab === 'company' && (
            <div className="space-y-8 animate-in slide-in-from-left-4">
               <SectionHeader title="اطلاعات شرکت" subtitle="نام و آدرس صرافی در تمام رسیدها چاپ می‌شود" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputItem 
                    label="نام صرافی" 
                    value={config.company.name} 
                    onChange={v => updateConfig({ company: { ...config.company, name: v } })} 
                  />
                  <InputItem 
                    label="شماره جواز" 
                    value={config.company.license} 
                    onChange={v => updateConfig({ company: { ...config.company, license: v } })} 
                  />
                  <div className="md:col-span-2">
                    <InputItem 
                      label="آدرس کامل" 
                      value={config.company.address} 
                      onChange={v => updateConfig({ company: { ...config.company, address: v } })} 
                    />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'currencies' && (
            <div className="space-y-8 animate-in slide-in-from-left-4">
               <SectionHeader title="اسعار فعال (Currencies)" subtitle="ارزهای فعال در دراپ‌داون‌های سیستم" />
               <div className="grid grid-cols-1 gap-4">
                  {config.currencies.map((curr, idx) => (
                    <div key={curr.code} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600">{curr.symbol}</span>
                          <span className="font-black text-slate-700">{curr.code}</span>
                       </div>
                       <input 
                        type="checkbox" 
                        checked={curr.active} 
                        onChange={() => {
                          const newCurrs = [...config.currencies];
                          newCurrs[idx].active = !newCurrs[idx].active;
                          updateConfig({ currencies: newCurrs });
                        }}
                        className="w-6 h-6 text-indigo-600 rounded-lg" 
                       />
                    </div>
                  ))}
                  <button className="py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">
                    + افزودن ارز جدید (به زودی)
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-8 animate-in slide-in-from-left-4">
               <SectionHeader title="دسته‌بندی‌های هزینه" subtitle="لیست انواع مخارج صرافی" />
               <div className="space-y-3">
                  {config.expenseCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <span className="text-sm font-bold text-slate-700">{cat}</span>
                       <button 
                        onClick={() => {
                          const newCats = config.expenseCategories.filter((_, i) => i !== idx);
                          updateConfig({ expenseCategories: newCats });
                        }}
                        className="text-rose-500 hover:scale-110 transition-transform"><i className="fa fa-trash"></i></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input id="newCat" type="text" placeholder="عنوان جدید..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-indigo-500" />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('newCat') as HTMLInputElement;
                        if (input.value) {
                          updateConfig({ expenseCategories: [...config.expenseCategories, input.value] });
                          input.value = '';
                        }
                      }}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black">افزودن</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
               <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">
                  <i className="fa fa-database animate-pulse"></i>
               </div>
               <div className="text-center">
                 <h3 className="text-xl font-black text-slate-800">محافظت از داده‌ها</h3>
                 <p className="text-xs text-slate-500 mt-2">کل دیتابیس لوکال را به صورت فایل JSON استخراج کنید</p>
               </div>
               <button onClick={handleBackup} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl hover:bg-black transition-all">
                  دانلود فایل پشتیبان کامل
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ id: string, label: string, icon: string, active: boolean, onClick: (id: string) => void }> = ({ id, label, icon, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black transition-all ${active ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200/50 hover:text-slate-600'}`}
  >
    <i className={`fa ${icon} w-5 text-center`}></i>
    <span>{label}</span>
  </button>
);

const SectionHeader: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h3 className="text-xl font-black text-slate-800">{title}</h3>
    <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
  </div>
);

const InputItem: React.FC<{ label: string, value: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{label}</label>
    <input 
      type="text" 
      defaultValue={value} 
      onBlur={e => onChange(e.target.value)}
      className="w-full border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-all bg-slate-50/50" 
    />
  </div>
);

export default SettingsModule;
