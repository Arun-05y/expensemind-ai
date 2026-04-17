import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Calendar, ArrowUpRight,
} from 'lucide-react';
import { categoryColors } from '../data/sampleData';
import {
  calculateCategoryTotals, calculateTotalSpending,
  calculateFinancialHealthScore, formatCurrency,
} from '../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="text-[var(--text-secondary)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ expenses, monthlyTrend }) {
  const total = useMemo(() => calculateTotalSpending(expenses), [expenses]);
  const categories = useMemo(() => calculateCategoryTotals(expenses), [expenses]);
  const health = useMemo(() => calculateFinancialHealthScore(expenses), [expenses]);
  const avgDaily = useMemo(() => {
    const day = new Date().getDate() || 1;
    return Math.round(total / day);
  }, [total]);

  const statCards = [
    {
      title: 'Total Spent',
      value: formatCurrency(total),
      subtitle: 'This month',
      icon: DollarSign,
      gradient: 'var(--gradient-1)',
      trend: health.isOverBudget ? '+' + ((total / health.budget - 1) * 100).toFixed(0) + '%' : 'On track',
      trendUp: health.isOverBudget,
    },
    {
      title: 'Daily Average',
      value: formatCurrency(avgDaily),
      subtitle: 'Per day spend',
      icon: Calendar,
      gradient: 'var(--gradient-2)',
      trend: avgDaily > 750 ? 'High' : 'Normal',
      trendUp: avgDaily > 750,
    },
    {
      title: 'Top Category',
      value: health.topCategory,
      subtitle: `${health.topCategoryPercent}% of total`,
      icon: ShoppingBag,
      gradient: 'var(--gradient-4)',
      trend: health.topCategoryPercent > 30 ? 'Dominant' : 'Balanced',
      trendUp: health.topCategoryPercent > 30,
    },
    {
      title: 'Health Score',
      value: `${health.score}/100`,
      subtitle: health.score >= 70 ? 'Excellent' : health.score >= 50 ? 'Good' : 'Needs Work',
      icon: TrendingUp,
      gradient: 'var(--gradient-3)',
      trend: health.savingsRate + '% saved',
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold">
            Welcome back 👋
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Here's your financial overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <div className="pulse-dot" />
          <span>Live data</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="glass-card p-5 group hover:border-[var(--accent-primary)]/30 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.gradient }}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
                  ${card.trendUp
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {card.trendUp ? <TrendingDown size={12} /> : <ArrowUpRight size={12} />}
                  {card.trend}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{card.value}</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1">{card.title} · {card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-3 glass-card p-6">
          <h2 className="font-['Outfit'] font-semibold text-lg mb-1">Monthly Trend</h2>
          <p className="text-[var(--text-muted)] text-sm mb-5">Spending vs Budget over time</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="amount" name="Spent"
                  stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#colorSpend)"
                />
                <Area
                  type="monotone" dataKey="budget" name="Budget"
                  stroke="#10b981" strokeWidth={2} strokeDasharray="6 4"
                  fill="url(#colorBudget)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-['Outfit'] font-semibold text-lg mb-1">By Category</h2>
          <p className="text-[var(--text-muted)] text-sm mb-5">Where your money goes</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categories.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={categoryColors[entry.name] || '#64748b'}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: categoryColors[cat.name] || '#64748b' }}
                />
                <span className="text-[var(--text-secondary)] truncate">{cat.name}</span>
                <span className="ml-auto font-medium">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-['Outfit'] font-semibold text-lg">Recent Expenses</h2>
            <p className="text-[var(--text-muted)] text-sm">Latest transactions</p>
          </div>
          <span className="text-xs text-[var(--text-muted)] bg-white/5 px-3 py-1.5 rounded-full">
            {expenses.length} total
          </span>
        </div>
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {expenses.slice().reverse().slice(0, 8).map((exp, i) => (
            <div
              key={exp._id || i}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                {exp.icon || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{exp.note || exp.category}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <span className="font-semibold text-sm text-red-400">
                -{formatCurrency(exp.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
