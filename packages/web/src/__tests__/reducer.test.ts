import { rootReducer } from '../store/reducer';
import { REDUX_ACTIONS } from '../constants';

describe('Redux Reducer', () => {
  const initialState = {
    accounts: [],
    categories: [],
    transactions: [],
    subscriptions: [],
    netWorth: [],
    summary: null,
    breakdown: null,
    loading: false
  };

  it('should return initial state', () => {
    expect(rootReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should handle SET_LOADING', () => {
    const action = { type: REDUX_ACTIONS.SET_LOADING, payload: true };
    const newState = rootReducer(initialState, action);
    expect(newState.loading).toBe(true);
  });

  it('should handle SET_ACCOUNTS', () => {
    const accounts = [{ id: '1', name: 'Test Account', currency: 'USD' }];
    const action = { type: REDUX_ACTIONS.SET_ACCOUNTS, payload: accounts };
    const newState = rootReducer(initialState, action);
    expect(newState.accounts).toEqual(accounts);
  });

  it('should handle SET_CATEGORIES', () => {
    const categories = [{ id: '1', name: 'Food' }];
    const action = { type: REDUX_ACTIONS.SET_CATEGORIES, payload: categories };
    const newState = rootReducer(initialState, action);
    expect(newState.categories).toEqual(categories);
  });

  it('should handle SET_TRANSACTIONS', () => {
    const transactions = [{ id: '1', date: '2024-01-15', amount: 100 }];
    const action = { type: REDUX_ACTIONS.SET_TRANSACTIONS, payload: transactions };
    const newState = rootReducer(initialState, action);
    expect(newState.transactions).toEqual(transactions);
  });

  it('should handle SET_SUMMARY', () => {
    const summary = { inflow: 100, outflow: -50, net: 50, byCcy: {} };
    const action = { type: REDUX_ACTIONS.SET_SUMMARY, payload: summary };
    const newState = rootReducer(initialState, action);
    expect(newState.summary).toEqual(summary);
  });

  it('should handle SET_BREAKDOWN', () => {
    const breakdown = { creditCards: {}, categories: {}, sheetData: [] };
    const action = { type: REDUX_ACTIONS.SET_BREAKDOWN, payload: breakdown };
    const newState = rootReducer(initialState, action);
    expect(newState.breakdown).toEqual(breakdown);
  });

  it('should handle SET_SUBSCRIPTIONS', () => {
    const subscriptions = [{ id: '1', name: 'Netflix', amount: 15 }];
    const action = { type: REDUX_ACTIONS.SET_SUBSCRIPTIONS, payload: subscriptions };
    const newState = rootReducer(initialState, action);
    expect(newState.subscriptions).toEqual(subscriptions);
  });

  it('should handle SET_NETWORTH', () => {
    const netWorth = [{ id: '1', date: '2024-01-01', netWorth: 1000 }];
    const action = { type: REDUX_ACTIONS.SET_NETWORTH, payload: netWorth };
    const newState = rootReducer(initialState, action);
    expect(newState.netWorth).toEqual(netWorth);
  });

  it('should handle unknown action types', () => {
    const action = { type: 'UNKNOWN_ACTION', payload: 'test' };
    const newState = rootReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });

  it('should maintain immutability', () => {
    const action = { type: REDUX_ACTIONS.SET_LOADING, payload: true };
    const newState = rootReducer(initialState, action);
    expect(newState).not.toBe(initialState);
    expect(initialState.loading).toBe(false);
    expect(newState.loading).toBe(true);
  });
});