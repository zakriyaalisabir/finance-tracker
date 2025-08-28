import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { addAccount, getAccounts, addCategory, getCategories, addTransaction, getSummary, getMonthlyBreakdown, postSubscriptions, addSubscription, getSubscriptions, addNetWorthSnapshot, getNetWorthHistory } from './dynamo';
import { startScheduler } from './scheduler';
import { API_ENDPOINTS, ENVIRONMENT_VARIABLES } from './constants';

const app = express();
app.use(bodyParser.json());

if (process.env[ENVIRONMENT_VARIABLES.AWS_LAMBDA_FUNCTION_NAME]) {
  startScheduler();
}

app.post(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
  try {
    const result = await addAccount(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.ACCOUNTS, async (req, res) => {
  const result = await getAccounts();
  res.json(result);
});

app.post(API_ENDPOINTS.CATEGORIES, async (req, res) => {
  try {
    const result = await addCategory(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.CATEGORIES, async (req, res) => {
  const result = await getCategories();
  res.json(result);
});

app.post(API_ENDPOINTS.TRANSACTIONS, async (req, res) => {
  try {
    const result = await addTransaction(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.SUMMARY, async (req, res) => {
  const { start, end } = req.query as { start?: string; end?: string };
  const result = await getSummary(start, end);
  res.json(result);
});

app.get(`${API_ENDPOINTS.BREAKDOWN}/:month`, async (req, res) => {
  const result = await getMonthlyBreakdown(req.params.month);
  res.json(result);
});

app.post(API_ENDPOINTS.SUBSCRIPTIONS, async (req, res) => {
  try {
    const result = await addSubscription(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.SUBSCRIPTIONS, async (req, res) => {
  const result = await getSubscriptions();
  res.json(result);
});

app.post(API_ENDPOINTS.SUBSCRIPTIONS_POST, async (req, res) => {
  const result = await postSubscriptions();
  res.json(result);
});

app.post(API_ENDPOINTS.NETWORTH, async (req, res) => {
  try {
    const result = await addNetWorthSnapshot(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get(API_ENDPOINTS.NETWORTH, async (req, res) => {
  const result = await getNetWorthHistory();
  res.json(result);
});

export const handler = serverless(app);
