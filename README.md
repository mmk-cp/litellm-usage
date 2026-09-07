# PulseLLM

A production-oriented, full-stack LiteLLM usage dashboard. The browser talks only to a Next.js BFF; the Node.js API is the sole service allowed to call LiteLLM.

## Architecture

```text
Browser -> Next.js /api BFF -> Node.js API -> LiteLLM
```

- `apps/web`: Next.js App Router, Tailwind CSS, shadcn-style primitives, Recharts, TanStack Query
- `apps/api`: Express + TypeScript with controllers, services, clients, validators, configs, and middlewares
- `openapi.json` reference: LiteLLM 1.98.0; integration uses `/key/info`, `/spend/logs/v2`, `/key/spend/report`, and `/models`

## Key security model

The LiteLLM admin key exists only in the API process. A user key is sent once to `POST /api/keys/validate` through the same-origin Next.js BFF. After validation, the API encrypts it with AES-256-GCM and returns it only as an `HttpOnly`, `SameSite=Strict` cookie. JavaScript cannot read that cookie.

`localStorage` contains only non-secret metadata:

```json
[{ "id": "sha256-prefix", "name": "Production Bot", "maskedKey": "sk-********abcd" }]
```

The Node API requires `INTERNAL_API_SECRET`, and Docker Compose does not publish the API port. Never expose the API container directly to the internet.

## Local development

Requirements: Node.js 22+ and npm 9+.

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Generate secrets:

```bash
openssl rand -hex 32   # SESSION_ENCRYPTION_KEY
openssl rand -base64 32 # INTERNAL_API_SECRET (use the same value in both app env files)
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`. The API listens on `http://localhost:4000` for development only.

`NEXT_PUBLIC_API_URL` must remain a same-origin path such as `/api`; external values are ignored so browser traffic cannot bypass the BFF.

## Docker deployment

```bash
cp .env.example .env
# Fill in every secret in .env
docker compose up --build -d
```

Only port `3000` is published. Put a TLS reverse proxy in front of it so production cookies are sent over HTTPS.

## API

All endpoints return `{ "success": true, "data": ... }` or `{ "success": false, "message": "...", "errorCode": "..." }`.

- `POST /api/keys/validate`
- `DELETE /api/keys/:id`
- `GET /api/keys/:id/usage`
- `GET /api/keys/:id/requests?page=1&limit=25`
- `GET /api/keys/:id/models`
- `GET /api/keys/:id/costs`

Request filters: `startDate`, `endDate`, `model`, `status`, `minCost`, `maxCost`, `search`, `sortBy`, and `sortOrder`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The overview caps aggregation at 50,000 matching records to protect the service. The request table always uses LiteLLM's real pagination. A warning appears when the overview cap is reached.
