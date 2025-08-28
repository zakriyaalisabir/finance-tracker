import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_CATEGORY, LOAD_CATEGORIES, ADD_TRANSACTION, LOAD_SUMMARY, ADD_SUBSCRIPTION } from '../store/types';
import { FORM_FIELDS } from '../constants';

// Local interfaces to avoid module resolution issues
interface Account {
  id?: string;
  name: string;
  currency: string;
  createdAt?: string;
}

interface Category {
  id?: string;
  name: string;
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

const DEFAULT_CURRENCY = 'THB';

/**
 * Main Finance Tracker application component
 * Provides forms for adding transactions and subscriptions,
 * and displays financial summaries
 */
export const App: React.FC = () => {
  const dispatch = useDispatch();
  const { accounts, categories, summary, loading } = useSelector((state: RootState) => state);

  React.useEffect(() => {
    dispatch({ type: LOAD_ACCOUNTS });
    dispatch({ type: LOAD_CATEGORIES });
  }, [dispatch]);

  /**
   * Handles category form submission
   * @param e - Form submission event
   */
  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const category: Omit<Category, 'id'> = {
      name: formData.get(FORM_FIELDS.NAME) as string
    };
    
    dispatch({ type: ADD_CATEGORY, payload: category });
    form.reset();
  };

  /**
   * Handles account form submission
   * @param e - Form submission event
   */
  const handleAddAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const account: Omit<Account, 'id'> = {
      name: formData.get(FORM_FIELDS.NAME) as string,
      currency: formData.get(FORM_FIELDS.CURRENCY) as string || DEFAULT_CURRENCY
    };
    
    dispatch({ type: ADD_ACCOUNT, payload: account });
    form.reset();
  };

  /**
   * Handles transaction form submission
   * @param e - Form submission event
   */
  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const transaction: Omit<Transaction, 'id'> = {
      date: formData.get(FORM_FIELDS.DATE) as string,
      account: formData.get(FORM_FIELDS.ACCOUNT) as string,
      category: formData.get(FORM_FIELDS.CATEGORY) as string,
      amount: Number(formData.get(FORM_FIELDS.AMOUNT)),
      currency: formData.get(FORM_FIELDS.CURRENCY) as string
    };
    
    dispatch({ type: ADD_TRANSACTION, payload: transaction });
    form.reset();
  };

  /**
   * Handles subscription form submission
   * @param e - Form submission event
   */
  const handleAddSubscription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const subscription: Omit<Subscription, 'id'> = {
      name: formData.get(FORM_FIELDS.NAME) as string,
      account: formData.get(FORM_FIELDS.ACCOUNT) as string,
      amount: Number(formData.get(FORM_FIELDS.AMOUNT)),
      frequency: formData.get(FORM_FIELDS.FREQUENCY) as 'monthly' | 'yearly',
      currency: formData.get(FORM_FIELDS.CURRENCY) as string
    };
    
    dispatch({ type: ADD_SUBSCRIPTION, payload: subscription });
    form.reset();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Finance Tracker</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>Add Account</h2>
        <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name={FORM_FIELDS.NAME} placeholder="Account Name (Chase Credit Card)" required />
          <input name={FORM_FIELDS.CURRENCY} placeholder="Currency" defaultValue={DEFAULT_CURRENCY} />
          <button type="submit">Add Account</button>
        </form>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>Add Category</h2>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name={FORM_FIELDS.NAME} placeholder="Category Name (Food, Transport)" required />
          <button type="submit">Add Category</button>
        </form>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>Add Transaction</h2>
        <form onSubmit={handleAddTransaction} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name={FORM_FIELDS.DATE} type="date" required />
          <select name={FORM_FIELDS.ACCOUNT} required>
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>
                {account.name} ({account.currency})
              </option>
            ))}
          </select>
          <select name={FORM_FIELDS.CATEGORY} required>
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <input name={FORM_FIELDS.AMOUNT} type="number" placeholder="Amount" required />
          <select name={FORM_FIELDS.CURRENCY} required>
            <option value="">Select Currency</option>
            {[...new Set(accounts.map(account => account.currency))].map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <button type="submit">Add Transaction</button>
        </form>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h2>Add Subscription</h2>
        <form onSubmit={handleAddSubscription} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name={FORM_FIELDS.NAME} placeholder="Name (Netflix)" required />
          <select name={FORM_FIELDS.ACCOUNT} required>
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>
                {account.name} ({account.currency})
              </option>
            ))}
          </select>
          <input name={FORM_FIELDS.AMOUNT} type="number" placeholder="Amount" required />
          <select name={FORM_FIELDS.FREQUENCY}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select name={FORM_FIELDS.CURRENCY} required>
            <option value="">Select Currency</option>
            {[...new Set(accounts.map(account => account.currency))].map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <button type="submit">Add Subscription</button>
        </form>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => dispatch({ type: LOAD_SUMMARY })}>Load Summary</button>
      </div>

      {loading && <p>Loading...</p>}
      {summary && (
        <pre style={{ background: '#f5f5f5', padding: '15px' }}>
          {JSON.stringify(summary, null, 2)}
        </pre>
      )}
    </div>
  );
};