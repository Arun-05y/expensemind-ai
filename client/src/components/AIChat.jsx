import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatWithAI } from '../utils/api';
import {
  calculateTotalSpending, calculateCategoryTotals,
  calculateFinancialHealthScore, formatCurrency,
} from '../utils/helpers';

const QUICK_QUESTIONS = [
  'How much have I spent this month?',
  'What is my top spending category?',
  'Am I over my budget?',
  'Give me saving tips',
  'What is my financial health score?',
];

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function AIChat({ expenses }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: `👋 Hi! I'm your **ExpenseMind AI** financial advisor. I've analyzed your ${expenses.length} transactions and I'm ready to help you understand your spending, find savings opportunities, and improve your financial health.\n\nWhat would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await chatWithAI(question, expenses);
      const reply = res.data.reply;
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      // Fallback message if AI fails
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        text: "I'm having trouble connecting right now. Please try again or check your API key." 
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="text-[var(--accent-primary)]" size={28} />
            AI Chat Advisor
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Chat with your personal AI financial assistant
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--accent-green)] bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="pulse-dot" />
          AI Online
        </div>
      </div>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)]
              hover:border-[var(--accent-primary)]/40 hover:text-white transition-all duration-200"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                ${msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]'
                  : 'bg-white/10'
                }`}
            >
              {msg.role === 'assistant' ? <Bot size={17} className="text-white" /> : <User size={17} />}
            </div>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'assistant'
                  ? 'glass-card text-[var(--text-secondary)]'
                  : 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white'
                }`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
            />
          </div>
        ))}

        {typing && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
              <Sparkles size={17} className="text-white" />
            </div>
            <div className="glass-card px-5 py-4 typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-3 flex items-center gap-3 mt-2">
        <input
          id="chat-input"
          type="text"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
          placeholder="Ask about your spending, budget, tips..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={typing}
        />
        <button
          id="chat-send"
          onClick={() => sendMessage()}
          disabled={!input.trim() || typing}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
            bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]
            disabled:opacity-30 hover:opacity-90 hover:scale-105"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}
