const request = require('supertest');
const express = require('express');
const aiRoutes = require('../routes/aiRoutes');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

describe('AI Routes', () => {
  test('POST /api/ai/insights should return 400 if no expenses provided', async () => {
    const res = await request(app)
      .post('/api/ai/insights')
      .send({});
    expect(res.statusCode).toEqual(400);
  });

  test('POST /api/ai/chat should return a fallback reply if API key is missing', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'hello', expenses: [] });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('reply');
  });
});
