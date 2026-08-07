# SOPFlow

SOPFlow is a TypeScript web application with a TanStack Start frontend, a NestJS backend, Prisma, and MariaDB.

## Local Docker Compose

1. Create a local environment file from the safe template:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env` and set real values for the database passwords, JWT secrets, and production URL values.

3. Validate and run the stack:

   ```sh
   docker compose --env-file .env config
   docker compose --env-file .env build
   docker compose --env-file .env up -d
   ```

4. Open the frontend through the exposed Compose service port if you bind one locally, or inspect it with:

   ```sh
   docker compose --env-file .env ps
   docker compose --env-file .env logs -f frontend backend
   ```

5. Stop the stack:

   ```sh
   docker compose --env-file .env down
   ```

## MyPaas Deployment

- Deployment mode: `Docker Compose`
- Compose file: `compose.yml`
- Main service: `frontend`
- App port: `3000`

The public HTTP service is `frontend`. It runs Nginx on container port `3000`, proxies `/api/` to `backend:3001`, and serves the TanStack Start app through an internal SSR process on `127.0.0.1:4173`.

Required environment keys:

```dotenv
DB_ROOT_PASSWORD=
DB_NAME=sop_biro_organisasi
DB_USER=sop_app
DB_PASSWORD=
JWT_SECRET=
JWT_REFRESH_SECRET=
PUBLIC_APP_ORIGIN=https://your-domain.example
ALLOWED_ORIGINS=https://your-domain.example
```

Optional keys are listed in `.env.example`, including seed control, Swagger, PDF signing, and WhatsApp/WAHA reminder settings.
