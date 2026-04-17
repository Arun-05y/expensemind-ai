# 🧠 ExpenseMind AI - Smart Expense & Budget Advisor

ExpenseMind AI is a premium, full-stack financial assistant that leverages Artificial Intelligence to help you track spending, understand your financial behavior, and optimize your budget.

![ExpenseMind AI Showcase](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200)

## 🚀 Features

- **📊 Dynamic Dashboard**: Real-time spending trends and category-wise breakdown using Recharts.
- **💬 AI Chat Advisor**: A personal financial assistant (powered by GPT-4o) that answers questions about your spending and provides tips.
- **✨ AI Insights**: Automatic detection of unnecessary expenses, budget suggestions, and financial health scoring.
- **🎭 Spending Personality**: Behavioral analysis that classifies you as a "Saver", "Spender", or "Balanced" individual.
- **📈 Predictive Analytics**: AI-driven predictions for next month's spending based on your historical data.
- **🏆 Financial Health Score**: A gamified 0-100 score based on your saving habits and budget adherence.

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS** for modern styling
- **Lucide React** for premium iconography
- **Recharts** for interactive data visualization
- **Axios** for API communication

### Backend (Dual-Stack)
- **Node.js & Express**: Primary API handling and data management.
- **Python & FastAPI**: Specialized AI processing and high-performance endpoints.
- **MongoDB**: Robust NoSQL database for expense storage.
- **OpenAI API**: Powering the core intelligence (GPT-4o).

## 📦 Project Structure

```text
├── client/          # Vite/React Frontend
├── server/          # Node.js/Express Backend (Main)
├── backend/         # Python/FastAPI Backend (AI Optimized)
└── .gitignore       # Root level ignore rules
```

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Running locally or Atlas)

### 2. Backend Setup (Node.js)
```bash
cd server
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_uri
# OPENAI_API_KEY=your_key
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔐 Environment Variables
Make sure to configure your `.env` files in both `server/` and `client/` (if needed) for the connection to work. The system includes a **Smart Lite** mode that works even without an OpenAI key for testing!

## 📄 License
This project is for educational and demo purposes.

---
Built with ❤️ by Arun
