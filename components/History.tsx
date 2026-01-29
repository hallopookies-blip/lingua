
import React from 'react';
import { Clock, ChevronRight, Search } from 'lucide-react';
import { ScanRecord } from '../types';

interface HistoryProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
}

const History: React.FC<HistoryProps> = ({ scans, onSelectScan }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Scan History</h2>
          <p className="text-slate-500">Track your progress over time</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search scans..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {scans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <Clock size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No scans yet. Start your first health check!</p>
          </div>
        ) : (
          scans.map((scan) => (
            <button
              key={scan.id}
              onClick={() => onSelectScan(scan)}
              className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl transition-all text-left group"
            >
              <img src={scan.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <h3 className="font-bold text-slate-900 truncate">
                     {new Date(scan.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                   </h3>
                   <span className="text-xs text-slate-400">
                     {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
                <p className="text-sm text-slate-500 truncate">{scan.summary}</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
