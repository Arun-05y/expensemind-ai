import { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Brain,
  MessageCircle,
  Bell,
  Target,
  TrendingUp,
  Heart,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add', label: 'Add Expense', icon: PlusCircle },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'personality', label: 'Personality', icon: Sparkles },
  { id: 'predict', label: 'Predictions', icon: TrendingUp },
  { id: 'health', label: 'Health Score', icon: Heart },
  { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        id="mobile-menu-toggle"
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[var(--bg-secondary)] border-r border-[var(--border-color)]
          flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[var(--border-color)]">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'var(--gradient-1)' }}>
            <Brain size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div className="fade-in">
              <h1 className="font-['Outfit'] font-bold text-base leading-tight">
                ExpenseMind
              </h1>
              <span className="text-[11px] text-[var(--text-muted)] tracking-wider uppercase">
                AI Advisor
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-transparent text-white border-l-2 border-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                  }`}
                title={item.label}
              >
                <Icon size={19} className={isActive ? 'text-[var(--accent-primary)]' : ''} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto pulse-dot" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          id="sidebar-collapse-toggle"
          className="hidden lg:flex items-center justify-center py-4 border-t border-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Target size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </button>
      </aside>
    </>
  );
}
