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
- **Sheet Export** - Data formatted for N:O column export to spreadsheets

### 🔄 Subscription Management
- **Recurring Subscriptions** - Netflix, Internet, Mobile, etc.
- **Auto-posting** - Automatically posts due payments as transactions
- **Flexible Frequencies** - Monthly and yearly subscription support

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

### 3. Deploy API
```bash
cd packages/api
npm run build
npm run deploy
```

### 4. Update API URL
Replace `<your-api-gateway-id>` in `packages/web/src/constants.ts` with your actual API Gateway URL.

### 5. Start Frontend
```bash
cd packages/web
npm run dev
```

## API Endpoints

### Transactions
- `POST /transactions` - Add new transaction
- `GET /summary?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get financial summary
- `GET /breakdown/YYYY-MM` - Get monthly breakdown

### Subscriptions
- `POST /subscriptions` - Add new subscription
- `GET /subscriptions` - List all subscriptions
- `POST /subscriptions/post` - Post due subscription payments

### Net Worth
- `POST /networth` - Add net worth snapshot
- `GET /networth` - Get net worth history

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

## Development

### Available Scripts

#### Root Level
```bash
npm run build        # Build all packages
npm run dev         # Start all development servers
npm run deploy      # Deploy all packages
```

#### Package Level
```bash
# Shared package
npm run build       # Compile TypeScript
npm run dev         # Watch mode compilation

# API package
npm run build       # Compile TypeScript
npm run dev         # Watch mode compilation
npm run deploy      # Deploy to AWS

# Web package
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Adding New Features

1. **Add Types**: Define interfaces in `packages/shared/src/types.ts`
2. **Add Constants**: Define constants in appropriate `constants.ts` files
3. **API Functions**: Add database functions in `packages/api/src/dynamo.ts`
4. **API Routes**: Add endpoints in `packages/api/src/handler.ts`
5. **Redux Actions**: Add actions in `packages/web/src/store/types.ts`
6. **Redux Sagas**: Add async logic in `packages/web/src/store/sagas.ts`
7. **UI Components**: Add React components in `packages/web/src/components/`

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

## Monitoring

### Scheduled Jobs
- Check CloudWatch Logs for cron job execution
- Monitor subscription posting success/failures
- Track net worth snapshot creation

### Performance
- DynamoDB queries use GSI for efficient filtering
- Frontend uses Redux for optimized state management
- API uses serverless architecture for automatic scaling

## Contributing

1. Follow TypeScript strict mode
2. Add JSDoc comments for all functions
3. Use constants instead of magic strings
4. Maintain type safety across packages
5. Test locally before deploying

## License

MIT License - see LICENSE file for details.