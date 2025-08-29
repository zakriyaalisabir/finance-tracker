# Finance Tracker

A comprehensive personal finance management system built with TypeScript, React, Redux Saga, and AWS serverless architecture.

## Features

### 🏦 Transaction Management
- **Auto-creates monthly sheets** - Transactions automatically partitioned by `Transactions-YYYY-MM`
- **Multi-currency support** - Track transactions in different currencies with automatic breakdown
- **Efficient querying** - Uses DynamoDB GSI for fast date range and monthly queries

### 📊 Financial Reporting
- **Master Summary** - Inflow/outflow/net with per-currency breakdown for any date range
- **Monthly Breakdown** - Credit card and category spending analysis
- **Weekly/Monthly Totals** - Easy access to period summaries with budget tracking
- **Advanced Filtering** - Multiple filter options for transaction review
- **Calendar View** - Visual monthly transaction overview
- **Improved Charts** - Well-organized expense visualization
- **Asset Graphs** - Track asset trends over time
- **Sheet Export** - Data formatted for N:O column export to spreadsheets

### 🔄 Subscription Management
- **Recurring Subscriptions** - Netflix, Internet, Mobile, etc.
- **Auto-posting** - Automatically posts due payments as transactions
- **Flexible Frequencies** - Monthly and yearly subscription support

### 💰 Budget Management
- **Category Budgets** - Set monthly budget limits for each spending category
- **Budget Tracking** - Real-time budget vs actual spending comparison
- **Budget Alerts** - Visual indicators when approaching budget limits

### 📷 Receipt Management
- **Photo Attachments** - Save receipt photos with transactions
- **Memory Storage** - Keep financial memories and documentation
- **Easy Access** - Quick photo upload during transaction entry

### 💰 Net Worth Tracking
- **Account Balances** - Track assets and liabilities across accounts
- **Monthly Snapshots** - Automated monthly net worth logging
- **Historical Tracking** - View net worth trends over time

### ⏰ Automated Tasks
- **Daily Subscription Checks** - Runs at 9 AM to post due subscriptions
- **Monthly Net Worth Snapshots** - Captures net worth on 1st of each month
- **Configurable Scheduling** - Uses node-cron for flexible task scheduling

## Architecture

### Monorepo Structure
```
finance-tracker/
├── packages/
│   ├── shared/          # TypeScript interfaces & constants
│   ├── api/             # Serverless TypeScript API
│   └── web/             # React + Redux Saga frontend
├── package.json         # Root workspace configuration
└── lerna.json          # Lerna monorepo configuration
```

### Technology Stack
- **Backend**: Node.js 22+, TypeScript, AWS Lambda, DynamoDB
- **Frontend**: React 18, TypeScript, Redux, Redux Saga, Vite
- **Infrastructure**: Serverless Framework, AWS API Gateway
- **Monorepo**: Lerna, npm workspaces
- **Testing**: Jest, React Testing Library, Supertest

## Prerequisites

- **Node.js 22.0.0 or higher**
- **AWS CLI** configured with appropriate permissions
- **Serverless Framework** installed globally

## Quick Start

### 1. Install Dependencies
```bash
npm install
npm install --workspaces
```

### 2. Build Shared Package
```bash
cd packages/shared
npm run build
```

### 3. Start Local Development
```bash
# Start both API and web in parallel
npm run dev:local
```

### 4. Deploy to AWS (Optional)
```bash
cd packages/api
npm run build
npm run deploy
```

### 5. Update API URL (For AWS deployment)
Replace `<your-api-gateway-id>` in `packages/web/src/constants.ts` with your actual API Gateway URL.

## Development

### Available Scripts

#### Root Level
```bash
npm run build           # Build all packages
npm run dev            # Start all development servers
npm run dev:local      # Start local API + web development
npm run deploy         # Deploy all packages
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

#### Package Level
```bash
# Shared package
npm run build       # Compile TypeScript
npm run dev         # Watch mode compilation

# API package
npm run build       # Compile TypeScript
npm run dev         # Watch mode compilation
npm run dev:local   # Start local Express server
npm run deploy      # Deploy to AWS

# Web package
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run test        # Run Jest tests
```

## API Endpoints

### Transactions
- `POST /transactions` - Add new transaction
- `GET /transactions` - List all transactions
- `GET /transactions?start=YYYY-MM-DD&end=YYYY-MM-DD` - Filter by date
- `GET /summary?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get financial summary
- `GET /breakdown/YYYY-MM` - Get monthly breakdown

