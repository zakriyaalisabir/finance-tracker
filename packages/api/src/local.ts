/**
 * Local development server for testing API endpoints
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
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

const mockGetTransactions = async (start?: string, end?: string) => {
  let filtered = mockData.transactions;
  if (start || end) {
    filtered = mockData.transactions.filter(tx => {
      const txDate = tx.date;
      if (start && txDate < start) return false;
      if (end && txDate > end) return false;
      return true;
    });
  }
  return filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
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
  // Reset all mock data to empty arrays
  mockData.accounts = [];
  mockData.categories = [];
  mockData.transactions = [];
  mockData.subscriptions = [];
  mockData.networth = [];
  
  res.json({ 
    success: true, 
    message: 'All data reset to zero',
    data: mockData 
  });
});

// Webhook endpoints
app.post('/webhooks/twilio', express.urlencoded({ extended: false }), async (req, res) => {
  const body = req.body;
  const from = body.From;
  const text = (body.Body || '').trim().toUpperCase();

  if (text.startsWith('PAID')) {
    const maybeName = text.replace(/^PAID/, '').trim();
    let sub;
    if (maybeName) {
      sub = mockData.subscriptions.find(s => 
        s.channel === 'whatsapp' && 
        s.contact?.includes(from.replace('whatsapp:', '')) &&
        s.name.toLowerCase().includes(maybeName.toLowerCase())
      );
    } else {
      sub = mockData.subscriptions.find(s => 
        s.channel === 'whatsapp' && 
        s.contact?.includes(from.replace('whatsapp:', ''))
      );
    }
    if (sub) {
      const payment = {
        id: Date.now().toString(),
        subscriptionId: sub.id,
        amount: sub.amount,
        paidAt: new Date().toISOString()
      };
      console.log('Payment recorded:', payment);
    }
  }
  res.status(200).end();
});

function validateLineSignature(rawBody: string, signature: string) {
  const secret = process.env.LINE_CHANNEL_SECRET || 'test-secret';
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  return hmac === signature;
}

app.post('/webhooks/line', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.header('x-line-signature') || '';
  if (!validateLineSignature(req.body.toString(), signature)) {
    return res.status(401).send('Bad signature');
  }

  const payload = JSON.parse(req.body.toString());
  const events = payload.events || [];

  for (const ev of events) {
    if (ev.type === 'message' && ev.message?.type === 'text') {
      const text = ev.message.text.trim().toUpperCase();
      const userId = ev.source.userId;
      if (text.startsWith('PAID')) {
        const maybeName = text.replace(/^PAID/, '').trim();
        let sub;
        if (maybeName) {
          sub = mockData.subscriptions.find(s => 
            s.channel === 'line' && 
            s.contact === userId &&
            s.name.toLowerCase().includes(maybeName.toLowerCase())
          );
        } else {
          sub = mockData.subscriptions.find(s => 
            s.channel === 'line' && 
            s.contact === userId
          );
        }
        if (sub) {
          const payment = {
            id: Date.now().toString(),
            subscriptionId: sub.id,
            amount: sub.amount,
            paidAt: new Date().toISOString()
          };
          console.log('Payment recorded:', payment);
        }
      }
    }
  }
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/webhooks/twilio`);
  console.log(`📱 LINE webhook: http://localhost:${PORT}/webhooks/line`);
});