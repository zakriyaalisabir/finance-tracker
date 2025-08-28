export const CRON_SCHEDULES = {
  DAILY_SUBSCRIPTIONS: '0 9 * * *',
  MONTHLY_NETWORTH: '0 10 1 * *'
} as const;

export const ENVIRONMENT_VARIABLES = {
  ACCOUNTS_TABLE: 'ACCOUNTS_TABLE',
  CATEGORIES_TABLE: 'CATEGORIES_TABLE',
  TRANSACTIONS_TABLE: 'TRANSACTIONS_TABLE',
  SUBSCRIPTIONS_TABLE: 'SUBSCRIPTIONS_TABLE',
  NETWORTH_TABLE: 'NETWORTH_TABLE',
  AWS_LAMBDA_FUNCTION_NAME: 'AWS_LAMBDA_FUNCTION_NAME'
} as const;

export const API_ENDPOINTS = {
  ACCOUNTS: '/accounts',
  CATEGORIES: '/categories',
  TRANSACTIONS: '/transactions',
  SUMMARY: '/summary',
  BREAKDOWN: '/breakdown',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTIONS_POST: '/subscriptions/post',
  NETWORTH: '/networth'
} as const;

export const DYNAMO_OPERATIONS = {
  PUT: 'put',
  SCAN: 'scan',
  QUERY: 'query',
  UPDATE: 'update'
} as const;