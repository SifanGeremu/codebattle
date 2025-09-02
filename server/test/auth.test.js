import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import { initDatabase } from '../database/init.js';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    initDatabase();
  });

  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.username).toBe(userData.username);
  });

  it('should not register user with existing email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    };

    // Register first user
    await request(app)
      .post('/auth/register')
      .send(userData);

    // Try to register with same email
    const response = await request(app)
      .post('/auth/register')
      .send({
        ...userData,
        username: 'different'
      })
      .expect(400);

    expect(response.body.message).toBe('User already exists');
  });

  it('should login with valid credentials', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser'
    };

    // Register user first
    await request(app)
      .post('/auth/register')
      .send(userData);

    // Login
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(userData.email);
  });

  it('should not login with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid credentials');
  });
});