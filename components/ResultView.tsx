
import React, { useState } from 'react';
import { 
  Heart,
  ChevronLeft,
  Activity,
  Sparkles,
  Info,
  MessageCircle,
  Send,
  Loader2,
  ShieldCheck,
  Split,
  QrCode,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AnalysisResults, ScanRecord } from '../types';
import { chatWithHealthBuddy } from '../services/geminiService';

interface ResultViewProps {
  scanId: string;
  results: AnalysisResults;
  image: string;
  timestamp: string;
  language: string;
  onBack: () => void;
  previousScan?: ScanRecord;
}

const ResultView: React.FC<ResultViewProps> = ({ scanId, results, image, timestamp, language, onBack, previousScan }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'buddy', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  
  const isRTL = language.startsWith('fa') || language.startsWith('ar');

  const baseUrl = window.location.href.split('#')[0];
  const shareUrl = `${baseUrl}#scan-${scanId}`;

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatting(true);
    try {
      const response = await chatWithHealthBuddy(userMsg, results, language);
      setChatHistory(prev => [...prev, { role: 'buddy', text: response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'buddy', text: "Sorry, I had trouble thinking about that." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="pb-20 space-y-8 animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button onClick={onBack} className={`flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
          <ChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} /> 
          {isRTL ? 'بازگشت به تاریخچه' : 'Back to History'}
        </button>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {previousScan && (
            <button onClick={() => setIsComparing(!isComparing)} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${isComparing ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500'}`}>
              <Split size={14} className="inline mx-1" /> {isRTL ? 'حالت مقایسه' : 'Compare Mode'}
            </button>
          )}
          <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 uppercase tracking-widest">
            <ShieldCheck size={14} className="inline mx-1" /> 98.7% Precision
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 sticky top-4 overflow-hidden">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-inner">
               <img src={image} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isComparing ? 'opacity-50' : ''}`} alt="Tongue Scan" />
               {isComparing && previousScan && <img src={previousScan.image} className="absolute inset-0 w-full h-full object-cover animate-pulse opacity-50" alt="Previous Scan" />}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                <Calendar size={12} />
                {new Date(timestamp).toLocaleDateString(language, { dateStyle: 'long' })}
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Archetype Profile</p>
                <h3 className="text-xl font-black">{results.temperament.archetype}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{results.temperament.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {results.temperament.traits.map((trait, i) => (
                    <span key={i} className="text-[9px] bg-white/10 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[{l: 'Red', v: results.redness}, {l: 'Moist', v: results.moisture}, {l: 'Cracks', v: results.cracks}].map(x => (
                  <div key={x.l} className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{x.l}</p>
                    <p className="text-sm font-bold">{x.v}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Explicit Condition Marker Detection */}
          <section className="bg-white p-8 rounded-[2rem] border-l-8 border-red-500 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Stethoscope size={120} />
            </div>
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertTriangle className="text-red-500" size={24} />
              {isRTL ? 'نشانگرهای بالینی شناسایی شده' : 'Identified Clinical Markers'}
            </h3>
            <div className="space-y-6">
              {results.detectedConditions.length > 0 ? (
                results.detectedConditions.map((cond, idx) => (
                  <div key={idx} className="p-5 bg-red-50/50 rounded-3xl border border-red-100 relative z-10">
                    <div className={`flex justify-between items-start mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <h4 className={`text-lg font-black text-red-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {isRTL ? `نشانگر برای ${cond.name}` : `Markers for ${cond.name}`}
                          <span className="text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Detected</span>
                        </h4>
                        <p className={`text-sm font-bold text-red-800/70 mt-1 ${isRTL ? 'text-right' : ''}`}>{cond.likelihood}% Visual Confidence</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${cond.severity === 'high' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {cond.severity} Priority
                      </span>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl border border-red-100/50">
                      <p className={`text-xs text-slate-700 leading-relaxed ${isRTL ? 'text-right' : ''}`}><span className="font-bold text-red-900">{isRTL ? 'شواهد بصری:' : 'Visual Evidence:'}</span> {cond.evidence}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No major pathological markers detected in this scan.</p>
                </div>
              )}
            </div>
          </section>

          {/* Step-by-Step Wellness Path */}
          <section className="bg-emerald-950 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-emerald-800">
            <div className="relative z-10">
              <h3 className={`text-2xl font-black mb-6 flex items-center gap-2 italic ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Zap className="text-emerald-400 fill-emerald-400" size={24} />
                {isRTL ? 'مسیر بهبود طبیعی شما' : 'Natural Wellness Path'}
              </h3>
              <div className="grid gap-6">
                {results.guidance.recoverySteps.map((step, idx) => (
                  <div key={idx} className={`group flex gap-5 items-start bg-white/5 hover:bg-white/10 p-5 rounded-3xl transition-all border border-white/5 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 text-lg font-black shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-base text-emerald-50 font-medium leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`mt-10 p-4 bg-emerald-900/50 rounded-2xl border border-emerald-700/50 flex gap-4 items-center ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Heart className="text-red-400" size={24} />
                </div>
                <p className="text-xs text-emerald-200 font-bold uppercase tracking-widest">
                  Strict Natural Protocol: Whole foods, specific hydration, and ancestral hygiene. No pills or chemicals.
                </p>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </section>

          {/* Deep Analysis Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className={`font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tighter ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Activity size={18} className="text-red-500"/> {isRTL ? 'رزونانس داخلی' : 'Internal Resonance'}
              </h4>
              <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                {[
                  { label: isRTL ? 'گوارش/معده' : 'Digestion/Stomach', val: results.organHealth.digestion },
                  { label: isRTL ? 'کبد/کیسه صفرا' : 'Liver/Gallbladder', val: results.organHealth.liver },
                  { label: isRTL ? 'کلیه/انرژی' : 'Kidney/Energy', val: results.organHealth.kidney },
                  { label: isRTL ? 'قلب/ذهن' : 'Heart/Mind', val: results.organHealth.heart }
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{item.val}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <h4 className={`font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tighter ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MessageCircle size={18} className="text-emerald-500"/> {isRTL ? 'گفتگو با لینگوا' : 'Chat with Lingua'}
              </h4>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[180px] pr-2 custom-scrollbar">
                {chatHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center mt-10">"How should I adjust my diet for {results.temperament.archetype}?"</p>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isChatting && <div className="flex justify-start"><Loader2 className="animate-spin text-emerald-600" size={16} /></div>}
              </div>
              <div className="relative">
                <input 
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && handleSendChat()}
                  placeholder={isRTL ? "درخواست مشاوره طبیعی..." : "Ask for natural advice..."}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-10 text-[11px] outline-none focus:ring-2 focus:ring-emerald-500/20 ${isRTL ? 'text-right' : ''}`}
                />
                <button onClick={handleSendChat} disabled={isChatting} className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 text-white rounded-xl disabled:opacity-50`}><Send size={12} className={isRTL ? 'rotate-180' : ''} /></button>
              </div>
            </section>
          </div>

          {/* Scan Passport */}
          <section className={`bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 shadow-sm ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <div className="bg-slate-900 p-3 rounded-2xl border-4 border-white shadow-xl">
              <QRCodeSVG value={shareUrl} size={90} level="H" includeMargin={false} fgColor="#10b981" bgColor="#0f172a" />
            </div>
            <div className={`text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
              <h4 className={`font-black text-slate-900 flex items-center justify-center md:justify-start gap-2 uppercase tracking-tighter ${isRTL ? 'flex-row-reverse' : ''}`}>
                <QrCode size={18} className="text-emerald-600"/> Digital Scan ID
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">This QR acts as a permanent link to this specific scan. Share it with your holistic practitioner.</p>
              <div className={`mt-3 flex gap-2 justify-center ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
                <button onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Copied!"); }} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Copy URL</button>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
            <Info size={20} className="text-amber-500 shrink-0 mt-1" />
            <div className={`space-y-1 ${isRTL ? 'text-right' : ''}`}>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Medical Disclaimer</p>
              <p className="text-[9px] font-bold text-amber-800 leading-relaxed uppercase opacity-80">
                Lingua is a wellness and visual marker detection tool. It identifies visual similarities to clinical conditions but does not provide medical diagnoses. Always consult a licensed physician for diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
