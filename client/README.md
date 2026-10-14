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

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:3003` by default. Set `BACKEND_URL` if the API runs elsewhere. For a deployed frontend, set `VITE_API_BASE_URL` to the API base URL, including `/api`.

Create a production build with `npm run build`.

## Roles

New signups receive the `user` role. The welcome screen uses the role returned by the authenticated profile endpoint. To see the admin welcome screen, assign an account the `admin` role in the database, then sign out and back in:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

The access token is kept in React memory only. The refresh token stays in the API's HTTP-only cookie.
