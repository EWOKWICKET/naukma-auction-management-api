# NaUKMA Auction Management API

REST API for an auction platform built as a NaUKMA course final project.

## Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Framework    | Express.js 5 + TypeScript |
| ORM / DB     | Prisma 7 + PostgreSQL     |
| Auth         | JWT + bcrypt              |
| File Storage | Cloudinary CDN            |
| Email        | Nodemailer                |
| Scheduling   | node-cron                 |
| Validation   | Zod                       |

## Project Structure

```
src/
├── server.ts                          # Entry point — HTTP server + cron jobs
├── app.ts                             # Express app, middleware assembly
├── routes/index.ts                    # Aggregates all routers under /api
├── controllers/                       # HTTP request handlers
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   ├── items.controller.ts
│   ├── lots.controller.ts
│   └── bids.controller.ts
├── services/                          # Business logic
│   ├── auth.service.ts
│   ├── users.service.ts
│   ├── items.service.ts
│   ├── lots.service.ts
│   └── bids.service.ts
├── repositories/                      # Prisma data access layer
│   ├── user.repository.ts
│   ├── item.repository.ts
│   ├── lot.repository.ts
│   ├── bid.repository.ts
│   └── transaction.repository.ts
├── schemas/                           # Zod validation schemas
├── middlewares/                       # Auth, RBAC, validation, upload, error filter
├── errors/                            # Typed AppError subclasses (400–409)
├── jobs/                              # Background cron jobs
├── clients/                           # Cloudinary + Nodemailer clients
└── db/prisma.ts                       # Prisma client singleton
```

## Running Locally

```bash
npm install
docker compose up -d
npm run db:migrate
npm run dev
```

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path                           | Auth | Body                   |
| ------ | ------------------------------ | ---- | ---------------------- |
| POST   | `/auth/register`               | —    | `{email, password}`    |
| POST   | `/auth/verify-email?token=JWT` | —    | —                      |
| POST   | `/auth/login`                  | —    | `{email, password}`    |
| POST   | `/auth/request-password-reset` | —    | `{email}`              |
| POST   | `/auth/reset-password`         | —    | `{token, newPassword}` |

### Users

| Method | Path                | Role  | Notes                                                           |
| ------ | ------------------- | ----- | --------------------------------------------------------------- |
| GET    | `/users/me`         | Any   | Own profile                                                     |
| POST   | `/users/me/avatar`  | Any   | `multipart/form-data`, field: `avatar` (JPEG/PNG/WebP, max 5 MB) |
| DELETE | `/users/me/avatar`  | Any   | Removes from Cloudinary                                         |
| POST   | `/users/me/deposit` | Any   | `{amount}`                                                      |
| GET    | `/users/`           | Admin | List all users                                                  |
| GET    | `/users/:id`        | Admin | Get user by ID                                                  |

### Items

| Method | Path                 | Role  | Notes                                                   |
| ------ | -------------------- | ----- | ------------------------------------------------------- |
| POST   | `/items/`            | Any   | `{title, description}` — creates item in PENDING status |
| GET    | `/items/`            | Any   | Own items; admins see all                               |
| GET    | `/items/:id`         | Any   | Item details                                            |
| PATCH  | `/items/:id`         | Owner | `{title?, description?}` — PENDING only                 |
| DELETE | `/items/:id`         | Owner | PENDING only                                            |
| POST   | `/items/:id/image`   | Owner | `multipart/form-data`, field: `image`                   |
| POST   | `/items/:id/approve` | Admin | PENDING → APPROVED                                      |
| POST   | `/items/:id/reject`  | Admin | PENDING → REJECTED                                      |

### Lots

| Method | Path        | Auth                   | Notes                                      |
| ------ | ----------- | ---------------------- | ------------------------------------------ |
| GET    | `/lots/`    | —                      | All ACTIVE lots, sorted by `endTime` asc   |
| GET    | `/lots/:id` | —                      | Lot + item + seller + top 10 bids          |
| POST   | `/lots/`    | Owner of APPROVED item | `{itemId, startPrice, startTime, endTime}` |

### Bids

| Method | Path                 | Auth     | Notes                                   |
| ------ | -------------------- | -------- | --------------------------------------- |
| POST   | `/lots/:lotId/bids/` | Required | `{amount}` — must exceed `currentPrice` |
| GET    | `/lots/:lotId/bids/` | Required | All bids, sorted by amount desc         |

Bid within 10 min of `endTime` extends the lot by 10 min (sniper protection).

## Middleware

| Middleware           | Purpose                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `authenticate`       | Validates JWT, attaches `req.user = {id, role}`                                           |
| `requireRole(ADMIN)` | Returns 403 if the user's role doesn't match                                              |
| `validate(schema)`   | Runs Zod validation on `req.body`, returns 400 with field errors on failure               |
| `upload`             | Multer in-memory storage, 5 MB limit, JPEG/PNG/WebP only                                  |
| `exceptionFilter`    | Global error handler — maps `AppError` subclasses to HTTP status codes, falls back to 500 |

## Background Jobs

| Job                               | Schedule     | Action                                                                                                                                             |
| --------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settle-lots.job.ts`              | Every minute | Finds expired ACTIVE lots and settles them: transfers funds to seller, marks item as SOLD, sets lot to COMPLETED. Lots with no bids are CANCELLED. |
| `cleanup-unverified-users.job.ts` | Every hour   | Deletes accounts that were registered but never verified within 24 hours.                                                                          |
