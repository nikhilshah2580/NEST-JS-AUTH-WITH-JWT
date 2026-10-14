# Northstar Auth UI

React and Tailwind frontend for the NestJS authentication API.

## Local development

Start PostgreSQL and the API first:

```bash
cd server
npm install
npm run start:dev
```

Then start the frontend:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The development server proxies `/api` to
`http://localhost:3003` by default. Set `BACKEND_URL` if the API runs elsewhere.

## Production deployment

Build the frontend with `npm run build`, then deploy the contents of `dist/` to
a static hosting service. Enable its single page application fallback so direct
requests to `/profile`, `/signin`, and other routes serve `index.html`.
`npm start` previews an existing build; it does not build or provide a
production static hosting service.

Set `VITE_API_URL` to the API base URL, including `/api`, before building. Vite
embeds this value in the browser bundle, so changing it after the build has no
effect. Never put secrets in `VITE_*` variables.

Set the API's `FRONTEND_ORIGIN` to the exact deployed frontend origin and run
the API with `NODE_ENV=production` behind HTTPS. The refresh token uses an
HTTP-only, secure, `SameSite=Strict` cookie. Host the frontend and API on the
same site (such as `app.example.com` and `api.example.com`) for browser cookie
compatibility. Deployments on unrelated domains need deliberate cookie, CORS,
and CSRF configuration before they can restore sessions.

## Frontend structure

- `src/api/` configures API requests and the authentication endpoints.
- `src/auth/AuthContext.jsx` restores and manages the signed-in session.
- `src/components/` contains shared UI, the auth form, and the route guard.
- `src/pages/` contains the home, signup, signin, and profile routes.

New signups receive the `user` role. The profile screen displays the role from
the authenticated API response. The access token stays in memory; the refresh
token remains in the API's HTTP-only cookie.
