
import React, { useState } from 'react';
import { User } from '../types';
import { Zap, Mail, Lock, User as UserIcon, ArrowRight, Globe } from 'lucide-react';
import { getTranslation } from '../utils/translations';
import { COMMON_LANGUAGES } from '../utils/languages';

interface AuthProps {
  onLogin: (user: User) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  uiStrings: Record<string, string>;
}

const Auth: React.FC<AuthProps> = ({ onLogin, language, onLanguageChange, uiStrings }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const t = (key: string) => getTranslation(language, key, uiStrings);
  const isRTL = language === 'fa' || language === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: Math.random().toString(36).substring(7),
      email,
      name: isLogin ? 'Healthy Friend' : name
    });
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 z-50">
        <Globe size={16} className="text-slate-400" />
        <select 
          value={language} 
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs font-bold text-slate-600 outline-none bg-transparent"
        >
          {COMMON_LANGUAGES.slice(0, 30).map(l => (
            <option key={l.code} value={l.code}>{l.nativeName}</option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 mb-4">
            <Zap size={32} fill="white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Lingua</h1>
          <p className="text-slate-500 mt-2 font-medium">Your AI Tongue Health Buddy</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className={`flex mb-8 bg-slate-50 p-1 rounded-2xl ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium`}
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium`}
                required
              />
            </div>
            <div className="relative">
              <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium`}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {isLogin ? 'Sign In' : 'Join Lingua'}
              <ArrowRight size={20} className={`${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'} transition-transform`} />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">{t('madeBy')}</p>
          <p className="text-slate-400 text-xs px-8 leading-relaxed">
            {t('privacy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
