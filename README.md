# WalletApp

WalletApp is a full-stack personal finance management application built with an Angular front-end and a Node.js/Express back-end. It allows users to create accounts, track income and expenses, monitor balances, and view basic transaction insights.

## Features

- User registration and login with JWT authentication.
- Protected routes in both the front-end and the API.
- Create, view, update balances, and delete accounts.
- Add, edit, and delete transactions.
- Automatic account balance updates based on income and expenses.
- Transaction categories using MongoDB references.
- Dashboard, account details view, and analytics page.
- Responsive Angular UI with Tailwind CSS and charts.

## Tech Stack

**Front-end**

- Angular 18
- TypeScript
- RxJS
- NgRx Signals
- Tailwind CSS
- Chart.js / ng2-charts

**Back-end**

- Node.js
- Express 5
- TypeScript
- MongoDB / Mongoose
- JWT
- bcryptjs

## Project Structure

```text
WalletApp/
├── front-end/   # Angular application
└── back-end/    # Express API with MongoDB
```

## Prerequisites

Before running the project, make sure you have:

- Node.js
- npm
- A MongoDB database, either local or MongoDB Atlas

## Environment Variables

Create a `.env` file inside `back-end/`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

The front-end currently calls the API at:

```text
http://localhost:3000/api
```

Because of that, the back-end should run on port `3000`, unless you update the API URLs in the Angular services.

## Installation

Install back-end dependencies:

```bash
cd back-end
npm install
```

Install front-end dependencies:

```bash
cd ../front-end
npm install
```

## Run Locally

Open two terminals.

Terminal 1, back-end:

```bash
cd back-end
npm run dev
```

Terminal 2, front-end:

```bash
cd front-end
npm start
```

Then open:

```text
http://localhost:4200
```

## Available Scripts

Back-end:

```bash
npm run dev        # development server with tsx watch
npm run build      # TypeScript build
npm start          # runs the compiled dist/index.js
npm run typecheck  # TypeScript type check without build output
```

Front-end:

```bash
npm start          # Angular dev server
npm run build      # production build
npm test           # unit tests with Karma/Jasmine
```

## API Overview

Main API routes:

```text
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PUT    /api/accounts/updateBalance/:id
DELETE /api/accounts/:id

GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET    /api/categories
```

Protected routes require a JWT token in the `Authorization` header:

```text
Authorization: Bearer <token>
```

## Notes

- Transactions are linked to an account, user, and category.
- When a transaction is added, updated, or deleted, the related account balance is updated automatically.
- The `categories` collection should contain available categories so users can select a category when creating transactions.

## License

ISC
