import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import AIInsights from './components/AIInsights';
import SpendingPersonality from './components/SpendingPersonality';
import Predictions from './components/Predictions';
import HealthScore from './components/HealthScore';
import AIChat from './components/AIChat';
import ExportData from './components/ExportData';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { sampleExpenses, monthlyTrendData } from './data/sampleData';
import { getExpenses, addExpense } from './utils/api';
import { auth } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExpenses();
      if (res.data && res.data.length > 0) {
        setExpenses(res.data);
      } else {
        setExpenses(sampleExpenses);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setExpenses(sampleExpenses);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchExpenses();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchExpenses]);

  const handleAddExpense = useCallback(async (expenseData) => {
    try {
      const res = await addExpense(expenseData);
      setExpenses(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Error adding expense:', err);
      const newExpense = {
        ...expenseData,
        _id: Date.now().toString(),
      };
      setExpenses(prev => [newExpense, ...prev]);
    }
  }, []);

  if (!user && !loading) {
    return <Login setUser={setUser} />;
  }

  const renderContent = () => {
    if (loading && expenses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="pulse-dot w-6 h-6" />
          <p className="text-[var(--text-muted)] animate-pulse">Loading your financial data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard expenses={expenses} monthlyTrend={monthlyTrendData} />;
      case 'add': return <AddExpense onAdd={handleAddExpense} />;
      case 'insights': return <AIInsights expenses={expenses} />;
      case 'personality': return <SpendingPersonality expenses={expenses} />;
      case 'predict': return <Predictions expenses={expenses} />;
      case 'health': return <HealthScore expenses={expenses} />;
      case 'chat': return <AIChat expenses={expenses} />;
      case 'export': return <ExportData expenses={expenses} />;
      default: return <Dashboard expenses={expenses} monthlyTrend={monthlyTrendData} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main className="flex-1 transition-all duration-300 lg:ml-[260px]" style={{ minHeight: '100vh' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-8">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
