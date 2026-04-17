import { useState, useEffect, useMemo } from 'react';
import { Brain, Loader, Lightbulb, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { getAIInsights } from '../utils/api';
import {
  calculateCategoryTotals, calculateTotalSpending,
  calculateFinancialHealthScore, formatCurrency,
} from '../utils/helpers';
import { categoryColors } from '../data/sampleData';

export default function AIInsights({ expenses }) {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [useLocal, setUseLocal] = useState(true);

  const total = useMemo(() => calculateTotalSpending(expenses), [expenses]);
  const categories = useMemo(() => calculateCategoryTotals(expenses), [expenses]);
  const health = useMemo(() => calculateFinancialHealthScore(expenses), [expenses]);

  // Generate local insights
  const localInsights = useMemo(() => {
    const sorted = [...categories].sort((a, b) => b.value - a.value);
    const topThree = sorted.slice(0, 3);
    const foodPct = ((categories.find(c => c.name === 'Food')?.value || 0) / total * 100).toFixed(0);
    const travelPct = ((categories.find(c => c.name === 'Travel')?.value || 0) / total * 100).toFixed(0);

    return {
      summary: `This month, you've spent ${formatCurrency(total)} across ${categories.length} categories. ` +
        `Your top spending category is ${sorted[0]?.name || 'N/A'} at ${formatCurrency(sorted[0]?.value || 0)} ` +
        `(${((sorted[0]?.value || 0) / total * 100).toFixed(0)}% of total). ` +
        (health.isOverBudget
          ? `You're currently over budget by ${formatCurrency(total - health.budget)}.`
          : `You're within your budget with ${formatCurrency(health.budget - total)} remaining.`),
      unnecessaryExpenses: [
        travelPct > 20 ? `Travel (${travelPct}%): Consider carpooling or using public transport to cut costs.` : null,
        foodPct > 20 ? `Food delivery (${foodPct}%): Cooking at home 3x/week could save ₹2,000+/month.` : null,
        categories.find(c => c.name === 'Entertainment') ? `Entertainment subscriptions: Review if all streaming services are being used.` : null,
        categories.find(c => c.name === 'Shopping') ? `Shopping: Apply the 48-hour rule — wait before impulse purchases.` : null,
      ].filter(Boolean).slice(0, 3),
      suggestions: [
        'Set up automatic transfers to a savings account on payday.',
        `Reduce ${sorted[0]?.name || 'top category'} spending by 15% to save ${formatCurrency(Math.round((sorted[0]?.value || 0) * 0.15))}/month.`,
        'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
        'Track daily micro-expenses — they add up to 20% of monthly spending.',
      ],
      healthScore: health.score,
      prediction: Math.round(total * 1.05),
    };
  }, [expenses, categories, total, health]);

  const fetchAIInsights = async () => {
    setLoading(true);
    setUseLocal(false);
    try {
      const res = await getAIInsights(expenses);
      setAiData(res.data);
    } catch {
      setUseLocal(true);
    }
    setLoading(false);
  };

  const data = useLocal ? localInsights : aiData;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Brain className="text-[var(--accent-primary)]" size={28} />
            AI Insights
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Smart analysis of your spending patterns
          </p>
        </div>
        <button
          id="fetch-ai-insights"
          onClick={fetchAIInsights}
          className="btn-primary flex items-center gap-2"
          disabled={loading}
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <Brain size={16} />}
          {loading ? 'Analyzing...' : 'Get AI Insights'}
        </button>
      </div>

      {data && (
        <div className="space-y-5">
          {/* Summary Card */}
          <div className="glass-card p-6 border-l-4 border-l-[var(--accent-primary)]">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-[var(--accent-primary)]" />
              <h2 className="font-['Outfit'] font-semibold text-lg">Spending Pattern Summary</h2>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {data.summary}
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="glass-card p-6">
            <h2 className="font-['Outfit'] font-semibold text-lg mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {categories.sort((a, b) => b.value - a.value).map((cat, i) => {
                const pct = ((cat.value / total) * 100).toFixed(1);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-[var(--text-secondary)]">{cat.name}</span>
                      <span className="font-medium">
                        {formatCurrency(cat.value)}
                        <span className="text-[var(--text-muted)] ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: categoryColors[cat.name] || '#64748b',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unnecessary Expenses */}
          <div className="glass-card p-6 border-l-4 border-l-[var(--accent-red)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-[var(--accent-red)]" />
              <h2 className="font-['Outfit'] font-semibold text-lg">Top Unnecessary Expenses</h2>
            </div>
            <ul className="space-y-3">
              {data.unnecessaryExpenses?.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-red)] font-bold mt-0.5">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="glass-card p-6 border-l-4 border-l-[var(--accent-green)]">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-[var(--accent-green)]" />
              <h2 className="font-['Outfit'] font-semibold text-lg">Budget Improvement Suggestions</h2>
            </div>
            <ul className="space-y-3">
              {data.suggestions?.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-green)]">💡</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Score and Prediction Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="glass-card p-6 text-center">
              <h3 className="text-[var(--text-muted)] text-sm mb-3">Financial Health Score</h3>
              <div className="text-5xl font-bold gradient-text mb-2">
                {data.healthScore || health.score}
              </div>
              <p className="text-[var(--text-muted)] text-sm">out of 100</p>
            </div>
            <div className="glass-card p-6 text-center">
              <h3 className="text-[var(--text-muted)] text-sm mb-3">Next Month Prediction</h3>
              <div className="text-5xl font-bold text-[var(--accent-cyan)] mb-2">
                {formatCurrency(data.prediction || Math.round(total * 1.05))}
              </div>
              <p className="text-[var(--text-muted)] text-sm">estimated spending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
