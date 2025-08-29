import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { App } from '../components/App';
import { rootReducer } from '../store/reducer';
import { rootSaga } from '../store/sagas';

const theme = createTheme();

const createMockStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
  sagaMiddleware.run(rootSaga);
  return store;
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
) as jest.Mock;

describe('App Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
  });

  it('renders finance tracker title', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('💰 Finance Tracker')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    renderWithProviders(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.getByText('Transactions List')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    renderWithProviders(<App />);
    
    const addTab = screen.getByRole('tab', { name: /Add Transaction/ });
    fireEvent.click(addTab);
    expect(screen.getByText('💳 Add Transaction')).toBeInTheDocument();
  });

  it('renders account form', () => {
    renderWithProviders(<App />);
    
    const accountTab = screen.getByRole('tab', { name: /Accounts/ });
    fireEvent.click(accountTab);
    expect(screen.getByText('🏦 Add Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Name')).toBeInTheDocument();
  });

  it('renders category form', () => {
    renderWithProviders(<App />);
    
    const categoryTab = screen.getByRole('tab', { name: /Categories/ });
    fireEvent.click(categoryTab);
    expect(screen.getByText('📂 Add Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
  });

  it('renders transaction form', () => {
    renderWithProviders(<App />);
    
    const transactionTab = screen.getByRole('tab', { name: /Add Transaction/ });
    fireEvent.click(transactionTab);
    expect(screen.getByText('💳 Add Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('renders transactions list', () => {
    renderWithProviders(<App />);
    
    const listTab = screen.getByRole('tab', { name: /Transactions List/ });
    fireEvent.click(listTab);
    expect(screen.getByText('📋 Filter Transactions')).toBeInTheDocument();
    expect(screen.getByText('💳 All Transactions')).toBeInTheDocument();
  });

  it('handles account form submission', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, result: { id: '1', name: 'Test Account', currency: 'USD' } })
    });

    renderWithProviders(<App />);
    
    const accountTab = screen.getByRole('tab', { name: /Accounts/ });
    fireEvent.click(accountTab);
    
    const nameInput = screen.getByLabelText('Account Name');
    const submitButton = screen.getByRole('button', { name: /Add Account/ });
    
    fireEvent.change(nameInput, { target: { value: 'Test Account' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/accounts', expect.any(Object));
    });
  });

  it('handles category form submission', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, result: { id: '1', name: 'Food' } })
    });

    renderWithProviders(<App />);
    
    const categoryTab = screen.getByRole('tab', { name: /Categories/ });
    fireEvent.click(categoryTab);
    
    const nameInput = screen.getByLabelText('Category Name');
    const submitButton = screen.getByRole('button', { name: /Add Category/ });
    
    fireEvent.change(nameInput, { target: { value: 'Food' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/categories', expect.any(Object));
    });
  });

  it('formats currency correctly', () => {
    renderWithProviders(<App />);
    // Currency formatting is tested through the summary display
    expect(screen.getAllByText('฿0.00')[0]).toBeInTheDocument();
  });

  it('handles reset button click', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    renderWithProviders(<App />);
    
    const resetButton = screen.getByRole('button', { name: /Reset All Data/ });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/reset', { method: 'POST' });
    });
  });
});