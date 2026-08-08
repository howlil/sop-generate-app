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

## Deployment on MyPaas

This repository is fully configured for deployment on a MyPaas self-hosted instance.

**MyPaas Settings:**
- **Deployment Mode:** Docker Compose
- **Main Service:** `frontend` (listens on `0.0.0.0:80` inside the container)

**Environment Variables:**
Copy the structure from `.env.example` and provide real values in the MyPaas project settings. Do **not** set a `PORT` or `APP_PORT` variable. The following keys are required:

```dotenv
DB_ROOT_PASSWORD=your-secure-db-root-password
DB_NAME=sop_biro_organisasi
DB_USER=sop_app
DB_PASSWORD=your-secure-db-password

JWT_SECRET=your-secret-at-least-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars

PUBLIC_APP_ORIGIN=https://sopflow.yourdomain.com
ALLOWED_ORIGINS=https://sopflow.yourdomain.com

RUN_DB_SEED_ON_START=true

WHAAPI_BASE_URL=https://whaapi.flobaze.com
WHAAPI_TOKEN=your-whaapi-token
WHAAPI_CHANNEL_ID=your-whaapi-channel-id

PDF_SIGNING_P12_BASE64=base64-encoded-p12-certificate
```

`RUN_DB_SEED_ON_START=true` runs `prisma db seed` after migrations during backend startup. Set it to `false` after initial setup if you do not want seed/demo data reconciled on every restart. Optional keys are listed in `.env.example`, including Swagger, in-app notifications, WhatsApp intervals, and PDF signing fields.
