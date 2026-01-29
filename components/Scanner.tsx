
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Check, AlertCircle, X, Zap } from 'lucide-react';

interface ScannerProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      setError("We couldn't access your camera. Please check permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Zap size={24} className="text-emerald-500 fill-emerald-500" />
          Ready for Scan
        </h2>
        <p className="text-slate-500 mt-2">Open your mouth wide and center your tongue.</p>
      </div>

      <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
        {!capturedImage ? (
          <>
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-slate-700 font-medium">{error}</p>
                <button 
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover mirror opacity-80"
              />
            )}
            
            {/* Scan Overlay UI */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-72 border-2 border-emerald-500/50 border-dashed rounded-[100px] animate-pulse relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-widest">
                  Target Zone
                </div>
              </div>
            </div>
            
            {/* Horizontal Scanning Line Animation */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-scanLine z-20"></div>
          </>
        ) : (
          <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="flex items-center gap-4">
        {!capturedImage ? (
          <>
            <button 
              onClick={onCancel}
              className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
            >
              <X size={24} />
            </button>
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full bg-white border-8 border-emerald-500/20 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-emerald-600 rounded-full shadow-inner flex items-center justify-center text-white">
                <Camera size={24} />
              </div>
            </button>
            <label className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all cursor-pointer">
              <Upload size={24} />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => { setCapturedImage(null); startCamera(); }}
              className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              <RefreshCw size={20} />
              Retake
            </button>
            <button 
              onClick={() => onCapture(capturedImage)}
              className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Check size={20} />
              Analyze Now
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        .mirror { transform: scaleX(-1); }
        @keyframes scanLine {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanLine {
          animation: scanLine 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
