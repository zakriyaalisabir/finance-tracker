/**
 * Local development server for testing API endpoints
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { addAccount, getAccounts, addCategory, getCategories, addTransaction, getSummary, getMonthlyBreakdown, postSubscriptions, addSubscription, getSubscriptions, addNetWorthSnapshot, getNetWorthHistory } from './dynamo';
import { API_ENDPOINTS } from './constants';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock DynamoDB for local development
const mockData = {
  accounts: [] as any[],
  categories: [] as any[],
  transactions: [] as any[],
  subscriptions: [] as any[],
  networth: [] as any[]
};

// Override dynamo functions for local development
const originalAddTransaction = addTransaction;
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

const mockAddAccount = async (account: any) => {
  const item = {
    id: Date.now().toString(),
    ...account,
    createdAt: new Date().toISOString()
  };
  mockData.accounts.push(item);
  return item;
};

const mockGetAccounts = async () => {
  return mockData.accounts;
};

const mockAddCategory = async (category: any) => {
  const item = {
    id: Date.now().toString(),
    ...category,
    createdAt: new Date().toISOString()
  };
  mockData.categories.push(item);
  return item;
};

const mockGetCategories = async () => {
  return mockData.categories;
};

const mockGetSummary = async (start?: string, end?: string) => {
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

// Routes
app.post(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
  try {
    const result = await mockAddAccount(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
  const result = await mockGetAccounts();
  res.json(result);
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
  const result = await mockGetCategories();
  res.json(result);
});

app.post(API_ENDPOINTS.TRANSACTIONS, async (req, res) => {
  try {
    const result = await mockAddTransaction(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.SUMMARY, async (req, res) => {
  const result = await mockGetSummary();
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Local API server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});