import { call, put, takeEvery } from 'redux-saga/effects';
import { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_TRANSACTION, LOAD_SUMMARY, LOAD_BREAKDOWN, ADD_SUBSCRIPTION, LOAD_SUBSCRIPTIONS, LOAD_NETWORTH, POST_SUBSCRIPTIONS } from './types';
import { API_BASE_URL, API_ENDPOINTS, REDUX_ACTIONS } from '../constants';
import { HTTP_HEADERS } from '@finance-tracker/shared';

function* addTransactionSaga(action: any) {
  try {
    yield put({ type: REDUX_ACTIONS.SET_LOADING, payload: true });
    yield call(fetch, `${API_BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`, {
      method: 'POST',
      headers: { [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON },
      body: JSON.stringify(action.payload)
    });
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
      headers: { [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON },
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
  yield takeEvery(ADD_TRANSACTION, addTransactionSaga);
  yield takeEvery(LOAD_SUMMARY, loadSummarySaga);
  yield takeEvery(LOAD_BREAKDOWN, loadBreakdownSaga);
}