import { Account, Transaction, Subscription, NetWorthSnapshot, Summary, MonthlyBreakdown } from '@finance-tracker/shared';

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  netWorth: NetWorthSnapshot[];
  summary: Summary | null;
  breakdown: MonthlyBreakdown | null;
  loading: boolean;
}

import { REDUX_ACTIONS } from '../constants';

export const { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_TRANSACTION, ADD_SUBSCRIPTION, LOAD_SUMMARY, LOAD_BREAKDOWN, LOAD_SUBSCRIPTIONS, LOAD_NETWORTH, POST_SUBSCRIPTIONS, SET_LOADING } = REDUX_ACTIONS;

export interface AddTransactionAction {
  type: typeof ADD_TRANSACTION;
  payload: Omit<Transaction, 'id'>;
}

export interface LoadSummaryAction {
  type: typeof LOAD_SUMMARY;
  payload?: { start?: string; end?: string };
}

export type AppAction = AddTransactionAction | LoadSummaryAction | { type: string; payload?: any };