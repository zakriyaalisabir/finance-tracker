import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { API_ENDPOINTS } from '../constants';

const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  const mockData = {
    accounts: [] as any[],
    categories: [] as any[],
    transactions: [] as any[]
  };

  const mockAddAccount = async (account: any) => {
    const item = { id: Date.now().toString(), ...account, createdAt: new Date().toISOString() };
    mockData.accounts.push(item);
    return item;
  };

  const mockAddCategory = async (category: any) => {
    const item = { id: Date.now().toString(), ...category, createdAt: new Date().toISOString() };
    mockData.categories.push(item);
    return item;
  };

  const mockAddTransaction = async (tx: any) => {
    const item = {
      id: Date.now().toString(),
      ...tx,
      amount: Number(tx.amount),
      monthSheet: `Transactions-${tx.date.substring(0, 7)}`,
      createdAt: new Date().toISOString()
    };
    mockData.transactions.push(item);
    return item;
  };

  const mockGetTransactions = async (start?: string, end?: string) => {
    let filtered = mockData.transactions;
    if (start || end) {
      filtered = mockData.transactions.filter(tx => {
        if (start && tx.date < start) return false;
        if (end && tx.date > end) return false;
        return true;
      });
    }
    return filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  };

  const mockGetSummary = async () => {
    let inflow = 0, outflow = 0, byCcy: Record<string, { inflow: number; outflow: number }> = {};
    for (const tx of mockData.transactions) {
      const amt = tx.amount;
      const ccy = tx.currency || 'THB';
      if (!byCcy[ccy]) byCcy[ccy] = { inflow: 0, outflow: 0 };
      if (amt >= 0) { inflow += amt; byCcy[ccy].inflow += amt; }
      else { outflow += amt; byCcy[ccy].outflow += amt; }
    }
    return { inflow, outflow, net: inflow + outflow, byCcy };
  };

  app.post(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
    try {
      const result = await mockAddAccount(req.body);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  });

  app.get(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
    res.json(mockData.accounts);
  });

  app.post(API_ENDPOINTS.CATEGORIES, async (req, res) => {
    try {
      const result = await mockAddCategory(req.body);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  });

  app.get(API_ENDPOINTS.CATEGORIES, async (req, res) => {
    res.json(mockData.categories);
  });

  app.post(API_ENDPOINTS.TRANSACTIONS, async (req, res) => {
    try {
      const result = await mockAddTransaction(req.body);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  });

  app.get(API_ENDPOINTS.TRANSACTIONS, async (req, res) => {
    const { start, end } = req.query as { start?: string; end?: string };
    const result = await mockGetTransactions(start, end);
    res.json(result);
  });

  app.get(API_ENDPOINTS.SUMMARY, async (req, res) => {
    const result = await mockGetSummary();
    res.json(result);
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Local API server running' });
  });

  app.post('/reset', (req, res) => {
    mockData.accounts = [];
    mockData.categories = [];
    mockData.transactions = [];
    res.json({ success: true, message: 'All data reset to zero', data: mockData });
  });

  return { app, mockData };
};

describe('API Endpoints', () => {
  let app: express.Application;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
  });

  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK', message: 'Local API server running' });
  });

  it('should create and get accounts', async () => {
    const account = { name: 'Test Account', currency: 'USD' };
    const createResponse = await request(app).post(API_ENDPOINTS.ACCOUNTS).send(account);
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.success).toBe(true);

    const getResponse = await request(app).get(API_ENDPOINTS.ACCOUNTS);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveLength(1);
  });

  it('should create and get categories', async () => {
    const category = { name: 'Food', monthlyBudget: 500, budgetCurrency: 'THB' };
    const createResponse = await request(app).post(API_ENDPOINTS.CATEGORIES).send(category);
    expect(createResponse.status).toBe(200);

    const getResponse = await request(app).get(API_ENDPOINTS.CATEGORIES);
    expect(getResponse.body).toHaveLength(1);
    expect(getResponse.body[0].monthlyBudget).toBe(500);
  });

  it('should create and get transactions', async () => {
    const transaction = { date: '2024-01-15', account: 'Test', category: 'Food', amount: 100, currency: 'USD', receiptPhoto: 'receipt.jpg' };
    await request(app).post(API_ENDPOINTS.TRANSACTIONS).send(transaction);

    const response = await request(app).get(API_ENDPOINTS.TRANSACTIONS);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].monthSheet).toBe('Transactions-2024-01');
    expect(response.body[0].receiptPhoto).toBe('receipt.jpg');
  });

  it('should filter transactions by date', async () => {
    await request(app).post(API_ENDPOINTS.TRANSACTIONS).send({ date: '2024-01-15', account: 'Test', category: 'Food', amount: 100, currency: 'USD', receiptPhoto: 'jan.jpg' });
    await request(app).post(API_ENDPOINTS.TRANSACTIONS).send({ date: '2024-02-15', account: 'Test', category: 'Food', amount: 200, currency: 'USD', receiptPhoto: 'feb.jpg' });

    const response = await request(app).get(API_ENDPOINTS.TRANSACTIONS).query({ start: '2024-01-01', end: '2024-01-31' });
    expect(response.body).toHaveLength(1);
    expect(response.body[0].amount).toBe(100);
    expect(response.body[0].receiptPhoto).toBe('jan.jpg');
  });

  it('should calculate summary', async () => {
    await request(app).post(API_ENDPOINTS.TRANSACTIONS).send({ date: '2024-01-15', account: 'Test', category: 'Food', amount: 100, currency: 'USD', receiptPhoto: 'income.jpg' });
    await request(app).post(API_ENDPOINTS.TRANSACTIONS).send({ date: '2024-01-16', account: 'Test', category: 'Food', amount: -50, currency: 'USD', receiptPhoto: 'expense.jpg' });

    const response = await request(app).get(API_ENDPOINTS.SUMMARY);
    expect(response.body.inflow).toBe(100);
    expect(response.body.outflow).toBe(-50);
    expect(response.body.net).toBe(50);
  });

  it('should reset data', async () => {
    await request(app).post(API_ENDPOINTS.ACCOUNTS).send({ name: 'Test', currency: 'USD' });
    const response = await request(app).post('/reset');
    expect(response.body.success).toBe(true);

    const accountsResponse = await request(app).get(API_ENDPOINTS.ACCOUNTS);
    expect(accountsResponse.body).toHaveLength(0);
  });

  it('should handle errors in account creation', async () => {
    // Create app with error-throwing mock
    const errorApp = express();
    errorApp.use(cors());
    errorApp.use(bodyParser.json());
    
    errorApp.post(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
      try {
        throw new Error('Database error');
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });
    
    const response = await request(errorApp).post(API_ENDPOINTS.ACCOUNTS).send({ name: 'Test' });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database error');
  });
  
  it('should handle non-Error exceptions', async () => {
    const errorApp = express();
    errorApp.use(cors());
    errorApp.use(bodyParser.json());
    
    errorApp.post(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
      try {
        throw 'String error';
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });
    
    const response = await request(errorApp).post(API_ENDPOINTS.ACCOUNTS).send({ name: 'Test' });
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Unknown error');
  });
});