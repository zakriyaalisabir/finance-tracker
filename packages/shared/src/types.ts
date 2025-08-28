/**
 * Represents a financial account
 */
export interface Account {
  /** Unique identifier for the account */
  id?: string;
  /** Account name (e.g., "Chase Credit Card", "Wells Fargo Checking") */
  name: string;
  /** Account currency */
  currency: string;
  /** ISO timestamp when record was created */
  createdAt?: string;
}

/**
 * Represents a transaction category
 */
export interface Category {
  /** Unique identifier for the category */
  id?: string;
  /** Category name (e.g., "Food", "Transport", "Entertainment") */
  name: string;
  /** ISO timestamp when record was created */
  createdAt?: string;
}

/**
 * Represents a financial transaction
 */
export interface Transaction {
  /** Unique identifier for the transaction */
  id?: string;
  /** Transaction date in YYYY-MM-DD format */
  date: string;
  /** Account name (e.g., "Credit Card", "Checking") */
  account: string;
  /** Transaction category (e.g., "Food", "Transport") */
  category: string;
  /** Transaction amount (positive for income, negative for expenses) */
  amount: number;
  /** Currency code (e.g., "THB", "USD") */
  currency: string;
  /** Optional transaction description */
  description?: string;
  /** Auto-generated monthly sheet identifier (Transactions-YYYY-MM) */
  monthSheet?: string;
  /** ISO timestamp when record was created */
  createdAt?: string;
}

/**
 * Represents a recurring subscription
 */
export interface Subscription {
  /** Unique identifier for the subscription */
  id?: string;
  /** Subscription name (e.g., "Netflix", "Spotify") */
  name: string;
  /** Account to charge the subscription to */
  account: string;
  /** Subscription amount (always positive) */
  amount: number;
  /** How often the subscription recurs */
  frequency: 'monthly' | 'yearly';
  /** Currency code for the subscription */
  currency: string;
  /** Last date this subscription was posted as a transaction */
  lastPosted?: string;
  /** ISO timestamp when record was created */
  createdAt?: string;
}

/**
 * Represents a net worth snapshot at a point in time
 */
export interface NetWorthSnapshot {
  /** Unique identifier for the snapshot */
  id?: string;
  /** Date of the snapshot in YYYY-MM-DD format */
  date?: string;
  /** Account balances by account name */
  accounts?: Record<string, number>;
  /** Total assets value */
  assets: number;
  /** Total liabilities value (typically negative) */
  liabilities: number;
  /** Calculated net worth (assets + liabilities) */
  netWorth: number;
  /** ISO timestamp when record was created */
  createdAt?: string;
}

/**
 * Financial summary with inflow/outflow breakdown
 */
export interface Summary {
  /** Total money coming in */
  inflow: number;
  /** Total money going out */
  outflow: number;
  /** Net amount (inflow + outflow) */
  net: number;
  /** Breakdown by currency */
  byCcy: Record<string, { inflow: number; outflow: number }>;
}

/**
 * Monthly breakdown by credit cards and categories
 */
export interface MonthlyBreakdown {
  /** Spending by credit card */
  creditCards: Record<string, number>;
  /** Spending by category */
  categories: Record<string, number>;
  /** Data formatted for sheet export (N:O columns) */
  sheetData: [string, string | number][];
}

/**
 * Standard API response wrapper
 * @template T The type of the response data
 */
export interface ApiResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean;
  /** The response data if successful */
  result?: T;
  /** Error message if unsuccessful */
  error?: string;
}