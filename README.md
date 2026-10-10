# 🪙 SpendWise

Scan a UPI QR, say **why** you're spending, and see your habits take shape. SpendWise combines payment awareness with calm, supportive money coaching.

**Stack:** React + Vite · Recharts · Node.js + Express · PostgreSQL · JWT auth · html5-qrcode · Vitest + Supertest + React Testing Library

---

## Quick start (about 5 minutes)

You need **Node.js 18+** and either **Docker** (easiest) or your own PostgreSQL.

```bash
npm run setup     # installs everything and creates server/.env with a secret key
npm run db        # starts PostgreSQL in Docker  (skip if you use your own Postgres)
npm run seed      # optional: loads the demo dataset
npm run dev       # API on :4000, app on http://localhost:5173
```

**Demo login:** `demo@spendwise.app` / `Demo@1234` (created by `npm run seed`)

Not using Docker? Create a database and put its address in `server/.env`:
`DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/spendwise`
Tables are created automatically the first time the server starts.

## What's inside

| Feature | Where |
|---|---|
| Scan UPI QR (camera or photo), ask category + reason, hand off to your UPI app, confirm and record | `Scan & pay` page |
| Manual purchase / income recording with the same "why" prompt | `Scan & pay → Record a purchase` |
| Monthly dashboard: income, expenses, money saved, remaining budget, top categories, daily + monthly charts, comparison with last month | `Home` |
| Supportive insights (positive, warning, improvement, neutral). Never shaming | `Home` and `server/src/services/insights.js` |
| Monthly limit, category budgets, savings goals with progress and add-funds | `Budget` |
| Donut, bar, line and budget-vs-actual charts, highest/lowest categories, "why you spend" split. All from stored data | `Analytics` |
| 7 lessons with quizzes (answers checked on the server). Users set their own priorities | `Learn`, `Settings` |
| Export all transactions as CSV | `Activity` / `Settings` |

## How payments work (important)

Moving money through UPI requires NPCI / bank approval, so SpendWise **does not hold or move money**. The flow is:

1. Scan the merchant's UPI QR. SpendWise validates it (`upi://pay?...`).
2. You enter the amount (if the QR has none), pick a category and a reason.
3. SpendWise opens your own UPI app (GPay, PhonePe, Paytm...) with the payment filled in.
4. Back in SpendWise you confirm it went through, and only then it's recorded.

UPI links open apps on a phone. On a computer, use **"I already paid"** or **Record a purchase**.
The camera needs **https** or **localhost**. Vercel gives you https automatically.

## Datasets

- `datasets/sample_transactions.csv`: 165 sample transactions over ~4 months (columns: `days_ago, type, amount, category, motive, merchant, note`). `npm run seed` shifts the dates so the data always ends today.
- `server/data/lessons.json`: the lessons and quiz content.

Real users start with an empty account. Charts are always calculated from the logged-in user's own rows in PostgreSQL.

## Tests

```bash
npm test          # server (Vitest + Supertest) and client (Vitest + React Testing Library)
```

## Deploy

1. **Database:** create a managed PostgreSQL (Render, Neon, Supabase).
2. **API (Render or Railway):** root directory `server`, build `npm install`, start `npm start`.
   Environment: `DATABASE_URL`, `DATABASE_SSL=true`, `JWT_SECRET` (long random), `CLIENT_ORIGIN` (your Vercel URL).
3. **Frontend (Vercel):** root directory `client`, framework Vite.
   Environment: `VITE_API_URL=https://YOUR-API.onrender.com/api`.

## Project layout

```
spendwise/
├─ client/            React + Vite app (pages, components, charts, styles)
├─ server/            Express API (routes, services, schema.sql, seed, tests)
├─ datasets/          sample_transactions.csv
├─ scripts/           setup + dev helpers
└─ docker-compose.yml PostgreSQL for local development
```

## Security notes

Passwords are hashed with bcrypt, every query is parameterised, private routes need a signed JWT (7 days), auth routes are rate-limited, and helmet + CORS are enabled.
The token is kept in `localStorage` for simplicity. For a production launch consider httpOnly cookies, email verification and password reset.
