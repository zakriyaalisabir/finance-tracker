import { expectSaga } from 'redux-saga-test-plan';
import { call, put } from 'redux-saga/effects';
import { rootSaga } from '../store/sagas';
import { REDUX_ACTIONS } from '../constants';
import { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_CATEGORY, LOAD_CATEGORIES, ADD_TRANSACTION, LOAD_TRANSACTIONS, LOAD_SUMMARY } from '../store/types';

// Mock fetch
global.fetch = jest.fn();

describe('Redux Sagas', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should handle ADD_ACCOUNT saga', () => {
    const mockResponse = { success: true, result: { id: '1', name: 'Test Account' } };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const action = { type: ADD_ACCOUNT, payload: { name: 'Test Account', currency: 'USD' } };

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: true })
      .put({ type: LOAD_ACCOUNTS })
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: false })
      .dispatch(action)
      .silentRun();
  });

  it('should handle LOAD_ACCOUNTS saga', () => {
    const mockAccounts = [{ id: '1', name: 'Test Account', currency: 'USD' }];
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockAccounts
    });

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_ACCOUNTS, payload: mockAccounts })
      .dispatch({ type: LOAD_ACCOUNTS })
      .silentRun();
  });

  it('should handle ADD_CATEGORY saga', () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    const action = { type: ADD_CATEGORY, payload: { name: 'Food' } };

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: true })
      .put({ type: LOAD_CATEGORIES })
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: false })
      .dispatch(action)
      .silentRun();
  });

  it('should handle LOAD_CATEGORIES saga', () => {
    const mockCategories = [{ id: '1', name: 'Food' }];
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCategories
    });

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_CATEGORIES, payload: mockCategories })
      .dispatch({ type: LOAD_CATEGORIES })
      .silentRun();
  });

  it('should handle ADD_TRANSACTION saga', () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    const action = { type: ADD_TRANSACTION, payload: { date: '2024-01-15', amount: 100 } };

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: true })
      .put({ type: LOAD_TRANSACTIONS })
      .put({ type: LOAD_SUMMARY })
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: false })
      .dispatch(action)
      .silentRun();
  });

  it('should handle LOAD_TRANSACTIONS saga', () => {
    const mockTransactions = [{ id: '1', date: '2024-01-15', amount: 100 }];
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTransactions
    });

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_TRANSACTIONS, payload: mockTransactions })
      .dispatch({ type: LOAD_TRANSACTIONS })
      .silentRun();
  });

  it('should handle LOAD_TRANSACTIONS saga with date filters', () => {
    const mockTransactions = [{ id: '1', date: '2024-01-15', amount: 100 }];
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockTransactions
    });

    const action = { type: LOAD_TRANSACTIONS, payload: { start: '2024-01-01', end: '2024-01-31' } };

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_TRANSACTIONS, payload: mockTransactions })
      .dispatch(action)
      .silentRun();
  });

  it('should handle LOAD_SUMMARY saga', () => {
    const mockSummary = { inflow: 100, outflow: -50, net: 50, byCcy: {} };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSummary
    });

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: true })
      .put({ type: REDUX_ACTIONS.SET_SUMMARY, payload: mockSummary })
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: false })
      .dispatch({ type: LOAD_SUMMARY })
      .silentRun();
  });

  it('should handle LOAD_SUMMARY saga with date filters', () => {
    const mockSummary = { inflow: 100, outflow: -50, net: 50, byCcy: {} };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSummary
    });

    const action = { type: LOAD_SUMMARY, payload: { start: '2024-01-01', end: '2024-01-31' } };

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: true })
      .put({ type: REDUX_ACTIONS.SET_SUMMARY, payload: mockSummary })
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: false })
      .dispatch(action)
      .silentRun();
  });

  it('should handle saga errors gracefully', () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    return expectSaga(rootSaga)
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: true })
      .put({ type: REDUX_ACTIONS.SET_LOADING, payload: false })
      .dispatch({ type: ADD_ACCOUNT, payload: { name: 'Test' } })
      .silentRun();
  });
});