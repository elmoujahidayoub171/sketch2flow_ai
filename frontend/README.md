# Sketch2Flow frontend

The V1 visual workflow builder lives here. It is intentionally client-only and uses React Flow for the editor surface; no AI, n8n runtime, or backend service is required.

## Run locally

```bash
npm install
npm run dev
```

## Run with Docker

From the repository root:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Stop the container with:

```bash
docker compose down
```
