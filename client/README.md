# Northstar Auth UI

A React and Tailwind CSS frontend for the NestJS authentication API.

## Run locally

Start PostgreSQL and the API first:

```bash
cd server
npm install
npm run start:dev
```

In another terminal, start the frontend:

```bash
cd client
npm install
npm start
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:3003` by default. Set `BACKEND_URL` if the API runs elsewhere. For a deployed frontend, set `VITE_API_URL` to the API base URL, including `/api`.

Create a production build with `npm run build`.

## Frontend structure

- `src/api/apiClient.js` configures Axios, credentials, bearer tokens, and refresh retries.
- `src/api/authApi.js` contains the authentication endpoint functions.
- `src/auth/AuthContext.jsx` restores and manages the signed-in session.
- `src/components/` contains the shared navbar, auth form, and route guards.
- `src/pages/` contains the home, signup, signin, and profile routes.

Routes are `/`, `/signup`, `/signin`, and the authenticated `/profile`.

## Roles

New signups receive the `user` role. The welcome screen uses the role returned by the authenticated profile endpoint. To see the admin welcome screen, assign an account the `admin` role in the database, then sign out and back in:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

The access token is kept in React memory only. The refresh token stays in the API's HTTP-only cookie.
