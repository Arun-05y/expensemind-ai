import { useMemo, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Zap, Loader } from 'lucide-react';
import { predictNextMonth, calculateCategoryTotals, formatCurrency } from '../utils/helpers';
import { categoryColors } from '../data/sampleData';
import { getPrediction } from '../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="text-[var(--text-secondary)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.fill }} className="font-semibold">
          {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function Predictions({ expenses }) {
  const [aiPredict, setAiPredict] = useState(null);
  const [loading, setLoading] = useState(false);

  const localPrediction = useMemo(() => predictNextMonth(expenses), [expenses]);
  const categories = useMemo(() => calculateCategoryTotals(expenses), [expenses]);

  const prediction = aiPredict ? { ...localPrediction, ...aiPredict } : localPrediction;

  useEffect(() => {
    const fetchPrediction = async () => {
      if (expenses.length < 5) return;
      setLoading(true);
      try {
        const res = await getPrediction(expenses);
        setAiPredict(res.data);
      } catch (err) {
        console.error('Error fetching prediction:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [expenses]);

  const riskColor = {
    Low: 'var(--accent-green)',
    Medium: 'var(--accent-yellow)',
    High: 'var(--accent-red)',
  }[prediction.riskLevel];

  const riskIcon = {
    Low: CheckCircle,
    Medium: AlertTriangle,
    High: Zap,
  }[prediction.riskLevel];
  const RiskIcon = riskIcon;

  // Build projected category bars (scale current month up to full month projection)
  const day = new Date().getDate() || 1;
  const projData = categories.map(cat => ({
    name: cat.name,
    current: cat.value,
    projected: Math.round((cat.value / day) * 30),
  }));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[var(--accent-cyan)]" size={28} />
            Spending Predictions
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            AI-powered forecast based on your current spending velocity
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--accent-cyan)] animate-pulse">
            <Loader size={14} className="animate-spin" />
            <span>Crunching numbers...</span>
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Next Month Forecast</p>
          <p className="text-4xl font-bold text-[var(--accent-cyan)]">{formatCurrency(prediction.predicted)}</p>
          <p className="text-[var(--text-muted)] text-xs mt-2">projected total spend</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Daily Average</p>
          <p className="text-4xl font-bold gradient-text">{formatCurrency(prediction.dailyAvg)}</p>
          <p className="text-[var(--text-muted)] text-xs mt-2">per day based on history</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-2">Risk Level</p>
          <div className="flex items-center justify-center gap-2">
            <RiskIcon size={28} style={{ color: riskColor }} />
            <p className="text-4xl font-bold" style={{ color: riskColor }}>{prediction.riskLevel}</p>
          </div>
          <p className="text-[var(--text-muted)] text-xs mt-2">top risk: {prediction.topRiskCategory}</p>
        </div>
      </div>

      {/* Projected vs Current Chart */}
      <div className="glass-card p-6">
        <h2 className="font-['Outfit'] font-semibold text-lg mb-1">Category Projection</h2>
        <p className="text-[var(--text-muted)] text-sm mb-5">Current spend vs projected end-of-month by category</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#1e293b" />
              {projData.map((entry, i) => (
                <Bar
                  key={i}
                  dataKey="projected"
                  name="Projected"
                  radius={[6, 6, 0, 0]}
                  fill={categoryColors[entry.name] || '#64748b'}
                  opacity={0.85}
                />
              ))}
              <Bar dataKey="current" name="Current" radius={[6, 6, 0, 0]} fill="rgba(255,255,255,0.08)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-white/20" />
            <span>Current Month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent-primary)' }} />
            <span>Projected (30-day)</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card p-6 border-l-4 border-l-[var(--accent-cyan)]">
        <h2 className="font-['Outfit'] font-semibold text-lg mb-3">💡 Prediction Insights</h2>
        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="text-[var(--accent-cyan)]">→</span>
            <span>At your current rate of <strong>{formatCurrency(prediction.dailyAvg)}/day</strong>, you'll spend <strong>{formatCurrency(prediction.predicted)}</strong> next month.</span>
          </li>
          {prediction.riskLevel !== 'Low' && (
            <li className="flex items-start gap-3">
              <span className="text-[var(--accent-yellow)]">→</span>
              <span>Your <strong>{prediction.topRiskCategory}</strong> category is your biggest risk driver. Trim it by 20% to bring spending below budget.</span>
            </li>
          )}
          <li className="flex items-start gap-3">
            <span className="text-[var(--accent-green)]">→</span>
            <span>To stay within ₹22,000, keep your daily average under <strong>₹{(22000 / 30).toFixed(0)}</strong>.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
