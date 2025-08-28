import { AppState, AppAction } from './types';
import { REDUX_ACTIONS } from '../constants';

const initialState: AppState = {
  accounts: [],
  categories: [],
  transactions: [],
  subscriptions: [],
  netWorth: [],
  summary: null,
  breakdown: null,
  loading: false
};

export function appReducer(state = initialState, action: AppAction): AppState {
  switch (action.type) {
    case REDUX_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case REDUX_ACTIONS.SET_ACCOUNTS:
      return { ...state, accounts: action.payload };
    case REDUX_ACTIONS.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    case REDUX_ACTIONS.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case REDUX_ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload };
    case REDUX_ACTIONS.SET_BREAKDOWN:
      return { ...state, breakdown: action.payload };
    case REDUX_ACTIONS.SET_SUBSCRIPTIONS:
      return { ...state, subscriptions: action.payload };
    case REDUX_ACTIONS.SET_NETWORTH:
      return { ...state, netWorth: action.payload };
    default:
      return state;
  }
}

export const rootReducer = appReducer;
export { initialState };