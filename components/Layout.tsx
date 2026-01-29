
import React from 'react';
import { 
  Home, 
  History, 
  User as UserIcon, 
  Settings, 
  PlusCircle, 
  LogOut,
  Zap
} from 'lucide-react';
import { View } from '../types';
import { getTranslation } from '../utils/translations';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  userName: string;
  language: string;
  uiStrings: Record<string, string>;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, onLogout, userName, language, uiStrings }) => {
  const isRTL = language.startsWith('fa') || language.startsWith('ar');
  const t = (key: string) => getTranslation(language, key, uiStrings);

  const navItems = [
    { id: 'dashboard' as View, icon: Home, label: t('home') },
    { id: 'history' as View, icon: History, label: t('history') },
    { id: 'profile' as View, icon: UserIcon, label: t('profile') },
    { id: 'settings' as View, icon: Settings, label: t('settings') },
  ];

  return (
    <div className={`min-h-screen flex bg-slate-50 text-slate-900 ${isRTL ? 'flex-row-reverse text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className={`p-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
            <Zap size={24} fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Lingua</span>
        </div>
        
        <nav className="flex-1 px-4 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${isRTL ? 'flex-row-reverse' : ''} ${
                activeView === item.id 
                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <LogOut size={20} />
            {t('signOut')}
          </button>
          
          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-t border-slate-50 pt-4">
            {t('madeBy')}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`md:hidden flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Zap size={20} className="text-emerald-500" />
            <span className="font-bold">Lingua</span>
          </div>
          <h1 className="text-sm font-medium text-slate-500 hidden md:block">
            {t('welcome').replace('{name}', userName)}
          </h1>
          <button 
            onClick={() => onNavigate('scanner')}
            className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all shadow-sm shadow-emerald-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <PlusCircle size={18} />
            {t('newScan')}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {children}
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className={`md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 ${
                activeView === item.id ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] uppercase tracking-wider font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
