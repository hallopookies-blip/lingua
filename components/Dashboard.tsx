
import React, { useMemo } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Droplets, 
  Star,
  TrendingUp,
  Flame,
  Calendar
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { ScanRecord, User } from '../types';
import { getTranslation } from '../utils/translations';

interface DashboardProps {
  user: User;
  latestScan?: ScanRecord;
  history: ScanRecord[];
  onNewScan: () => void;
  onViewHistory: () => void;
  language: string;
  uiStrings: Record<string, string>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, latestScan, history, onNewScan, onViewHistory, language, uiStrings }) => {
  const t = (key: string) => getTranslation(language, key, uiStrings);
  const isRTL = language.startsWith('fa') || language.startsWith('ar');

  // Calculate Streak
  const streak = useMemo(() => {
    if (history.length === 0) return 0;
    let currentStreak = 0;
    const sortedDates = history
      .map(s => new Date(s.timestamp).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i); // Unique days

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      const expected = new Date(Date.now() - i * 86400000);
      if (d.toDateString() === expected.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [history]);

  // Format data for trend chart
  const trendData = useMemo(() => 
    [...history].reverse().slice(-7).map(scan => ({
      date: new Date(scan.timestamp).toLocaleDateString(language, { month: 'short', day: 'numeric' }),
      redness: scan.results.redness,
      moisture: scan.results.moisture,
    })), [history, language]);

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Welcome */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-emerald-200">
        <div className="relative z-10">
          <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
               <Flame size={18} className="text-orange-400 fill-orange-400" />
               <span className="font-bold text-sm">{streak} Day Streak</span>
             </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('welcome').replace('{name}', user.name.split(' ')[0])}</h2>
          <p className={`text-emerald-50 text-lg mb-8 max-w-lg ${isRTL ? 'text-right' : ''}`}>
            Regular tongue checks can reveal a lot about your inner balance. Ready for a quick 30-second scan?
          </p>
          <button 
            onClick={onNewScan}
            className={`bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('startScan')}
            <Zap size={20} fill="currentColor" />
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      {/* Trends Section */}
      {history.length > 1 && (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold text-xl">Weekly Vitals</h3>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Redness
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Moisture
               </div>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} reversed={isRTL} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="redness" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRed)" />
                <Area type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        {/* Latest Results Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="font-bold text-xl">{t('latestAnalysis')}</h3>
            <button 
              onClick={onViewHistory}
              className={`text-emerald-600 font-semibold text-sm flex items-center gap-1 hover:underline ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {t('viewHistory')} <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>

          {latestScan ? (
            <div className="space-y-4">
              <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <img src={latestScan.image} className="w-24 h-24 rounded-2xl object-cover shadow-inner" />
                <div className="flex-1">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                    {new Date(latestScan.timestamp).toLocaleDateString(language)}
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{latestScan.results.color} Tongue</h4>
                  <p className="text-sm text-slate-500 line-clamp-2">{latestScan.summary}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400">Complete a scan to see insights here.</p>
            </div>
          )}
        </div>

        {/* Focus Card */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className={`flex items-center gap-3 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
               <Calendar size={20} />
             </div>
             <h3 className="font-bold text-xl">Habit Tracker</h3>
          </div>
          <div className="space-y-4">
            <div className={`flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <Droplets size={20} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Stay Hydrated</h4>
                <p className="text-emerald-800/70 text-xs mt-1">Consistency is key. You've checked your tongue {history.length} times!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
