const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

exports.getAIInsights = async (req, res) => {
  const { expenses } = req.body;

  if (!expenses || expenses.length === 0) {
    return res.status(400).json({ message: 'No expense data provided' });
  }

  const expenseSummary = expenses.slice(0, 50).map(e => 
    `${e.date}: ${e.category} - ${e.amount} (${e.note || ''})`
  ).join('\n');

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

      Focus on being helpful, direct, and slightly motivating.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "You are a smart financial advisor." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (err) {
    console.error('AI Insight Error:', err);
    res.status(500).json({ message: 'Error generating AI insights' });
  }
};

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
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "You are a behavioral financial expert." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (err) {
    console.error('AI Personality Error:', err);
    res.status(500).json({ message: 'Error detecting personality' });
  }
};

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

  // Immediate Fallback Check for missing or placeholder API Key
  const isInvalidKey = !process.env.OPENAI_API_KEY || 
                       process.env.OPENAI_API_KEY === 'your_openai_api_key_here' || 
                       process.env.OPENAI_API_KEY.startsWith('your_');

  if (isInvalidKey) {
    return res.json({ reply: generateFallbackReply(message, total, categories) });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are ExpenseMind AI, a versatile financial assistant. Use context when relevant, but answer ALL user questions helpfully, even if they aren't strictly about finance. Keep responses professional yet friendly." },
        { role: "system", content: `CONTEXT: ${context}` },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.json({ reply: generateFallbackReply(message, total, categories) });
  }
};

// Helper to provide consistent fallback responses
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
    return "Hello! I'm your ExpenseMind AI assistant. I'm currently running in **optimized local mode**. I can help you with spending totals, saving tips, and budget status!";
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

exports.getPrediction = async (req, res) => {
  const { expenses } = req.body;
  
  // Basic prediction logic if AI fails or to save tokens
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const prediction = Math.round(total * 1.05); // Simple 5% increase prediction

  res.json({ prediction, confidence: 'Medium' });
};
