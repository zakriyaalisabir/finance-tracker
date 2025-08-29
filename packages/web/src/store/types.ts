// Local interfaces to avoid module resolution issues
interface Account {
  id?: string;
  name: string;
  currency: string;
  balance?: number;
  type?: 'cash' | 'card' | 'debit' | 'savings';
  createdAt?: string;
}

interface Category {
  id?: string;
  name: string;
  monthlyBudget?: number;
  budgetCurrency?: string;
  createdAt?: string;
}

interface Transaction {
  id?: string;
  date: string;
  account: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  receiptPhoto?: string[];
  type?: 'income' | 'expense' | 'transfer';
  monthSheet?: string;
  createdAt?: string;
}

interface Subscription {
  id?: string;
  name: string;
  account: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  currency: string;
  lastPosted?: string;
  createdAt?: string;
}

interface NetWorthSnapshot {
  id?: string;
  date?: string;
  accounts?: Record<string, number>;
  assets: number;
  liabilities: number;
  netWorth: number;
  createdAt?: string;
}

interface Summary {
  inflow: number;
  outflow: number;
  net: number;
  byCcy: Record<string, { inflow: number; outflow: number }>;
}

interface MonthlyBreakdown {
  creditCards: Record<string, number>;
  categories: Record<string, number>;
  budgets: Record<string, { budget: number; spent: number; remaining: number; percentage: number }>;
  weeklyTotals: Record<string, number>;
  sheetData: [string, string | number][];
}

export interface AppState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  netWorth: NetWorthSnapshot[];
  summary: Summary | null;
  breakdown: MonthlyBreakdown | null;
  loading: boolean;
}

import { REDUX_ACTIONS } from '../constants';

export const { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_CATEGORY, LOAD_CATEGORIES, ADD_TRANSACTION, LOAD_TRANSACTIONS, ADD_SUBSCRIPTION, LOAD_SUMMARY, LOAD_BREAKDOWN, LOAD_SUBSCRIPTIONS, LOAD_NETWORTH, POST_SUBSCRIPTIONS, SET_LOADING } = REDUX_ACTIONS;

export interface AddTransactionAction {
  type: typeof ADD_TRANSACTION;
  payload: Omit<Transaction, 'id'>;
}

export interface LoadSummaryAction {
  type: typeof LOAD_SUMMARY;
  payload?: { start?: string; end?: string };
}

export type AppAction = AddTransactionAction | LoadSummaryAction | { type: string; payload?: any };