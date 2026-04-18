import { signInWithGoogle } from '../utils/firebase';
import { LogIn } from 'lucide-react';

export default function Login({ setUser }) {
  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] px-4">
      <div className="glass-card max-w-md w-full p-10 flex flex-col items-center gap-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-4xl text-white">💰</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">ExpenseMind AI</h1>
          <p className="text-[var(--text-secondary)]">Master your finances with smart AI insights</p>
        </div>

        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all border border-gray-100 group w-full justify-center"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>

        <p className="text-xs text-[var(--text-muted)] max-w-[280px]">
          By continuing, you agree to allow ExpenseMind AI to help you track and optimize your spending.
        </p>
      </div>
    </div>
  );
}
