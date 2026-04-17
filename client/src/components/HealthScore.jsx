import { useMemo } from 'react';
import { Heart, TrendingUp, ShieldCheck, BarChart2, PiggyBank } from 'lucide-react';
import { calculateFinancialHealthScore, calculateCategoryTotals, formatCurrency } from '../utils/helpers';

function ScoreRing({ score }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="200" height="200" className="score-ring drop-shadow-lg">
        {/* Background track */}
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        {/* Progress arc */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-5xl font-bold" style={{ color }}>{score}</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">/ 100</p>
      </div>
    </div>
  );
}

export default function HealthScore({ expenses }) {
  const health = useMemo(() => calculateFinancialHealthScore(expenses), [expenses]);
  const categories = useMemo(() => calculateCategoryTotals(expenses), [expenses]);

  const label = health.score >= 70 ? 'Excellent 🌟' : health.score >= 50 ? 'Good 👍' : 'Needs Work ⚠️';
  const labelColor = health.score >= 70 ? 'var(--accent-green)' : health.score >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)';

  const pillars = [
    {
      icon: PiggyBank,
      label: 'Savings Rate',
      value: `${health.savingsRate}%`,
      sub: health.savingsRate >= 20 ? 'Great — above 20% target' : 'Target: save at least 20%',
      score: Math.min(parseFloat(health.savingsRate) * 1.75, 35),
      max: 35,
      color: 'var(--accent-green)',
    },
    {
      icon: ShieldCheck,
      label: 'Budget Discipline',
      value: health.isOverBudget ? 'Over budget' : 'Within budget',
      sub: health.isOverBudget
        ? `Exceeded by ${formatCurrency(health.totalSpent - health.budget)}`
        : `${formatCurrency(health.budget - health.totalSpent)} remaining`,
      score: health.isOverBudget ? Math.max(0, 35 - ((health.totalSpent - health.budget) / health.budget) * 50) : 35,
      max: 35,
      color: health.isOverBudget ? 'var(--accent-red)' : 'var(--accent-primary)',
    },
    {
      icon: BarChart2,
      label: 'Category Diversity',
      value: `${categories.length} categories`,
      sub: categories.length >= 5 ? 'Well diversified spending' : 'Track more categories',
      score: Math.min(categories.length * 12, 30),
      max: 30,
      color: 'var(--accent-cyan)',
    },
  ];

  const tips = [
    health.savingsRate < 20 && 'Automate savings — transfer 20% to savings on salary day before spending.',
    health.isOverBudget && `Reduce spending by ${formatCurrency(health.totalSpent - health.budget)} to get back on track.`,
    parseFloat(health.topCategoryPercent) > 35 && `${health.topCategory} takes ${health.topCategoryPercent}% of spending — aim to bring it under 30%.`,
    'Build a 3-6 month emergency fund before investing.',
    'Use the 50/30/20 rule: needs/wants/savings.',
  ].filter(Boolean).slice(0, 4);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Heart className="text-[var(--accent-red)]" size={28} />
          Financial Health Score
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          A holistic view of your financial wellness based on spending behavior
        </p>
      </div>

      {/* Score Ring Card */}
      <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8">
        <ScoreRing score={health.score} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mb-2">Your Financial Health</p>
          <h2 className="font-['Outfit'] text-4xl font-bold mb-2" style={{ color: labelColor }}>{label}</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
            {health.score >= 70
              ? "Outstanding! You're managing your finances exceptionally well. Keep up the discipline and consider growing your investments."
              : health.score >= 50
              ? "You're doing reasonably well. A few targeted improvements can push you into the excellent zone."
              : "Your financial health needs attention. Focus on reducing overspending and building savings habits."}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Total Spent: </span>
              <span className="font-semibold">{formatCurrency(health.totalSpent)}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Budget: </span>
              <span className="font-semibold">{formatCurrency(health.budget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          const pct = (p.score / p.max) * 100;
          return (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5">
                  <Icon size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <p className="font-medium text-sm">{p.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{p.sub}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
                <span className="text-[var(--text-muted)] text-xs">{Math.round(p.score)}/{p.max} pts</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%`, background: p.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Tips */}
      <div className="glass-card p-6 border-l-4 border-l-[var(--accent-green)]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[var(--accent-green)]" />
          <h2 className="font-['Outfit'] font-semibold text-lg">How to Improve Your Score</h2>
        </div>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--accent-green)] font-bold mt-0.5">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
