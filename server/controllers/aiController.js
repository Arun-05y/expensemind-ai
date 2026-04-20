const { GoogleGenerativeAI } = require('@google/generative-ai');
const { LRUCache } = require('lru-cache');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini with System Instructions and JSON mode
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are ExpenseMind AI, a premium financial advisor. You always return responses in strict JSON format. No markdown, no extra text.",
  generationConfig: { responseMimeType: "application/json" }
});

// Initialize Cache - 100 items capacity, 1 hour TTL
const aiCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60,
});

const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

/**
 * Generates AI-driven financial insights based on user expense data.
 * @param {Object} req - Express request object containing expenses in body.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Sends JSON response with insights.
 */
exports.getAIInsights = async (req, res) => {
  const { expenses } = req.body;

  if (!expenses || expenses.length === 0) {
    return res.status(400).json({ message: 'No expense data provided' });
  }

  // Generate a unique cache key based on expense summary
  const expenseSummary = expenses.slice(0, 50).map(e => 
    `${e.date}: ${e.category} - ${e.amount} (${e.note || ''})`
  ).join('\n');
  
  const cacheKey = `insights_${Buffer.from(expenseSummary).toString('base64').substring(0, 50)}`;
  if (aiCache.has(cacheKey)) {
    return res.json(aiCache.get(cacheKey));
  }

  try {
    const prompt = `
      Analyze the following expense data for this month:
      ${expenseSummary}

      Provide your analysis in EXACTLY the following JSON format:
      {
        "summary": "Short paragraph summary of spending patterns",
        "unnecessaryExpenses": ["array of 3 specific unnecessary expense types or items found"],
        "suggestions": ["array of 4 smart budget improvement suggestions"],
        "healthScore": 0-100 number,
        "prediction": expected amount for next month as a number
      }

      Focus on being helpful, direct, and slightly motivating. Return ONLY the JSON. No markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);
    
    aiCache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('AI Insight Error:', err);
    res.status(500).json({ 
      message: 'Error generating AI insights',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Detects user's spending personality based on category breakdown.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getSpendingPersonality = async (req, res) => {
  const { expenses } = req.body;
  
  if (!expenses || expenses.length === 0) {
    return res.status(400).json({ message: 'No expense data provided' });
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categories = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const cacheKey = `personality_${JSON.stringify(categories)}`;
  if (aiCache.has(cacheKey)) return res.json(aiCache.get(cacheKey));

  try {
    const prompt = `
      Based on this data for this month:
      Total Spent: ${totalSpent}
      Category Breakdown: ${JSON.stringify(categories)}
      
      Classify the user as one of: "Saver", "Spender", "Balanced".
      Provide the response in EXACTLY this JSON format:
      {
        "type": "Saver/Spender/Balanced",
        "color": "hex_color_code",
        "emoji": "appropriate_emoji",
        "description": "A short paragraph description of why they fit this category",
        "suggestion": "A single powerful behavioral suggestion based on their pattern"
      }
      Return ONLY the JSON. No markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);

    aiCache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('AI Personality Error:', err);
    res.status(500).json({ message: 'Error detecting personality' });
  }
};

/**
 * Interactive chat assistant for financial queries.
 * @param {Object} req - Express request object with message and expenses context.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
exports.chatWithAI = async (req, res) => {
  const { message, expenses } = req.body;

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const categories = expenses?.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {}) || {};

  const context = expenses 
    ? `User's current total spent: ${total}. Top categories: ${JSON.stringify(categories)}. Recent transactions: ${JSON.stringify(expenses.slice(0, 10))}` 
    : "No expense data available.";

  // API Key validation
  const isInvalidKey = !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY;

  if (isInvalidKey) {
    return res.json({ reply: generateFallbackReply(message, total, categories) });
  }

  try {
    const fullPrompt = `System: You are ExpenseMind AI, a versatile financial assistant. 
    CONTEXT: ${context}
    User Message: ${message}
    Answer helpfully, professionally yet friendly.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.json({ reply: generateFallbackReply(message, total, categories) });
  }
};

/**
 * Fallback mechanism for basic financial queries when AI is unavailable.
 * @param {string} message - User query.
 * @param {number} total - Total expenses.
 * @param {Object} categories - Category-wise breakdown.
 * @returns {string} - Response string.
 */
function generateFallbackReply(message, total, categories) {
  const msg = (message || "").toLowerCase();
  
  if (msg.includes('spent') || msg.includes('much') || msg.includes('total')) {
    let reply = `You've spent a total of **${formatCurrency(total)}** this month. `;
    const topCat = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
    if (topCat) reply += `Your highest spending is on **${topCat[0]}** (${formatCurrency(topCat[1])}).`;
    return reply;
  } 
  
  if (msg.includes('save') || msg.includes('tip')) {
    return "Based on your data, here's a smart tip: **Cut your " + (Object.keys(categories)[0] || 'top') + " spending by 15%** this week to save significantly by month-end. Also, try the 48-hour rule for non-essential shopping!";
  } 
  
  if (msg.includes('hello') || msg.includes('hi')) {
    return "Hello! I'm your ExpenseMind AI assistant. I'm currently running in **optimized mode**. I can help you with spending totals, saving tips, and budget status!";
  } 
  
  if (msg.includes('budget')) {
    const budget = 22000;
    const remaining = budget - total;
    return remaining > 0 
      ? `You're doing great! You have **${formatCurrency(remaining)}** left in your ₹22,000 monthly budget.`
      : `⚠️ You are over your ₹22,000 budget by **${formatCurrency(Math.abs(remaining))}**. Consider pausing non-essential spending.`;
  }
  
  return "I'm currently in **Smart Lite** mode. I can tell you about your **total spent**, **budget status**, or give you **saving tips**. What would you like to check first?";
}

/**
 * Simple predictive logic for future spending.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 * @returns {void}
 */
exports.getPrediction = async (req, res) => {
  const { expenses } = req.body;
  if (!expenses) return res.status(400).json({ message: "No data" });
  
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const prediction = Math.round(total * 1.05);

  res.json({ prediction, confidence: 'Medium' });
};

