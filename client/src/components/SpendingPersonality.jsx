import { useMemo, useState, useEffect } from 'react';
import { Sparkles, User, ArrowRight, Shield, Zap, Coins, Loader } from 'lucide-react';
import { getSpendingPersonality } from '../utils/api';
import {
  getSpendingPersonalityLocal, calculateTotalSpending,
  calculateCategoryTotals, formatCurrency,
} from '../utils/helpers';

const personalityDetails = {
  Saver: {
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bgGlow: 'rgba(16, 185, 129, 0.08)',
    icon: Shield,
    traits: ['Budget-conscious', 'Long-term planner', 'Value-driven purchases'],
    tips: [
      'Explore investment options like mutual funds or SIPs',
      'Build a 6-month emergency fund if you haven\'t already',
      'Consider investing in experiences over material goods',
      'Your discipline is rare — use it to build wealth',
    ],
  },
  Balanced: {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    bgGlow: 'rgba(245, 158, 11, 0.08)',
    icon: Coins,
    traits: ['Moderate spending', 'Flexible budgeter', 'Occasional treats'],
    tips: [
      'Automate 20% of income into savings before spending',
      'Set specific budgets per category to avoid drift',
      'Track weekly instead of monthly for better control',
      'Your balance is great — just stay consistent',
    ],
  },
  Spender: {
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    bgGlow: 'rgba(239, 68, 68, 0.08)',
    icon: Zap,
    traits: ['Impulse buyer', 'Lifestyle-focused', 'Convenience-driven'],
    tips: [
      'Implement the 24-hour rule before any purchase over ₹500',
      'Set daily spending limits of ₹700 to stay in control',
      'Unsubscribe from shopping newsletters and delete cart apps',
      'Use cash instead of cards for discretionary spending',
    ],
  },
};

export default function SpendingPersonality({ expenses }) {
  const [aiPersonality, setAiPersonality] = useState(null);
  const [loading, setLoading] = useState(false);

  const localPersonality = useMemo(() => getSpendingPersonalityLocal(expenses), [expenses]);
  
  const personality = aiPersonality || localPersonality;

  useEffect(() => {
    const fetchPersonality = async () => {
      if (expenses.length < 5) return;
      setLoading(true);
      try {
        const res = await getSpendingPersonality(expenses);
        setAiPersonality(res.data);
      } catch (err) {
        console.error('Error fetching AI personality:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonality();
  }, [expenses]);

  const total = useMemo(() => calculateTotalSpending(expenses), [expenses]);
  const categories = useMemo(() => calculateCategoryTotals(expenses), [expenses]);
  const details = personalityDetails[personality.type] || personalityDetails.Balanced;
  const Icon = details.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Sparkles className="text-[var(--accent-secondary)]" size={28} />
              Spending Personality
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">
              AI-detected behavioral pattern based on your spending data
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--accent-primary)] animate-pulse">
              <Loader size={14} className="animate-spin" />
              <span>Analyzing habits...</span>
            </div>
          )}
        </div>

      {/* Main Personality Card */}
      <div
        className="glass-card p-8 text-center relative overflow-hidden"
        style={{ background: details.bgGlow }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20"
          style={{ background: details.gradient }}
        />

        <div className="relative z-10">
          <div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-5"
            style={{ background: details.gradient }}
          >
            <span className="text-4xl">{personality.emoji}</span>
          </div>

          <h2 className="font-['Outfit'] text-3xl font-bold mb-2">
            You are a{' '}
            <span style={{ color: personality.color }}>{personality.type}</span>
          </h2>

          <p className="text-[var(--text-secondary)] max-w-lg mx-auto text-sm leading-relaxed">
            {personality.description}
          </p>

          {/* Traits */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {details.traits.map((trait, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  borderColor: personality.color + '40',
                  color: personality.color,
                  background: personality.color + '10',
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-[var(--text-muted)] text-xs mb-1">Total Spent</p>
          <p className="text-xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-[var(--text-muted)] text-xs mb-1">Categories</p>
          <p className="text-xl font-bold">{categories.length}</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-[var(--text-muted)] text-xs mb-1">Budget Usage</p>
          <p className="text-xl font-bold" style={{ color: personality.color }}>
            {((total / 22000) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* AI Suggestion */}
      <div
        className="glass-card p-6 border-l-4"
        style={{ borderLeftColor: personality.color }}
      >
        <div className="flex items-center gap-2 mb-3">
          <User size={18} style={{ color: personality.color }} />
          <h3 className="font-['Outfit'] font-semibold text-lg">Behavioral Suggestion</h3>
        </div>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          {personality.suggestion}
        </p>
      </div>

      {/* Tips */}
      <div className="glass-card p-6">
        <h3 className="font-['Outfit'] font-semibold text-lg mb-4">
          Personalized Tips for {personality.type}s
        </h3>
        <div className="space-y-3">
          {details.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
              <ArrowRight size={14} className="mt-1 flex-shrink-0" style={{ color: personality.color }} />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