### Accounts & Categories
- `POST /accounts` - Add new account
- `GET /accounts` - List all accounts
- `POST /categories` - Add new category
- `GET /categories` - List all categories

### Subscriptions
- `POST /subscriptions` - Add new subscription
- `GET /subscriptions` - List all subscriptions
- `POST /subscriptions/post` - Post due subscription payments

### Net Worth
- `POST /networth` - Add net worth snapshot
- `GET /networth` - Get net worth history

### Development
- `POST /reset` - Reset all data (local development only)

## Database Schema

### Transactions Table
- **Primary Key**: `id` (String)
- **GSI**: `DateIndex` on `date`
- **GSI**: `MonthSheetIndex` on `monthSheet`
- **Attributes**: date, account, category, amount, currency, description

### Subscriptions Table
- **Primary Key**: `id` (String)
- **Attributes**: name, account, amount, frequency, currency, lastPosted

### NetWorth Table
- **Primary Key**: `id` (String)
- **GSI**: `DateIndex` on `date`
- **Attributes**: date, accounts, assets, liabilities, netWorth

## Testing

### Test Structure
```
packages/
├── api/src/__tests__/
│   └── local.test.ts      # API endpoint tests
└── web/src/__tests__/
    ├── App.test.tsx       # React component tests
    ├── reducer.test.ts    # Redux reducer tests
    └── sagas.test.ts      # Redux saga tests
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific package
cd packages/api && npm test
cd packages/web && npm test
```

### Test Coverage
- **API**: Comprehensive endpoint testing with supertest
- **Web**: React components, Redux reducers, and sagas
- **Target**: 100% coverage for critical business logic

## Adding New Features

1. **Add Types**: Define interfaces in `packages/shared/src/types.ts`
2. **Add Constants**: Define constants in appropriate `constants.ts` files
3. **API Functions**: Add database functions in `packages/api/src/dynamo.ts`
4. **API Routes**: Add endpoints in `packages/api/src/handler.ts`
5. **Redux Actions**: Add actions in `packages/web/src/store/types.ts`
6. **Redux Sagas**: Add async logic in `packages/web/src/store/sagas.ts`
7. **UI Components**: Add React components in `packages/web/src/components/`
8. **Tests**: Add corresponding test files in `__tests__` directories

## Configuration

### Environment Variables
- `TRANSACTIONS_TABLE` - DynamoDB transactions table name
- `SUBSCRIPTIONS_TABLE` - DynamoDB subscriptions table name
- `NETWORTH_TABLE` - DynamoDB net worth table name

### Constants
All magic strings and configuration values are centralized in `constants.ts` files:
- **Shared**: Currency, regions, table names, HTTP constants
- **API**: Cron schedules, environment variables, endpoints
- **Web**: API URLs, Redux actions, form fields

## Deployment

### Local Development
- Uses Express server with in-memory storage
- Automatic data reset functionality
- Hot reload for both API and web

### AWS Infrastructure
The system creates the following AWS resources:
- **3 DynamoDB Tables** with GSI indexes
- **API Gateway** with HTTP API
- **Lambda Function** for API handling
- **CloudWatch Logs** for monitoring

### Cost Optimization
- **DynamoDB**: Pay-per-request billing mode
- **Lambda**: Only charged for actual usage
- **API Gateway**: HTTP API (cheaper than REST API)

## Mobile Support

- **Responsive Design**: Material-UI breakpoints for mobile optimization
- **Touch-Optimized**: Large buttons and touch-friendly forms
- **Bottom Navigation**: Mobile-first navigation pattern
- **Compact Tables**: Smaller fonts and spacing on mobile devices

## Monitoring

### Scheduled Jobs
- Check CloudWatch Logs for cron job execution
- Monitor subscription posting success/failures
- Track net worth snapshot creation

### Performance
- DynamoDB queries use GSI for efficient filtering
- Frontend uses Redux for optimized state management
- API uses serverless architecture for automatic scaling

## CI/CD

### GitHub Actions
The project includes automated workflows:
- **CI**: Runs tests on push/PR to main/develop branches
- **Deploy**: Deploys to AWS on main branch pushes
- **Lint**: TypeScript compilation checks

### Required Secrets
For AWS deployment, add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Contributing

1. Follow TypeScript strict mode
2. Add JSDoc comments for all functions
3. Use constants instead of magic strings
4. Maintain type safety across packages
5. Write tests for new features
6. Test locally before deploying

## License

MIT License - see LICENSE file for details.