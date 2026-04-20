import { useState } from 'react';
import { Download, Cloud, FileJson, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ExportData({ expenses }) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = (type) => {
    setExporting(true);
    setDone(false);
    
    // Simulate API call to Google Drive
    setTimeout(() => {
      setExporting(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-[var(--text-secondary)]">Backup your financial records to Google Services or locally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Card */}
        <div className="glass-card p-8 flex flex-col items-center text-center gap-6 group hover:border-indigo-500/50 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Cloud size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Sync with Google Drive</h2>
            <p className="text-sm text-[var(--text-muted)]">Automatically upload your monthly expense reports to your Drive account.</p>
          </div>
          <button
            onClick={() => handleExport('drive')}
            disabled={exporting}
            aria-label={done ? "Synced Successfully" : "Sync data to Google Drive"}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
              ${done ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
          >
            {exporting ? (
              <div aria-label="Exporting..." className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : done ? (
              <>
                <CheckCircle2 size={20} />
                <span>Synced Successfully</span>
              </>
            ) : (
              <>
                <Cloud size={20} />
                <span>Sync to Google Drive</span>
              </>
            )}
          </button>
        </div>

        {/* Local Download Card */}
        <div className="glass-card p-8 flex flex-col items-center text-center gap-6 group hover:border-emerald-500/50 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Download size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Local Backup</h2>
            <p className="text-sm text-[var(--text-muted)]">Download your data in JSON or CSV format for your own records.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => handleExport('json')}
              aria-label="Download backup as JSON"
              className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              <FileJson size={16} /> JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              aria-label="Download backup as CSV"
              className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              <FileText size={16} /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Table for export prep */}
      <div className="glass-card p-6 overflow-hidden">
        <h3 className="font-semibold mb-4">Export Preview ({expenses.length} items)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--text-muted)] border-b border-white/5">
              <tr>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Note</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.slice(0, 5).map((e, i) => (
                <tr key={i}>
                  <td className="py-3 pr-4">{e.date}</td>
                  <td className="py-3 pr-4">{e.category}</td>
                  <td className="py-3 pr-4">{e.note || '-'}</td>
                  <td className="py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
