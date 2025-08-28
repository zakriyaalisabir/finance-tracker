import AWS from 'aws-sdk';
import { Transaction, Subscription, NetWorthSnapshot, Summary, MonthlyBreakdown, Account, Category, DEFAULT_CURRENCY, CATEGORIES, INDEX_NAMES, TABLE_NAMES } from '@finance-tracker/shared';
import { ENVIRONMENT_VARIABLES } from './constants';

const dynamo = new AWS.DynamoDB.DocumentClient();

const ACCOUNTS_TABLE = process.env[ENVIRONMENT_VARIABLES.ACCOUNTS_TABLE] || TABLE_NAMES.ACCOUNTS;
const CATEGORIES_TABLE = process.env[ENVIRONMENT_VARIABLES.CATEGORIES_TABLE] || TABLE_NAMES.CATEGORIES;

/**
 * Adds a new account
 * @param account - Account data without id or createdAt
 * @returns Promise resolving to the created account
 */
export async function addAccount(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
  const item = {
    id: Date.now().toString(),
    ...account,
    createdAt: new Date().toISOString()
  };
  await dynamo.put({ TableName: ACCOUNTS_TABLE, Item: item }).promise();
  return item;
}

/**
 * Gets all accounts
 * @returns Promise resolving to list of accounts
 */
export async function getAccounts(): Promise<Account[]> {
  const data = await dynamo.scan({ TableName: ACCOUNTS_TABLE }).promise();
  return (data.Items || []) as Account[];
}

/**
 * Adds a new category
 * @param category - Category data without id or createdAt
 * @returns Promise resolving to the created category
 */
export async function addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const item = {
    id: Date.now().toString(),
    ...category,
    createdAt: new Date().toISOString()
  };
  await dynamo.put({ TableName: CATEGORIES_TABLE, Item: item }).promise();
  return item;
}

/**
 * Gets all categories
 * @returns Promise resolving to list of categories
 */
export async function getCategories(): Promise<Category[]> {
  const data = await dynamo.scan({ TableName: CATEGORIES_TABLE }).promise();
  return (data.Items || []) as Category[];
}

/**
 * Gets transactions with optional date filtering
 * @param start - Start date filter (YYYY-MM-DD)
 * @param end - End date filter (YYYY-MM-DD)
 * @returns Promise resolving to list of transactions
 */
