import { call, put, takeEvery } from 'redux-saga/effects';
import { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_CATEGORY, LOAD_CATEGORIES, ADD_TRANSACTION, LOAD_TRANSACTIONS, LOAD_SUMMARY, LOAD_BREAKDOWN, ADD_SUBSCRIPTION, LOAD_SUBSCRIPTIONS, LOAD_NETWORTH, POST_SUBSCRIPTIONS } from './types';
import { API_BASE_URL, API_ENDPOINTS, REDUX_ACTIONS } from '../constants';

function* addTransactionSaga(action: any) {
  try {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: true });
    yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload)
    });
    yield put({ type: LOAD_TRANSACTIONS });
    yield put({ type: LOAD_SUMMARY });
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  } catch (error) {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  }
}

function* loadSummarySaga(action: any) {
  try {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: true });
    const params = action.payload ? `?start=${action.payload.start}&end=${action.payload.end}` : '';
    const response: Response = yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.SUMMARY}${params}`);
    const data = yield response.json();
    yield put({ type: REDUX_ACTIONS.SET_SUMMARY, payload: data });
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  } catch (error) {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  }
}

function* addAccountSaga(action: any) {
  try {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: true });
    yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.ACCOUNTS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload)
    });
    yield put({ type: LOAD_ACCOUNTS });
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  } catch (error) {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  }
}

function* loadAccountsSaga() {
  try {
    const response: Response = yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.ACCOUNTS}`);
    const data = yield response.json();
    yield put({ type: REDUX_ACTIONS.SET_ACCOUNTS, payload: data });
  } catch (error) {
    console.error(error);
  }
}

function* addCategorySaga(action: any) {
  try {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: true });
    yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload)
    });
    yield put({ type: LOAD_CATEGORIES });
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  } catch (error) {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: false });
  }
}

function* loadCategoriesSaga() {
  try {
    const response: Response = yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`);
    const data = yield response.json();
    yield put({ type: REDUX_ACTIONS.SET_CATEGORIES, payload: data });
  } catch (error) {
    console.error(error);
  }
}

function* loadTransactionsSaga(action: any) {
  try {
    const params = action.payload ? `?start=${action.payload.start}&end=${action.payload.end}` : '';
    const response: Response = yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}${params}`);
    const data = yield response.json();
    yield put({ type: REDUX_ACTIONS.SET_TRANSACTIONS, payload: data });
  } catch (error) {
    console.error(error);
  }
}

function* loadBreakdownSaga(action: any) {
  try {
    const response: Response = yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.BREAKDOWN}/${action.payload}`);
    const data = yield response.json();
    yield put({ type: REDUX_ACTIONS.SET_BREAKDOWN, payload: data });
  } catch (error) {
    console.error(error);
  }
}

export function* rootSaga() {
  yield takeEvery(ADD_ACCOUNT, addAccountSaga);
  yield takeEvery(LOAD_ACCOUNTS, loadAccountsSaga);
  yield takeEvery(ADD_CATEGORY, addCategorySaga);
  yield takeEvery(LOAD_CATEGORIES, loadCategoriesSaga);
  yield takeEvery(ADD_TRANSACTION, addTransactionSaga);
  yield takeEvery(LOAD_TRANSACTIONS, loadTransactionsSaga);
  yield takeEvery(LOAD_SUMMARY, loadSummarySaga);
  yield takeEvery(LOAD_BREAKDOWN, loadBreakdownSaga);
}