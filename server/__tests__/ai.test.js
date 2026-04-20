const request = require('supertest');
const express = require('express');
const aiRoutes = require('../routes/aiRoutes');

// Mock dependencies if needed, but here we test the logic flow
const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

describe('AI Routes & Logic', () => {
  const mockExpenses = [
    { date: '2026-04-01', category: 'Food', amount: 500, note: 'Dinner' },
    { date: '2026-04-02', category: 'Transport', amount: 100, note: 'Taxi' }
  ];

  test('POST /api/ai/insights - 400 when empty body', async () => {
    const res = await request(app).post('/api/ai/insights').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('No expense data provided');
  });

  test('POST /api/ai/personality - 400 when empty body', async () => {
    const res = await request(app).post('/api/ai/personality').send({});
    expect(res.statusCode).toEqual(400);
  });

  test('POST /api/ai/predict - Returns prediction based on math', async () => {
    const res = await request(app).post('/api/ai/predict').send({ expenses: mockExpenses });
    expect(res.statusCode).toEqual(200);
    expect(res.body.prediction).toBeGreaterThan(600); // 600 * 1.05 = 630
    expect(res.body.confidence).toBe('Medium');
  });

  test('POST /api/ai/chat - Fallback mechanism', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'total spent', expenses: mockExpenses });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toContain('₹600');
  });

  test('POST /api/ai/chat - Save tip fallback', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'give me a save tip', expenses: mockExpenses });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toContain('48-hour rule');
  });

  test('POST /api/ai/chat - Budget status fallback', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'how is my budget', expenses: mockExpenses });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.reply).toContain('22,000');
  });
});
