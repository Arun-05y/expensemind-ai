// Sample dummy data for demonstration
export const sampleExpenses = [
  { _id: '1', amount: 850, category: 'Food', date: '2026-04-01', note: 'Swiggy order - Biryani', icon: '🍔' },
  { _id: '2', amount: 2200, category: 'Travel', date: '2026-04-02', note: 'Uber rides this week', icon: '✈️' },
  { _id: '3', amount: 1500, category: 'Bills', date: '2026-04-03', note: 'Electricity bill', icon: '💡' },
  { _id: '4', amount: 600, category: 'Food', date: '2026-04-05', note: 'Zomato dinner', icon: '🍔' },
  { _id: '5', amount: 3500, category: 'Shopping', date: '2026-04-06', note: 'Amazon - clothes', icon: '🛍️' },
  { _id: '6', amount: 499, category: 'Entertainment', date: '2026-04-07', note: 'Netflix subscription', icon: '🎬' },
  { _id: '7', amount: 1200, category: 'Health', date: '2026-04-08', note: 'Pharmacy + consultation', icon: '🏥' },
  { _id: '8', amount: 750, category: 'Food', date: '2026-04-10', note: 'Weekend brunch', icon: '🍔' },
  { _id: '9', amount: 4000, category: 'Travel', date: '2026-04-12', note: 'Weekend trip fuel', icon: '✈️' },
  { _id: '10', amount: 299, category: 'Entertainment', date: '2026-04-13', note: 'Spotify premium', icon: '🎬' },
  { _id: '11', amount: 1800, category: 'Bills', date: '2026-04-14', note: 'Internet + mobile recharge', icon: '💡' },
  { _id: '12', amount: 2500, category: 'Shopping', date: '2026-04-15', note: 'Grocery run + extras', icon: '🛍️' },
  { _id: '13', amount: 950, category: 'Food', date: '2026-04-16', note: 'Office lunch + coffee', icon: '🍔' },
  { _id: '14', amount: 600, category: 'Health', date: '2026-04-16', note: 'Gym membership', icon: '🏥' },
  { _id: '15', amount: 350, category: 'Education', date: '2026-04-09', note: 'Udemy course', icon: '📚' },
];

export const monthlyTrendData = [
  { month: 'Nov', amount: 18500, budget: 22000 },
  { month: 'Dec', amount: 26800, budget: 22000 },
  { month: 'Jan', amount: 21200, budget: 22000 },
  { month: 'Feb', amount: 19800, budget: 22000 },
  { month: 'Mar', amount: 23400, budget: 22000 },
  { month: 'Apr', amount: 21603, budget: 22000 },
];

export const categoryColors = {
  Food: '#f59e0b',
  Travel: '#6366f1',
  Bills: '#06b6d4',
  Shopping: '#ec4899',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Education: '#3b82f6',
  Other: '#64748b',
};

export const categoryIcons = {
  Food: '🍔',
  Travel: '✈️',
  Bills: '💡',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Health: '🏥',
  Education: '📚',
  Other: '📦',
};
