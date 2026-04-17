// Helper functions for expense calculations
export function calculateCategoryTotals(expenses) {
  const totals = {};
  expenses.forEach(exp => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
  });
  return Object.entries(totals).map(([name, value]) => ({ name, value }));
}

export function calculateTotalSpending(expenses) {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

export function calculateFinancialHealthScore(expenses, budget = 22000) {
  const total = calculateTotalSpending(expenses);
  const savingsRate = Math.max(0, ((budget - total) / budget) * 100);
  const categories = calculateCategoryTotals(expenses);
  const topCategory = categories.sort((a, b) => b.value - a.value)[0];
  const diversityScore = Math.min(categories.length * 12, 30);
  const budgetDiscipline = total <= budget ? 35 : Math.max(0, 35 - ((total - budget) / budget) * 50);
  const savingsScore = Math.min(savingsRate * 0.35, 35);
  const score = Math.round(Math.min(100, savingsScore + budgetDiscipline + diversityScore));
  return {
    score,
    savingsRate: savingsRate.toFixed(1),
    topCategory: topCategory?.name || 'N/A',
    topCategoryPercent: total > 0 ? ((topCategory?.value / total) * 100).toFixed(1) : '0',
    totalSpent: total,
    budget,
    isOverBudget: total > budget,
  };
}

export function getSpendingPersonalityLocal(expenses, budget = 22000) {
  const total = calculateTotalSpending(expenses);
  const ratio = total / budget;
  if (ratio < 0.7) {
    return {
      type: 'Saver',
      emoji: '🟢',
      color: '#10b981',
      description: 'You\'re a disciplined saver! You consistently spend well below your budget.',
      suggestion: 'Great job! Consider investing your savings for long-term growth. Look into SIPs or index funds.',
    };
  } else if (ratio <= 1.0) {
    return {
      type: 'Balanced',
      emoji: '⚖️',
      color: '#f59e0b',
      description: 'You maintain a balanced approach between spending and saving.',
      suggestion: 'You\'re on track. Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings.',
    };
  } else {
    return {
      type: 'Spender',
      emoji: '🔴',
      color: '#ef4444',
      description: 'You tend to exceed your budget. You may be an impulsive spender.',
      suggestion: 'Try setting daily spending limits. Unsubscribe from shopping newsletters and use the 24-hour rule before purchases.',
    };
  }
}

export function predictNextMonth(expenses) {
  const total = calculateTotalSpending(expenses);
  const categories = calculateCategoryTotals(expenses);
  const dayOfMonth = new Date().getDate() || 1;
  const dailyAvg = total / dayOfMonth;
  const predicted = Math.round(dailyAvg * 30);
  return {
    predicted,
    dailyAvg: Math.round(dailyAvg),
    riskLevel: predicted > 25000 ? 'High' : predicted > 20000 ? 'Medium' : 'Low',
    topRiskCategory: categories.sort((a, b) => b.value - a.value)[0]?.name || 'N/A',
  };
}

export function getSmartAlerts(expenses, budget = 22000) {
  const alerts = [];
  const total = calculateTotalSpending(expenses);
  const categories = calculateCategoryTotals(expenses);

  if (total > budget) {
    alerts.push({
      type: 'danger',
      icon: '🚨',
      title: 'Budget Exceeded!',
      message: `You've spent ₹${total.toLocaleString()} — that's ₹${(total - budget).toLocaleString()} over your ₹${budget.toLocaleString()} budget.`,
    });
  } else if (total > budget * 0.85) {
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Approaching Budget Limit',
      message: `You've used ${((total / budget) * 100).toFixed(0)}% of your budget. Only ₹${(budget - total).toLocaleString()} remaining.`,
    });
  }

  const foodSpend = categories.find(c => c.name === 'Food');
  if (foodSpend && foodSpend.value > budget * 0.25) {
    alerts.push({
      type: 'warning',
      icon: '🍔',
      title: 'High Food Spending',
      message: `Food accounts for ${((foodSpend.value / total) * 100).toFixed(0)}% of spending. Consider cooking at home.`,
    });
  }

  const shoppingSpend = categories.find(c => c.name === 'Shopping');
  if (shoppingSpend && shoppingSpend.value > budget * 0.2) {
    alerts.push({
      type: 'info',
      icon: '🛍️',
      title: 'Shopping Surge Detected',
      message: `Shopping spending is ₹${shoppingSpend.value.toLocaleString()}. Review if all purchases were necessary.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      icon: '✅',
      title: 'All Good!',
      message: 'Your spending is within healthy limits. Keep it up!',
    });
  }

  return alerts;
}

export function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
