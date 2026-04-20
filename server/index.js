const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const expenseRoutes = require('./routes/expenseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier dev/demo if needed, or configure properly
}));
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

// Static File Serving
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Handle SPA routing
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return res.status(404).json({ message: 'API endpoint not found' });
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('ExpenseMind AI Backend is running... (Frontend build not found)');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
