/** Default currency for the application */
export const DEFAULT_CURRENCY = 'THB';

/** Default AWS region */
export const DEFAULT_REGION = 'ap-southeast-1';

/** DynamoDB table names */
export const TABLE_NAMES = {
  /** Financial accounts table */
  ACCOUNTS: 'Accounts',
  /** Transaction categories table */
  CATEGORIES: 'Categories',
  /** Main transactions table */
  TRANSACTIONS: 'FinanceTransactions',
  /** Recurring subscriptions table */
  SUBSCRIPTIONS: 'Subscriptions',
  /** Net worth snapshots table */
  NETWORTH: 'NetWorth'
} as const;

/** DynamoDB Global Secondary Index names */
export const INDEX_NAMES = {
  /** Index for querying by date */
  DATE_INDEX: 'DateIndex',
  /** Index for querying by monthly sheet */
  MONTH_SHEET_INDEX: 'MonthSheetIndex'
} as const;

/** Valid subscription frequencies */
export const SUBSCRIPTION_FREQUENCIES = {
  /** Monthly recurring subscription */
  MONTHLY: 'monthly',
  /** Yearly recurring subscription */
  YEARLY: 'yearly'
} as const;

/** Predefined transaction categories */
export const CATEGORIES = {
  /** Auto-generated subscription transactions */
  SUBSCRIPTION: 'Subscription'
} as const;

/** HTTP method constants */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
} as const;

/** HTTP header constants */
export const HTTP_HEADERS = {
  /** Content-Type header name */
  CONTENT_TYPE: 'Content-Type',
  /** JSON content type value */
  APPLICATION_JSON: 'application/json'
} as const;