# EkonStat-Dashboard

[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vue 3](https://img.shields.io/badge/vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Key Features](#key-features)
4. [Architecture](#architecture)
5. [Run Modes](#run-modes)
6. [Data Fetching and Filtering](#data-fetching-and-filtering)
7. [Internationalization and Preferences](#internationalization-and-preferences)
8. [Environment Variables](#environment-variables)
9. [Deployment Notes](#deployment-notes)
10. [Scripts](#scripts)
11. [License](#license)

## Introduction

EkonStat-Dashboard is a public-facing frontend dashboard for browsing and visualizing publicly available economic and financial data for Macedonia.

Official public instance:

- https://ekonstat.nkvtd.com

It consumes the [EkonStat-API](https://github.com/nkvtd/EkonStat-API) and provides:

- A landing page with dataset entry points
- Searchable and filterable data across multiple dimensions
- Cursor-paginated infinite-loading tables
- Multi-locale and multi-currency preference support
- Dark/light theme with persisted user preferences

The stack is built around Vue 3, Vike, Vite, Tailwind CSS 4, TanStack Query, and TanStack Table.

<details>
  <summary><strong>What this project is optimized for</strong></summary>

- Public exploration of financial datasets
- Dense, filterable tables with stable cursor-based pagination
- Client-rendered performance with static pre-rendering at build time
- Containerized serving behind an Nginx reverse proxy

</details>

## Quick Start

### Prerequisites

- Node.js 24+
- npm

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/nkvtd/EkonStat-Dashboard.git
cd EkonStat-Dashboard
```

2. Install dependencies:

```bash
npm ci
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Configure the required environment values in `.env`:

```env
# Public API base URL used by the browser.
# Keep it as /api so the browser talks to the same-origin /api path.
VITE_API_BASE_URL=/api

# Target used by vite.config.ts for local/dev proxying.
# During development, the Vite dev server forwards /api requests here.
VITE_PROXY_TARGET=https://ekonstat.nkvtd.com
```

The `.env.example` file documents all available variables. See [Environment Variables](#environment-variables) for a full description of each variable and which runtime they apply to.

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or another port that Vite assigns). All `/api` requests from the browser are proxied by Vite to `VITE_PROXY_TARGET`.

## Key Features

| Feature | Description |
| --- | --- |
| Client-rendered SPA | Vue 3 with Composition API; no server-side rendering at runtime |
| Static pre-rendering | Build-time HTML generation for all pages via Vike (`prerender: true`) |
| File-system routing | Vike-based page routing with shared layout, head, and bootstrap hooks |
| Infinite-loading tables | Cursor-based paginated lists powered by TanStack Query's `useInfiniteQuery` |
| Rich filtering | Text, numeric range, date range, reference-data dropdowns, and boolean toggles |
| Detail drawers | Entity and contract detail side panels with related contract lists |
| Multi-locale i18n | Macedonian, English, and Albanian translations via vue-i18n |
| Currency switching | MKD and EUR display with fixed-rate conversion |
| Dark mode | Light/dark theme toggle persisted to `localStorage` |
| Containerized serving | Multi-stage Docker build with Nginx for static asset serving and API proxying |

## Architecture

EkonStat-Dashboard is a **client-rendered frontend** with Vike-based file-system routing and build infrastructure. It is not a backend service — it is a static SPA that communicates with the EkonStat API over HTTP.

```txt
Shared Shell
  -> components/ (header, footer, logo)

Page Layer
  -> pages/ (Vike route-level views)
  -> pages/+config.ts (global prerender, ssr, title)
  -> pages/+Layout.vue (root shell: header, page-transition loader, content slot)

Service Layer
  -> services/api.client.ts (Axios instance, interceptors)
  -> services/api.service.ts (health checks)
  -> services/contracts.service.ts (typed domain functions)
  -> services/types/ (request query and response models)
  -> services/util/ (currencyConverter, paramsCleaner)

Bootstrap
  -> pages/+onCreateApp.ts (QueryClient, i18n plugin installation)
```

### Key architectural decisions

| Decision | Detail |
| --- | --- |
| SSR disabled | `pages/+config.ts` sets `ssr: false`. All rendering happens in the browser. |
| Pre-rendering enabled | `pages/+config.ts` sets `prerender: true`. Static HTML is generated at build time. |
| API base URL | `VITE_API_BASE_URL` is set to `/api` so the browser makes same-origin requests. |
| Dev proxy | `vite.config.ts` reads `VITE_PROXY_TARGET` and proxies `/api` during local development. |
| Runtime proxy | In containerized deployments, Nginx proxies `/api` to `API_UPSTREAM`. |

## Run Modes

### Local Development

Use this mode for active coding with hot module replacement.

1. Install dependencies:

```bash
npm ci
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Set required values:

```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=https://ekonstat.nkvtd.com
```

- `VITE_API_BASE_URL` is the base URL the browser uses for API calls. Keep it as `/api` for same-origin requests.
- `VITE_PROXY_TARGET` is the backend target the Vite dev server forwards `/api` requests to during development.

4. Start the dev server:

```bash
npm run dev
```

The application runs at `http://localhost:5173`. The Vite dev server proxies all `/api` requests to `VITE_PROXY_TARGET`.

### Production Build

Use this mode to produce static build artifacts for deployment.

```bash
npm run build
```

Static output is written to `dist/client/`. These are pure static files (HTML, CSS, JS) — no Node.js server is launched. Serve the contents with any static file server. For SPA routing, ensure all non-file requests serve `index.html`.

Preview the production build locally:

```bash
npm run preview
```

### Containerized Run (Docker)

Use this mode to serve the built frontend through Nginx in a containerized environment.

The Docker setup uses a multi-stage build:

1. **Builder stage** — Node 24 Alpine. Installs dependencies, runs `npm run build`.
2. **Runtime stage** — Nginx 1.27 Alpine. Serves `dist/client/` and proxies `/api` requests.

Nginx is configured via `default.conf.template`:

- Serves static files with SPA fallback (`try_files $uri /index.html`).
- Proxies `/api/` requests to the value of `API_UPSTREAM`.

The compose file attaches the container to an external Docker network named `edge-proxy`. Ensure this network exists before starting:

```bash
docker network create edge-proxy || true
```

Run a reverse edge proxy on that network. Cloudflare Tunnel is a recommended example (official image):

```bash
docker run -d \
  --name cloudflared \
  --restart unless-stopped \
  --network edge-proxy \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token <YOUR_CLOUDFLARE_TUNNEL_TOKEN>
```

If you run your edge proxy from a separate compose project, ensure it also attaches to the same external `edge-proxy` network.

If the container already exists:

```bash
docker restart cloudflared
```

Build and run the dashboard:

```bash
API_UPSTREAM=http://app:8080 docker compose up --build
```

Notes:

- The container exposes port 80 internally. Access depends on your edge proxy configuration on the `edge-proxy` network.
- `API_UPSTREAM` should point to a service hostname reachable from the container on the Docker network.
- Docker is **not** required for standard frontend development. Use local development mode for coding.

## Data Fetching and Filtering

### API client

The `services/api.client.ts` module creates a configured Axios instance:

- Base URL from the compile-time `VITE_API_BASE_URL` environment variable (`/api`).
- 10-second request timeout.
- Response error interceptor that logs structured error reports (message, status, code, network error flag) and returns a normalized rejection.

### Typed service layer

API domain calls are organized into service modules under `services/`. Each module is structured around a domain area and defines typed functions for its endpoints. The two existing modules are:

- `services/api.service.ts` — health checks (`ping`, `ready`)
- `services/contracts.service.ts` — contract datasets organized into sub-areas (`stats`, `reference`, `contractors`, `institutions`, `awarded`, `realised`)

New domain modules follow the same pattern: place the service module in `services/` and its corresponding query and response types under `services/types/`.

Request query parameters are typed via interfaces that extend the shared `PaginationQuery` contract:

```ts
type PaginationQuery = {
    cursor?: string | null;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
};
```

Domain-specific query types add filter fields on top of this base — for example, `AwardedContractsQuery` adds numeric range, date range, text, and reference-data filters.

Response types live alongside their domain under `services/types/`. All list responses follow the shared `PaginatedList<T>` envelope:

```ts
type PaginatedList<T> = {
    data: T[];
    meta: {
        nextCursor: string | null;
        pageSize: number;
        hasMore: boolean;
    };
};
```

### Parameter cleaning

The `cleanParams` utility in `services/util/paramsCleaner.ts` strips `undefined`, `null`, and empty-string values from query objects before they are sent to the API. This prevents sending unnecessary or empty query parameters.

### Server state with TanStack Query

Pages use two primary TanStack Query patterns:

- **`useQuery`** — for one-off fetches: stats, reference data, contract details, change history.
- **`useInfiniteQuery`** — for paginated list endpoints: awarded contracts, realised contracts, institutions, contractors. Uses `getNextPageParam` to extract `nextCursor` from response metadata.

The global `QueryClient` is configured with:

| Option | Value |
| --- | --- |
| `staleTime` | 30 seconds |
| `retry` | 2 |
| `refetchOnWindowFocus` | `false` |

### Filtering behavior

Filters are implemented as reactive form state synchronized with query parameters through Vue watchers. When filter values change, the query is re-fetched with updated parameters.

Reference-data-driven dropdowns (procedure types, offer types, framework agreement types) are fetched once from `/api/contracts/reference` and cached via TanStack Query. Date filters use the shared `DatePicker` component.

On mobile viewports, filter panels render in an overlay/drawer layout with a slide-in animation.

### Pagination

All list endpoints use cursor-based pagination via the `PaginationQuery` type:

| Parameter | Type | Description |
| --- | --- | --- |
| `cursor` | `string \| null` | Opaque cursor from the previous response's `meta.nextCursor` |
| `pageSize` | `number` | Number of items per page |
| `sortBy` | `string` | Column to sort by (endpoint-dependent) |
| `sortDirection` | `"asc" \| "desc"` | Sort direction |

Tables implement infinite-loading: as the user scrolls near the bottom of the table, the next page is fetched automatically using `fetchNextPage` from `useInfiniteQuery`.

## Internationalization and Preferences

### Locales

The dashboard supports three locales:

| Code | Language | Default |
| --- | --- | --- |
| MK | Macedonian | Yes |
| EN | English | No |
| AL | Albanian | No |

Locale messages are JSON files stored under `i18n/`. The active locale is persisted in `localStorage` under the `lang` key. On startup, `setupI18n()` reads the stored preference and loads the corresponding messages. The language can be switched at runtime through the header dropdown; the change is immediately reflected in the UI.

### Theme

Light and dark themes are implemented through Tailwind CSS custom properties defined in `pages/tailwind.css`. The `dark` class is toggled on the `<html>` element. The current theme preference is stored in `localStorage` under the `theme` key (`"light"` or `"dark"`).

### Currency

Two display currencies are supported:

| Code | Description | Default |
| --- | --- | --- |
| MKD | Macedonian Denar | Yes |
| EUR | Euro | No |

Conversion uses a fixed exchange rate defined in `services/util/currencyConverter.ts` (`MKD_TO_EUR_RATE = 61.5`). The module provides:

- `convertFromMkd()` — converts a MKD amount to the selected currency
- `convertToMkd()` — reverse-converts an amount from the selected currency back to MKD
- `formatCurrency()` — formats an amount with locale-aware grouping and the currency suffix
- `formatSignedCurrencyDifference()` — formats a signed difference value

The selected currency is provided through the root layout via Vue's `provide`/`inject` API and persisted in `localStorage` under the `currency` key. Money filter inputs are interpreted in the user's selected currency and automatically converted to MKD before querying the API.

## Environment Variables

This project uses three environment variables. Each serves a distinct purpose and applies to a different runtime context. They are not interchangeable.

| Variable | Required | Context | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Browser (compile-time) | Public base URL the Axios client uses for API requests. **Keep it as `/api`** so the browser makes same-origin requests. This value is embedded in the client bundle at build time. |
| `VITE_PROXY_TARGET` | Dev only | Vite dev server | Backend target the Vite dev server proxies `/api` requests to during local development. Read by `vite.config.ts` via `loadEnv`. Not used in production builds or the browser. |
| `API_UPSTREAM` | Docker only | Nginx container runtime | Backend URL the Nginx container proxies `/api/` requests to. Injected into `default.conf.template` via `envsubst` at container startup. Passed through `docker-compose.yml`. Not used in local development. |

### Recommended `.env` for local development

```env
VITE_API_BASE_URL=/api
VITE_PROXY_TARGET=https://ekonstat.nkvtd.com
```

### Docker Compose usage

```bash
API_UPSTREAM=http://app:8080 docker compose up --build
```

The compose file passes `API_UPSTREAM` from the host environment (`${API_UPSTREAM}`) into the container.

## Deployment Notes

The project is deployed as a set of static files served behind Nginx.

- **Build artifacts** are written to `dist/client/` after `npm run build`. These are pure static files.
- **SPA routing** — All non-API, non-asset requests must serve `index.html`. The included `default.conf.template` handles this with `try_files $uri /index.html`.
- **API proxying** — In the containerized setup, Nginx proxies `/api/` to `API_UPSTREAM`. If deploying the static build without the Docker setup, you must configure your own reverse proxy for the `/api` path.
- **Docker network** — The compose file attaches to an external network named `edge-proxy`. Create it before starting: `docker network create edge-proxy || true`.
- **Pre-rendering** — The Vike config sets `prerender: true`, so static HTML is generated for all pages at build time where possible. This improves initial load performance and SEO for publicly crawlable pages.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server with HMR and API proxy |
| `npm run build` | Production build via Vike (output to `dist/client/`) |
| `npm run preview` | Build and serve the production output locally |
| `npm run lint` | Run Biome linter checks |
| `npm run lint:fix` | Run Biome linter and apply auto-fixes |
| `npm run format` | Format source files with Biome |

## License

This project is licensed under the MIT License.
