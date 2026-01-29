
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  ScanRecord, 
  View, 
  AnalysisResults 
} from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import History from './components/History';
import ResultView from './components/ResultView';
import { analyzeTongueImage, translateUIStrings } from './services/geminiService';
import { BASE_STRINGS, getTranslation } from './utils/translations';
import { COMMON_LANGUAGES } from './utils/languages';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>('auth');
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<ScanRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [uiStrings, setUiStrings] = useState<Record<string, string>>(BASE_STRINGS);
  const [language, setLanguage] = useState(navigator.language.split('-')[0] || 'en');

  // Handle routing based on hash
  const handleDeepLink = useCallback((allScans: ScanRecord[]) => {
    const hash = window.location.hash;
    if (hash.startsWith('#scan-')) {
      const scanId = hash.replace('#scan-', '');
      const found = allScans.find(s => s.id === scanId);
      if (found) {
        setCurrentAnalysis(found);
        setActiveView('result');
        return true;
      }
    }
    return false;
  }, []);

  // Load initial state
  useEffect(() => {
    const savedUser = localStorage.getItem('lingua_user');
    const savedScans = localStorage.getItem('lingua_scans');
    
    let loadedScans: ScanRecord[] = [];
    if (savedScans) {
      loadedScans = JSON.parse(savedScans);
      setScans(loadedScans);
    }

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.language) {
        handleLanguageChange(parsedUser.language);
      }
      
      // If no deep link, go to dashboard
      if (!handleDeepLink(loadedScans)) {
        setActiveView('dashboard');
      }
    }
    
    // Listen for hash changes (QR code scans while app is open)
    const onHashChange = () => {
      const savedScansNow = localStorage.getItem('lingua_scans');
      const scansNow = savedScansNow ? JSON.parse(savedScansNow) : [];
      handleDeepLink(scansNow);
    };

    window.addEventListener('hashchange', onHashChange);
    
    const browserLang = navigator.language.split('-')[0];
    if (browserLang !== 'en' && !savedUser) {
      handleLanguageChange(browserLang);
    }

    return () => window.removeEventListener('hashchange', onHashChange);
  }, [handleDeepLink]);

  const handleLanguageChange = async (newLang: string) => {
    if (newLang === 'en') {
      setLanguage('en');
      setUiStrings(BASE_STRINGS);
      return;
    }

    setIsTranslating(true);
    setLanguage(newLang);
    try {
      const translated = await translateUIStrings(newLang, BASE_STRINGS);
      setUiStrings(translated);
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLogin = (u: User) => {
    const userWithLang = { ...u, language: language };
    setUser(userWithLang);
    localStorage.setItem('lingua_user', JSON.stringify(userWithLang));
    
    if (!handleDeepLink(scans)) {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lingua_user');
    setActiveView('auth');
    setLanguage('en');
    setUiStrings(BASE_STRINGS);
    window.location.hash = '';
  };

  const handleNewScan = async (image: string) => {
    setIsLoading(true);
    try {
      const results = await analyzeTongueImage(image, language);
      const newScan: ScanRecord = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        image,
        results,
        summary: language === 'fa' 
          ? `تحلیل نشان‌دهنده رنگ ${results.color} با بافت ${results.texture} است.`
          : `Analysis shows ${results.color} color with ${results.texture} texture.`
      };

      const updatedScans = [newScan, ...scans];
      setScans(updatedScans);
      localStorage.setItem('lingua_scans', JSON.stringify(updatedScans));
      
      setCurrentAnalysis(newScan);
      setActiveView('result');
      // Update hash for deep linking
      window.location.hash = `scan-${newScan.id}`;
    } catch (error) {
      console.error("Analysis failed", error);
      alert(getTranslation(language, 'error', uiStrings));
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    const t = (key: string) => getTranslation(language, key, uiStrings);

    if (isLoading || isTranslating) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{isTranslating ? 'Translating UI...' : t('analyzing')}</h2>
          <p className="text-slate-500 mt-2">{t('waitAi')}</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user!} 
            latestScan={scans[0]} 
            history={scans}
            onNewScan={() => setActiveView('scanner')}
            onViewHistory={() => setActiveView('history')}
            language={language}
            uiStrings={uiStrings}
          />
        );
      case 'scanner':
        return <Scanner onCapture={handleNewScan} onCancel={() => setActiveView('dashboard')} />;
      case 'history':
        return <History scans={scans} onSelectScan={(s) => { 
          setCurrentAnalysis(s); 
          setActiveView('result'); 
          window.location.hash = `scan-${s.id}`;
        }} />;
      case 'result':
        if (!currentAnalysis) return null;
        const currentIdx = scans.findIndex(s => s.id === currentAnalysis.id);
        const previousScan = currentIdx !== -1 && currentIdx < scans.length - 1 ? scans[currentIdx + 1] : undefined;
        
        return (
          <ResultView 
            scanId={currentAnalysis.id}
            results={currentAnalysis.results} 
            image={currentAnalysis.image} 
            timestamp={currentAnalysis.timestamp} 
            language={language}
            onBack={() => {
              setActiveView('history');
              window.location.hash = '';
            }}
            previousScan={previousScan}
          />
        );
      case 'profile':
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <h2 className="text-2xl font-bold mb-6">{t('profile')}</h2>
            <div className={`flex items-center gap-6 mb-8 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold">
                {user?.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-slate-400 font-bold uppercase">Display Name</p>
                <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-slate-100 mt-8">
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{t('madeBy')}</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <h2 className="text-2xl font-bold mb-6">{t('settings')}</h2>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('language')}</label>
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                >
                  {COMMON_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">{t('changeLang')}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{t('madeBy')}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (activeView === 'auth') {
    return (
      <Auth 
        onLogin={handleLogin} 
        language={language} 
        onLanguageChange={handleLanguageChange} 
        uiStrings={uiStrings}
      />
    );
  }

  return (
    <Layout 
      activeView={activeView} 
      onNavigate={setActiveView} 
      onLogout={handleLogout}
      userName={user?.name || 'Friend'}
      language={language}
      uiStrings={uiStrings}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
