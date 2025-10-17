// language: javascript
// filename: index.test.js
const request = require('supertest');
const express = require('express');
const axios = require('axios');

jest.mock('axios');

const router = require('./index');

const expectedUser = {
  name: "Opeyemi Eesuola",
  email: "eesuolap@gmail.com",
  stack: "NodeJs, Express, MongoDB, PostgreSQL, Prisma"
};

let app;
beforeEach(() => {
  app = express();
  app.use('/', router);
  jest.clearAllMocks();
});

test('GET /me -> success: returns 200 and combined user + catFact JSON', async () => {
  const fakeFact = 'Cats have whiskers to sense nearby objects.';
  axios.get.mockResolvedValue({ data: { text: fakeFact } });

  const res = await request(app).get('/me');

  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/application\/json/);
  expect(res.body).toHaveProperty('status', 'success');
  expect(res.body).toHaveProperty('user');
  expect(res.body.user).toEqual(expectedUser);
  expect(res.body).toHaveProperty('catFact', fakeFact);
  expect(res.body).toHaveProperty('timestamp');
  expect(Number.isNaN(Date.parse(res.body.timestamp))).toBe(false);
  expect(axios.get).toHaveBeenCalledWith('https://catfact.ninja/fact');
});

test('GET /me -> error: external API fails and returns 500 with error payload', async () => {
  const err = new Error('Network Error');
  axios.get.mockRejectedValue(err);

  const res = await request(app).get('/me');

  expect(res.status).toBe(500);
  expect(res.headers['content-type']).toMatch(/application\/json/);
  expect(res.body).toHaveProperty('status', 'error');
  expect(res.body).toHaveProperty('user');
  expect(res.body.user).toEqual(expectedUser);
  expect(res.body).toHaveProperty('fact', 'Could not fetch cat fact at this time.');
  expect(res.body).toHaveProperty('error', 'Network Error');
  expect(res.body).toHaveProperty('timestamp');
  expect(Number.isNaN(Date.parse(res.body.timestamp))).toBe(false);
});