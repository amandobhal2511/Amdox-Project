# AI Cloud ERP Suite — Backend API

Production-ready REST API backend for the AI-Powered Cloud ERP Suite built with **Node.js**, **Express.js**, and **PostgreSQL**.

## Tech Stack

- Node.js + Express.js
- PostgreSQL (SQL database)
- JWT Authentication + Session Management
- bcrypt password hashing
- Role-based access control (RBAC)
- Helmet, CORS, Rate Limiting
- MVC architecture (Routes → Controllers → Services)

## Folder Structure

```
backend/
├── controllers/     # Request handlers
├── routes/          # API route definitions
├── middleware/      # Auth, validation, error handling
├── config/          # Database, session, env config
├── database/        # SQL schema, init & seed scripts
├── services/        # Business logic layer
├── utils/           # Helpers, validators, permissions
├── app.js           # Express app setup
├── server.js        # Server entry point
├── package.json
└── .env
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Edit `.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_suite
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_long_random_jwt_secret
SESSION_SECRET=your_long_random_session_secret
```

### 3. Create database

```sql
CREATE DATABASE erp_suite;
```

### 4. Initialize schema & seed data

```bash
npm run db:init
npm run db:seed
```

### 5. Start server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:5000**

## Default Admin Account

After seeding:

| Email | Password | Role |
|-------|----------|------|
| admin@erp.com | admin123 | Admin |

## API Endpoints

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/auth/logout` | Logout & destroy session |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Live analytics stats |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List (search, filter) |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List products |
| POST | `/api/inventory` | Add product |
| PUT | `/api/inventory/:id` | Update product |
| DELETE | `/api/inventory/:id` | Delete product |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance` | List transactions |
| GET | `/api/finance/summary` | Revenue, expense, profit |
| POST | `/api/finance` | Add transaction |
| PUT | `/api/finance/:id` | Update transaction |
| DELETE | `/api/finance/:id` | Delete transaction |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order/status |
| DELETE | `/api/orders/:id` | Delete order |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications` | Create notification |
| PUT | `/api/notifications/:id` | Update notification |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update settings |

## Role Permissions

| Role | Access |
|------|--------|
| Admin | All modules |
| HR | Dashboard, Employees, Notifications, Settings |
| Finance | Dashboard, Finance, Orders, Notifications, Settings |
| Employee | Dashboard, Notifications, Settings |

## Example Requests

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"admin123"}'
```

### Get Dashboard Stats

```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Employee

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@company.com","department":"Engineering","salary":85000}'
```

## Frontend Integration

Update the frontend `App.API_BASE` in `erp-frontend/js/app.js`:

```javascript
const App = {
  API_BASE: 'http://localhost:5000/api',
  // ...
};
```

Then replace localStorage calls with `fetch()` using the JWT token from login response.

## Security Features

- bcrypt password hashing (12 rounds)
- JWT + database session validation
- Session expiry & auto cleanup
- SQL injection prevention (parameterized queries)
- Helmet security headers
- CORS whitelist
- Rate limiting (auth: 20/15min, general: 200/15min)
- Input validation (express-validator)
- Role-based authorization

## License

MIT