export async function getTransactions(start?: string, end?: string): Promise<Transaction[]> {
  let params: any = { TableName: TRANSACTIONS_TABLE };
  
  if (start || end) {
    params.IndexName = INDEX_NAMES.DATE_INDEX;
    params.KeyConditionExpression = '#date BETWEEN :start AND :end';
    params.ExpressionAttributeNames = { '#date': 'date' };
    params.ExpressionAttributeValues = {
      ':start': start || '1900-01-01',
      ':end': end || '2099-12-31'
    };
    const data = await dynamo.query(params).promise();
    return (data.Items || []) as Transaction[];
  } else {
    const data = await dynamo.scan(params).promise();
    return ((data.Items || []) as Transaction[]).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
}
const TRANSACTIONS_TABLE = process.env[ENVIRONMENT_VARIABLES.TRANSACTIONS_TABLE]!;
const SUBSCRIPTIONS_TABLE = process.env[ENVIRONMENT_VARIABLES.SUBSCRIPTIONS_TABLE]!;
const NETWORTH_TABLE = process.env[ENVIRONMENT_VARIABLES.NETWORTH_TABLE]!;

/**
 * Adds a new transaction to the database with auto-generated monthly sheet partitioning
 * @param tx - Transaction data without id, monthSheet, or createdAt
 * @returns Promise resolving to the created transaction with generated fields
 * @example
 * ```typescript
 * const transaction = await addTransaction({
 *   date: '2024-01-15',
 *   account: 'Credit Card',
 *   category: 'Food',
 *   amount: -50.00,
 *   currency: 'THB'
 * });
 * ```
 */
export async function addTransaction(tx: Omit<Transaction, 'id' | 'monthSheet' | 'createdAt'>): Promise<Transaction> {
  const monthSheet = `Transactions-${tx.date.substring(0, 7)}`;
  const item = {
    id: Date.now().toString(),
    ...tx,
    amount: Number(tx.amount),
    monthSheet,
    createdAt: new Date().toISOString()
  };
  await dynamo.put({ TableName: TRANSACTIONS_TABLE, Item: item }).promise();
  return item;
}

/**
 * Gets financial summary with optional date range filtering
 * @param start - Start date in YYYY-MM-DD format (optional)
 * @param end - End date in YYYY-MM-DD format (optional)
 * @returns Promise resolving to summary with inflow/outflow/net and currency breakdown
 */
export async function getSummary(start?: string, end?: string): Promise<Summary> {
  const params = {
    TableName: TRANSACTIONS_TABLE,
    IndexName: INDEX_NAMES.DATE_INDEX,
    KeyConditionExpression: "#date BETWEEN :start AND :end",
    ExpressionAttributeNames: { "#date": "date" },
    ExpressionAttributeValues: { ":start": start, ":end": end }
  };
  const data = start && end ? await dynamo.query(params).promise() : await dynamo.scan({ TableName: TRANSACTIONS_TABLE }).promise();
  
  let inflow = 0, outflow = 0, byCcy: Record<string, { inflow: number; outflow: number }> = {};
  for (const tx of data.Items || []) {
    const amt = tx.amount;
    const ccy = tx.currency || DEFAULT_CURRENCY;
    if (!byCcy[ccy]) byCcy[ccy] = { inflow: 0, outflow: 0 };
    if (amt >= 0) { inflow += amt; byCcy[ccy].inflow += amt; }
    else { outflow += amt; byCcy[ccy].outflow += amt; }
  }
  return { inflow, outflow, net: inflow + outflow, byCcy };
}

/**
 * Gets monthly breakdown by credit cards and categories for a specific month
 * @param month - Month in YYYY-MM format
 * @returns Promise resolving to breakdown with credit card and category totals
 */
export async function getMonthlyBreakdown(month: string): Promise<MonthlyBreakdown> {
  const data = await dynamo.query({
    TableName: TRANSACTIONS_TABLE,
    IndexName: INDEX_NAMES.MONTH_SHEET_INDEX,
    KeyConditionExpression: "monthSheet = :sheet",
    ExpressionAttributeValues: { ":sheet": `Transactions-${month}` }
  }).promise();
  
  let cc: Record<string, number> = {}, cats: Record<string, number> = {};
  for (const tx of data.Items || []) {
    if (tx.account?.toLowerCase().includes("credit")) {
      cc[tx.account] = (cc[tx.account] || 0) + tx.amount;
    }
    if (tx.category) {
      cats[tx.category] = (cats[tx.category] || 0) + tx.amount;
    }
  }
  return { creditCards: cc, categories: cats, sheetData: formatSheetData(cc, cats) };
}

/**
 * Formats credit card and category data for sheet export (N:O columns)
 * @param cc - Credit card totals by account name
 * @param cats - Category totals by category name
 * @returns Array of [label, value] pairs for sheet formatting
 */
function formatSheetData(cc: Record<string, number>, cats: Record<string, number>): [string, string | number][] {
  const rows = [];
  rows.push(["Credit Cards", ""] as [string, string | number]);
  Object.entries(cc).forEach(([card, amt]) => rows.push([card, amt] as [string, string | number]));
  rows.push(["", ""] as [string, string | number]);
  rows.push(["Categories", ""] as [string, string | number]);
  Object.entries(cats).forEach(([cat, amt]) => rows.push([cat, amt] as [string, string | number]));
  return rows;
}

/**
 * Adds a new recurring subscription
 * @param sub - Subscription data without id or createdAt
 * @returns Promise resolving to the created subscription
 */
export async function addSubscription(sub: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> {
  const item = {
    id: Date.now().toString(),
    ...sub,
    amount: Number(sub.amount),
    createdAt: new Date().toISOString()
  };
  await dynamo.put({ TableName: SUBSCRIPTIONS_TABLE, Item: item }).promise();
  return item;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const data = await dynamo.scan({ TableName: SUBSCRIPTIONS_TABLE }).promise();
  return (data.Items || []) as Subscription[];
}

/**
 * Posts due subscription payments as transactions
 * @returns Promise resolving to list of posted subscription names
 */
export async function postSubscriptions(): Promise<{ posted: string[] }> {
  const subs = await getSubscriptions();
  const today = new Date().toISOString().split('T')[0];
  const posted = [];
  
  for (const sub of subs) {
    const dueDate = calculateDueDate(sub.frequency, sub.lastPosted);
    if (dueDate <= today) {
      const tx = {
        date: today,
        account: sub.account,
        category: CATEGORIES.SUBSCRIPTION,
        amount: -Math.abs(sub.amount),
        currency: sub.currency || DEFAULT_CURRENCY,
        description: sub.name
      };
      await addTransaction(tx);
      await dynamo.update({
        TableName: SUBSCRIPTIONS_TABLE,
        Key: { id: sub.id },
        UpdateExpression: "SET lastPosted = :date",
        ExpressionAttributeValues: { ":date": today }
      }).promise();
      posted.push(sub.name);
    }
  }
  return { posted };
}

/**
 * Calculates next due date for a subscription based on frequency
 * @param frequency - 'monthly' or 'yearly'
 * @param lastPosted - Last posted date in YYYY-MM-DD format
 * @returns Next due date in YYYY-MM-DD format
 */
function calculateDueDate(frequency: string, lastPosted?: string): string {
  if (!lastPosted) return new Date().toISOString().split('T')[0];
  const last = new Date(lastPosted);
  switch (frequency) {
    case "monthly": last.setMonth(last.getMonth() + 1); break;
    case "yearly": last.setFullYear(last.getFullYear() + 1); break;
    default: last.setDate(last.getDate() + 30);
  }
  return last.toISOString().split('T')[0];
}

export async function addNetWorthSnapshot(snapshot: Omit<NetWorthSnapshot, 'id' | 'date' | 'createdAt'>): Promise<NetWorthSnapshot> {
  const item = {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    ...snapshot,
    createdAt: new Date().toISOString()
  };
  await dynamo.put({ TableName: NETWORTH_TABLE, Item: item }).promise();
  return item;
}

export async function getNetWorthHistory(): Promise<NetWorthSnapshot[]> {
  const data = await dynamo.scan({ TableName: NETWORTH_TABLE }).promise();
  return ((data.Items || []) as NetWorthSnapshot[]).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
