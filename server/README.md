# NestJS Authentication API

A NestJS REST API for user registration and authentication. It uses PostgreSQL, TypeORM, Passport, and JWT access tokens, with refresh sessions stored in the database and refresh tokens held in an HTTP-only cookie.

## Features

- User registration and login with email and password
- Password hashing with bcrypt
- Short-lived JWT access tokens and rotating refresh tokens
- Refresh-session revocation on logout
- Role metadata and a global roles guard for protected endpoints
- Request validation, request IDs, consistent success and error responses
- Swagger API documentation

## Requirements

- Node.js (a current LTS release)
- npm
- PostgreSQL

## Setup

Install the dependencies:

```bash
npm install
```

Copy `.env.example` to `.env`, then update the database credentials and secrets:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
DB_DATABASE=nest_auth

JWT_ACCESS_SECRET=replace_with_a_random_secret_of_at_least_32_bytes
JWT_REFRESH_SECRET=replace_with_a_different_random_secret_of_at_least_32_bytes
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

NODE_ENV=development
PORT=3003
FRONTEND_ORIGIN=http://localhost:5173
```

Use distinct, randomly generated secrets of at least 32 bytes. The API requires both JWT secrets and TTL values when it starts. The defaults for `PORT` and `FRONTEND_ORIGIN` are `3003` and `http://localhost:5173`.

Create the configured PostgreSQL database, then apply the migrations:

```bash
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
```

The migrations create the users and refresh sessions tables. Schema synchronization is disabled; apply migrations when setting up a database.

## Run the API

```bash
# Development
npm run start:dev

# Standard start
npm run start

# Production (after building)
npm run build
npm run start:prod
```

The API listens on `http://localhost:3003` by default. Application routes use the `/api` prefix. Swagger documentation is available at `http://localhost:3003/docs`.

## Authentication endpoints

| Method | Path | Description | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Register a user | Public |
| `POST` | `/api/auth/login` | Log in and issue tokens | Public |
| `POST` | `/api/auth/refresh` | Rotate the refresh token and issue a new access token | Refresh cookie |
| `POST` | `/api/auth/logout` | Revoke the current refresh session and clear its cookie | Public |
| `GET` | `/api/auth/profile` | Get the current user's profile | Bearer access token |
| `POST` | `/api/users/signup` | Register a user through the users route | Public |
| `GET` | `/api/users/profile` | Get the current user's profile | Bearer access token |

The signup body is:

```json
{
  "username": "Taylor",
  "email": "taylor@example.com",
  "password": "StrongPassword1!"
}
```

Passwords must be 8–72 characters and contain uppercase and lowercase letters, a number, and a special character. User roles are assigned by the server; new registrations receive the `user` role.

Log in with an email and password:

```json
{
  "email": "taylor@example.com",
  "password": "StrongPassword1!"
}
```

The login and refresh responses include an `accessToken` and `tokenType`. The refresh token is set as an HTTP-only, `SameSite=Strict` cookie scoped to `/api/auth`; it is not returned in the response body. In production the cookie is marked `Secure`. Send the access token on protected requests:

```http
Authorization: Bearer <accessToken>
```

The refresh cookie must be included when calling `/api/auth/refresh` and `/api/auth/logout`. Browser clients should send requests with credentials enabled. The API's CORS origin is configured by `FRONTEND_ORIGIN`.

Successful responses use a common envelope containing `success`, `statusCode`, `message`, `data`, `timestamp`, `path`, and `requestId`. Errors use a corresponding error envelope; validation errors include an `errors` array.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile the application |
| `npm run lint` | Lint source and test files |
| `npm run format` | Format TypeScript source and tests |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run unit tests with coverage |

## Project layout

```text
src/
├── auth/          # Signup, login, JWT strategies, guards, refresh sessions
├── common/        # Request IDs, response formatting, and exception handling
├── config/        # TypeORM configuration
├── database/      # TypeORM data source and migrations
└── users/         # User entity, service, DTOs, and controller
test/              # End-to-end tests
```
