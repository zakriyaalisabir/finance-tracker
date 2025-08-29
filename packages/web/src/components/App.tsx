import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Typography, Container, Grid, Card, CardContent,
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Tabs, Tab, CircularProgress, BottomNavigation, BottomNavigationAction,
  useMediaQuery, useTheme, Stack, Fab
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountIcon,
  Category as CategoryIcon,
  Payment as TransactionIcon,
  List as TransactionListIcon,
  Subscriptions as SubscriptionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { RootState } from '../store';
import { ADD_ACCOUNT, LOAD_ACCOUNTS, ADD_CATEGORY, LOAD_CATEGORIES, ADD_TRANSACTION, LOAD_TRANSACTIONS, LOAD_SUMMARY, ADD_SUBSCRIPTION } from '../store/types';
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
  const accounts = useSelector((state: RootState) => state.accounts);
  const categories = useSelector((state: RootState) => state.categories);
  const transactions = useSelector((state: RootState) => state.transactions);
  const summary = useSelector((state: RootState) => state.summary);
  const loading = useSelector((state: RootState) => state.loading);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [activeTab, setActiveTab] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => {
    dispatch({ type: LOAD_ACCOUNTS });
    dispatch({ type: LOAD_CATEGORIES });
    dispatch({ type: LOAD_TRANSACTIONS });
    dispatch({ type: LOAD_SUMMARY });
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

  const formatCurrency = (amount: number, currency = 'THB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderSummaries = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Date filters
    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const startOfYear = new Date(currentYear, 0, 1).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    // Filter transactions by time periods
    const monthlyTx = transactions.filter(tx => tx.date >= startOfMonth);
    const yearlyTx = transactions.filter(tx => tx.date >= startOfYear);
    const last30DaysTx = transactions.filter(tx => tx.date >= thirtyDaysAgo);

    // Helper function to calculate summaries
    const calculateSummary = (txList: Transaction[], groupBy: keyof Transaction) => {
      return txList.reduce((acc, tx) => {
        const key = tx[groupBy] as string;
        if (!acc[key]) acc[key] = { inflow: 0, outflow: 0, net: 0 };
        if (tx.amount >= 0) acc[key].inflow += tx.amount;
        else acc[key].outflow += Math.abs(tx.amount);
        acc[key].net = acc[key].inflow - acc[key].outflow;
        return acc;
      }, {} as Record<string, { inflow: number; outflow: number; net: number }>);
    };

    // Calculate summaries for different time periods
    const allTimeAccount = calculateSummary(transactions, 'account');
    const allTimeCategory = calculateSummary(transactions, 'category');
    const allTimeCurrency = calculateSummary(transactions, 'currency');
    
    const monthlyAccount = calculateSummary(monthlyTx, 'account');
    const monthlyCategory = calculateSummary(monthlyTx, 'category');
    
    const yearlyAccount = calculateSummary(yearlyTx, 'account');
    const yearlyCategory = calculateSummary(yearlyTx, 'category');
    
    const last30Account = calculateSummary(last30DaysTx, 'account');
    const last30Category = calculateSummary(last30DaysTx, 'category');

    const renderSummaryTable = (data: Record<string, { inflow: number; outflow: number; net: number }>, title: string, icon: string) => {
      if (Object.keys(data).length === 0) return null;
      return (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{icon} {title}</Typography>
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Inflow</TableCell>
                    <TableCell align="right">Outflow</TableCell>
                    <TableCell align="right">Net</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data).map(([name, summary]) => (
                    <TableRow key={name}>
                      <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>{name}</TableCell>
                      <TableCell align="right" sx={{ color: 'green', fontSize: isMobile ? '0.8rem' : '1rem' }}>
                        {formatCurrency(summary.inflow)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'red', fontSize: isMobile ? '0.8rem' : '1rem' }}>
                        {formatCurrency(summary.outflow)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: summary.net >= 0 ? 'green' : 'red', fontSize: isMobile ? '0.8rem' : '1rem' }}>
                        {formatCurrency(summary.net)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      );
    };

    return (
      <Box>
        {/* Reset Button for Development */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => {
              fetch('http://localhost:3001/reset', { method: 'POST' })
                .then(() => {
                  dispatch({ type: LOAD_ACCOUNTS });
                  dispatch({ type: LOAD_CATEGORIES });
                  dispatch({ type: LOAD_TRANSACTIONS });
                  dispatch({ type: LOAD_SUMMARY });
                })
                .catch(console.error);
            }}
          >
            🗑️ Reset All Data
          </Button>
        </Box>

        {/* Overall Summary Cards */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
              <CardContent sx={{ pb: isMobile ? 2 : 3 }}>
                <Typography variant={isMobile ? "body1" : "h6"}>💰 Total Inflow</Typography>
                <Typography variant={isMobile ? "h5" : "h4"}>{summary ? formatCurrency(summary.inflow) : '฿0.00'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', color: 'white' }}>
              <CardContent sx={{ pb: isMobile ? 2 : 3 }}>
                <Typography variant={isMobile ? "body1" : "h6"}>💸 Total Outflow</Typography>
                <Typography variant={isMobile ? "h5" : "h4"}>{summary ? formatCurrency(Math.abs(summary.outflow)) : '฿0.00'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Card sx={{ background: summary && summary.net >= 0 ? 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)' : 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', color: 'white' }}>
              <CardContent sx={{ pb: isMobile ? 2 : 3 }}>
                <Typography variant={isMobile ? "body1" : "h6"}>{summary && summary.net >= 0 ? '📈 Net Profit' : '📉 Net Loss'}</Typography>
                <Typography variant={isMobile ? "h5" : "h4"}>{summary ? formatCurrency(summary.net) : '฿0.00'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* All Time Summaries */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>📈 All Time Summaries</Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid size={{ xs: 12, md: 4 }}>
            {renderSummaryTable(allTimeAccount, "By Accounts", "🏦")}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {renderSummaryTable(allTimeCategory, "By Categories", "📂")}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {renderSummaryTable(allTimeCurrency, "By Currency", "💱")}
          </Grid>
        </Grid>

        {/* This Month Summaries */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>📅 This Month ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderSummaryTable(monthlyAccount, "By Accounts", "🏦")}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderSummaryTable(monthlyCategory, "By Categories", "📂")}
          </Grid>
        </Grid>

        {/* This Year Summaries */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>📆 This Year ({currentYear})</Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderSummaryTable(yearlyAccount, "By Accounts", "🏦")}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderSummaryTable(yearlyCategory, "By Categories", "📂")}
          </Grid>
        </Grid>

        {/* Last 30 Days Summaries */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>🗓️ Last 30 Days</Typography>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderSummaryTable(last30Account, "By Accounts", "🏦")}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {renderSummaryTable(last30Category, "By Categories", "📂")}
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAccountForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>🏦 Add Account</Typography>
        <Stack component="form" onSubmit={handleAddAccount} spacing={2}>
          <TextField name={FORM_FIELDS.NAME} label="Account Name" placeholder="Chase Credit Card" required fullWidth />
          <TextField name={FORM_FIELDS.CURRENCY} label="Currency" defaultValue={DEFAULT_CURRENCY} fullWidth />
          <Button type="submit" variant="contained" startIcon={<AccountIcon />} size={isMobile ? "large" : "medium"} fullWidth={isMobile}>
            Add Account
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderCategoryForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>📂 Add Category</Typography>
        <Stack component="form" onSubmit={handleAddCategory} spacing={2}>
          <TextField name={FORM_FIELDS.NAME} label="Category Name" placeholder="Food, Transport" required fullWidth />
          <Button type="submit" variant="contained" startIcon={<CategoryIcon />} size={isMobile ? "large" : "medium"} fullWidth={isMobile}>
            Add Category
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderTransactionForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>💳 Add Transaction</Typography>
        <Stack component="form" onSubmit={handleAddTransaction} spacing={2}>
          <TextField name={FORM_FIELDS.DATE} type="date" label="Date" InputLabelProps={{ shrink: true }} required fullWidth />
          <FormControl fullWidth>
            <InputLabel>Account</InputLabel>
            <Select name={FORM_FIELDS.ACCOUNT} required>
              {accounts.map(account => (
                <MenuItem key={account.id} value={account.name}>
                  {account.name} ({account.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select name={FORM_FIELDS.CATEGORY} required>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField name={FORM_FIELDS.AMOUNT} type="number" label="Amount" required fullWidth />
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select name={FORM_FIELDS.CURRENCY} required>
              {[...new Set(accounts.map(account => account.currency))].map(currency => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" startIcon={<TransactionIcon />} size={isMobile ? "large" : "medium"} fullWidth={isMobile}>
            Add Transaction
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderSubscriptionForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>🔄 Add Subscription</Typography>
        <Stack component="form" onSubmit={handleAddSubscription} spacing={2}>
          <TextField name={FORM_FIELDS.NAME} label="Name" placeholder="Netflix" required fullWidth />
          <FormControl fullWidth>
            <InputLabel>Account</InputLabel>
            <Select name={FORM_FIELDS.ACCOUNT} required>
              {accounts.map(account => (
                <MenuItem key={account.id} value={account.name}>
                  {account.name} ({account.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField name={FORM_FIELDS.AMOUNT} type="number" label="Amount" required fullWidth />
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select name={FORM_FIELDS.FREQUENCY} defaultValue="monthly">
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select name={FORM_FIELDS.CURRENCY} required>
              {[...new Set(accounts.map(account => account.currency))].map(currency => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" startIcon={<SubscriptionIcon />} size={isMobile ? "large" : "medium"} fullWidth={isMobile}>
            Add Subscription
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderTransactionsList = () => (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>📋 Filter Transactions</Typography>
          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems="center">
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth={isMobile}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth={isMobile}
            />
            <Button
              variant="contained"
              onClick={() => dispatch({ type: LOAD_TRANSACTIONS, payload: { start: startDate, end: endDate } })}
              fullWidth={isMobile}
            >
              Filter
            </Button>
          </Stack>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>💳 All Transactions</Typography>
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                      {transaction.account}
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                      {transaction.category}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontSize: isMobile ? '0.8rem' : '1rem',
                      color: transaction.amount >= 0 ? 'green' : 'red'
                    }}>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                      {transaction.currency}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        No transactions found. Add some transactions or adjust your filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant={isMobile ? "h6" : "h5"} component="div" sx={{ flexGrow: 1 }}>
            💰 Finance Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4, px: isMobile ? 1 : 3 }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)} 
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            centered={!isMobile}
          >
            <Tab 
              icon={isMobile ? <DashboardIcon /> : <DashboardIcon />} 
              label={isMobile ? "Dashboard" : "Dashboard"}
              sx={{ minWidth: isMobile ? 80 : 'auto', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
            />
            <Tab 
              icon={<TransactionIcon />} 
              label={isMobile ? "Add" : "Add Transaction"}
              sx={{ minWidth: isMobile ? 60 : 'auto', fontSize: isMobile ? '0.7rem' : '0.875rem' }}
            />
            <Tab 
              icon={<TransactionListIcon />} 
              label={isMobile ? "List" : "Transactions List"}
              sx={{ minWidth: isMobile ? 60 : 'auto', fontSize: isMobile ? '0.7rem' : '0.875rem' }}
            />
            <Tab 
              icon={<AccountIcon />} 
              label={isMobile ? "Account" : "Accounts"}
              sx={{ minWidth: isMobile ? 60 : 'auto', fontSize: isMobile ? '0.7rem' : '0.875rem' }}
            />
            <Tab 
              icon={<CategoryIcon />} 
              label={isMobile ? "Category" : "Categories"}
              sx={{ minWidth: isMobile ? 60 : 'auto', fontSize: isMobile ? '0.7rem' : '0.875rem' }}
            />
            <Tab 
              icon={<SubscriptionIcon />} 
              label={isMobile ? "Subscription" : "Subscriptions"}
              sx={{ minWidth: isMobile ? 60 : 'auto', fontSize: isMobile ? '0.7rem' : '0.875rem' }}
            />
          </Tabs>
        </Paper>

        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ mt: isMobile ? 1 : 3 }}>
          {activeTab === 0 && renderSummaries()}
          {activeTab === 1 && renderTransactionForm()}
          {activeTab === 2 && renderTransactionsList()}
          {activeTab === 3 && renderAccountForm()}
          {activeTab === 4 && renderCategoryForm()}
          {activeTab === 5 && renderSubscriptionForm()}
        </Box>
      </Container>


    </Box>
  );
};