import { useState } from 'react';
import { PlusCircle, Sparkles, Tag, IndianRupee, Calendar, FileText } from 'lucide-react';
import { categoryIcons } from '../data/sampleData';

const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

// Simple AI-like auto-categorization based on keywords
function autoCategorize(note) {
  const lower = (note || '').toLowerCase();
  if (/food|swiggy|zomato|restaurant|biryani|pizza|lunch|dinner|breakfast|coffee|brunch|meal/i.test(lower)) return 'Food';
  if (/uber|ola|fuel|petrol|flight|train|bus|cab|trip|travel/i.test(lower)) return 'Travel';
  if (/electricity|internet|wifi|recharge|water|gas|rent|bill|dth/i.test(lower)) return 'Bills';
  if (/amazon|flipkart|shopping|clothes|shoes|grocery|myntra/i.test(lower)) return 'Shopping';
  if (/netflix|spotify|movie|game|concert|entertainment|prime|hotstar/i.test(lower)) return 'Entertainment';
  if (/doctor|hospital|medicine|pharmacy|gym|health|dental|medical/i.test(lower)) return 'Health';
  if (/course|udemy|book|school|college|coaching|education|tuition/i.test(lower)) return 'Education';
  return 'Other';
}

export default function AddExpense({ onAdd }) {
  const [form, setForm] = useState({ amount: '', category: '', date: new Date().toISOString().split('T')[0], note: '' });
  const [aiSuggested, setAiSuggested] = useState('');
  const [success, setSuccess] = useState(false);

  const handleNoteChange = (e) => {
    const note = e.target.value;
    setForm(f => ({ ...f, note }));
    const suggested = autoCategorize(note);
    if (suggested !== 'Other') {
      setAiSuggested(suggested);
      setForm(f => ({ ...f, category: f.category || suggested }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;
    onAdd({
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
      note: form.note,
      icon: categoryIcons[form.category] || '📦',
    });
    setForm({ amount: '', category: '', date: new Date().toISOString().split('T')[0], note: '' });
    setAiSuggested('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold">Add Expense</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">Record a new transaction with AI-powered categorization</p>
      </div>

      {success && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 slide-in">
          <span className="text-xl">✅</span>
          <span className="font-medium text-sm">Expense added successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-5">
        {/* Amount */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
            <IndianRupee size={14} /> Amount
          </label>
          <input
            id="expense-amount"
            type="number"
            className="input-field text-2xl font-bold"
            placeholder="0"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            min="1"
            required
          />
        </div>

        {/* Note with AI */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
            <FileText size={14} /> Note / Description
          </label>
          <input
            id="expense-note"
            type="text"
            className="input-field"
            placeholder="e.g., Swiggy dinner order, Uber ride..."
            value={form.note}
            onChange={handleNoteChange}
          />
          {aiSuggested && (
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--accent-primary)]">
              <Sparkles size={13} />
              <span>AI suggests: <strong>{aiSuggested}</strong></span>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Tag size={14} /> Category
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                id={`category-${cat.toLowerCase()}`}
                onClick={() => setForm(f => ({ ...f, category: cat }))}
                className={`p-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1
                  ${form.category === cat
                    ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-white'
                    : 'bg-white/[0.03] border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.06]'
                  }`}
              >
                <span className="text-lg">{categoryIcons[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Calendar size={14} /> Date
          </label>
          <input
            id="expense-date"
            type="date"
            className="input-field"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
        </div>

        {/* Submit */}
        <button id="add-expense-submit" type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
          <PlusCircle size={18} />
          Add Expense
        </button>
      </form>
    </div>
  );
}
