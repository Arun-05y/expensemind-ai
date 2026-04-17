import { useMemo } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { getSmartAlerts, calculateFinancialHealthScore, formatCurrency } from '../utils/helpers';

const alertConfig = {
  danger: {
    icon: XCircle,
    border: 'border-l-[var(--accent-red)]',
    iconColor: 'text-[var(--accent-red)]',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/15 text-red-400',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-[var(--accent-yellow)]',
    iconColor: 'text-[var(--accent-yellow)]',
    bg: 'bg-yellow-500/5',
    badge: 'bg-yellow-500/15 text-yellow-400',
    label: 'Warning',
  },
  info: {
    icon: Info,
    border: 'border-l-[var(--accent-cyan)]',
    iconColor: 'text-[var(--accent-cyan)]',
    bg: 'bg-cyan-500/5',
    badge: 'bg-cyan-500/15 text-cyan-400',
    label: 'Info',
  },
  success: {
    icon: CheckCircle,
    border: 'border-l-[var(--accent-green)]',
    iconColor: 'text-[var(--accent-green)]',
    bg: 'bg-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-400',
    label: 'Healthy',
  },
};

export default function Alerts({ expenses }) {
  const alerts = useMemo(() => getSmartAlerts(expenses), [expenses]);
  const health = useMemo(() => calculateFinancialHealthScore(expenses), [expenses]);

  const criticalCount = alerts.filter(a => a.type === 'danger').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Bell className="text-[var(--accent-yellow)]" size={28} />
            Smart Alerts
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Real-time alerts based on your spending behavior
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {criticalCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-red-500/15 text-red-400 font-medium">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">
              {warningCount} Warning
            </span>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
              All Clear ✅
            </span>
          )}
        </div>
      </div>

      {/* Budget Overview Bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-[var(--text-secondary)]">Budget Usage This Month</span>
          <span className="font-semibold">
            {formatCurrency(health.totalSpent)} / {formatCurrency(health.budget)}
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min((health.totalSpent / health.budget) * 100, 100)}%`,
              background: health.isOverBudget
                ? 'var(--accent-red)'
                : health.totalSpent > health.budget * 0.85
                ? 'var(--accent-yellow)'
                : 'var(--accent-green)',
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-2">
          <span>₹0</span>
          <span className={health.isOverBudget ? 'text-red-400 font-medium' : ''}>
            {((health.totalSpent / health.budget) * 100).toFixed(1)}% used
          </span>
          <span>{formatCurrency(health.budget)}</span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert, i) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`glass-card p-5 border-l-4 ${config.border} ${config.bg} slide-in`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon size={22} className={config.iconColor} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{alert.message}</p>
                </div>
                <span className="text-2xl flex-shrink-0">{alert.icon}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Tips */}
      <div className="glass-card p-6">
        <h2 className="font-['Outfit'] font-semibold text-base mb-4">📋 Alert Thresholds (Auto-monitored)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Budget Exceeded', threshold: '> ₹22,000', status: health.isOverBudget },
            { label: 'Budget Warning', threshold: '> 85% (₹18,700)', status: health.totalSpent > health.budget * 0.85 },
            { label: 'High Food Spend', threshold: '> 25% of budget', status: false },
            { label: 'Shopping Surge', threshold: '> 20% of budget', status: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
              <div>
                <p className="font-medium text-xs">{item.label}</p>
                <p className="text-[var(--text-muted)] text-[11px]">Threshold: {item.threshold}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${item.status ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                {item.status ? '🔴 Triggered' : '✅ OK'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
