const request = require('supertest');
const app = require('../src/server'); // Remove stray 'pp'

test('GET /chat/user-chats returns 200', async () => {
  const res = await request(app).get('/api/chat/user-chats');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ status: 'ok' }); 
});