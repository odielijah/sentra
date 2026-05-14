# Sentra — Real-Time Infrastructure Monitoring Dashboard

A high-performance, real-time analytics dashboard that visualizes live-streaming infrastructure telemetry. Built for the HNG Frontend Wizards Stage 5A challenge.

---

## Setup Instructions

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone the repository
git clone https://github.com/your-username/sentra.git
cd sentra

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`.

---

## Architecture Overview

```
src/
├── components/
│   ├── charts/
│   │   ├── AreaChart.vue       # Multi-metric area chart (SVG)
│   │   ├── BarChart.vue        # Histogram bar chart (SVG)
│   │   ├── ClusterLoad.vue     # Service pressure bars
│   │   └── LineChart.vue       # Multi-metric line chart with hover inspect (SVG)
│   └── dashboard/
│       ├── ActivityFeed.vue    # Live event feed with transitions
│       ├── DashboardControls.vue
│       ├── LogsTable.vue       # Responsive logs table with mobile card fallback
│       ├── MetricCard.vue      # KPI cards with trend indicators
│       ├── PanelHeader.vue     # Reusable panel header
│       └── SeverityBadge.vue   # Severity pill component
├── composables/
│   ├── useMockStream.ts        # Streaming simulation with reconnect logic
│   └── useTheme.ts             # Dark/light mode with system preference sync
├── constants/dashboard.ts      # Shared options, colors, labels
├── stores/dashboardStore.ts    # Pinia store — single source of truth
├── types/dashboard.ts          # TypeScript interfaces and union types
├── utils/
│   ├── generateMockData.ts     # Realistic telemetry payload generator
│   └── validatePayload.ts      # Runtime payload validation and sanitization
└── views/DashboardView.vue     # Root layout and component composition
```

The app follows a unidirectional data flow: the mock stream generates payloads → the store validates and ingests them → computed properties derive view-ready data → components render reactively.

---

## State Management Strategy

State is managed with a single **Pinia store** (`dashboardStore`). All streaming data, UI controls, and derived metrics live here.

- `shallowRef` is used for high-churn arrays (`points`, `services`, `events`, `logs`) so Vue's reactivity system doesn't deep-track every nested value on every update — only the array reference itself triggers re-renders.
- Derived data (`filteredPoints`, `filteredLogs`, `metricCards`, `systemHealth`) are `computed` properties that only recalculate when their specific dependencies change, not on every stream tick.
- UI state (time range, chart mode, selected metrics, search, severity filter) is stored as plain `ref` values and mutated through explicit store actions.

---

## Rendering Optimization Decisions

**requestAnimationFrame batching** — `useMockStream` doesn't call `store.ingest()` directly on every interval tick. Instead it schedules the update via `requestAnimationFrame`, so multiple rapid payloads within a single frame are collapsed into one render cycle. This prevents layout thrashing under high-frequency updates.

**Data windowing** — Chart components slice the points array (`slice(-120)` for area/line, `slice(-60)` for bar) before computing paths. The store itself caps total stored points at 720. This keeps SVG path computation bounded regardless of how long the stream runs.

**shallowRef for arrays** — Vue's deep reactivity on large arrays is expensive. Using `shallowRef` means Vue only reacts to array replacement (which is how the store always updates — `[...existing].slice(n)`) rather than tracking every element.

**TransitionGroup for feeds** — Activity feed and log entries use Vue's `TransitionGroup` for enter/leave animations instead of manual DOM manipulation, keeping animations on the compositor thread.

**SVG over canvas/library** — Charts are hand-rolled SVG. This avoids shipping a full charting library (~200kb+ for ECharts/Chart.js) and gives direct control over what triggers a re-render. The tradeoff is that complex chart features (axes, tooltips beyond hover, zoom) require more manual work.

---

## Data Streaming Approach

Streaming is simulated via `useMockStream`, a composable that runs a `setInterval` at 850ms intervals. Each tick:

1. Generates a realistic `TelemetryPayload` with correlated metric drift, occasional spikes, and per-service variance
2. Schedules the payload via `requestAnimationFrame` to batch within the current frame
3. Skips ingestion if the stream is paused

Roughly 2.5% of ticks intentionally emit malformed payloads to exercise the validation and error handling path. About 1.2% of ticks simulate a reconnection event with exponential backoff (capped at 4 seconds).

All incoming payloads pass through `validateTelemetryPayload` before touching the store. This function sanitizes strings (stripping `<>` to prevent XSS), clamps numbers to valid ranges, and drops the payload entirely if required fields are missing — returning `null` and incrementing the malformed payload counter instead of crashing.

---

## Trade-offs

**Raw SVG vs. charting library** — Hand-rolling SVG charts keeps the bundle lean and gives full control over rendering, but means features like axes labels, grid lines, and zoom are not implemented. For a production system, a library like ECharts would be more appropriate.

**Simulated stream vs. real WebSocket** — The mock stream covers all the UI states (connecting, live, paused, reconnecting, error) but real latency, backpressure, and message ordering issues wouldn't surface until connected to an actual backend.

**In-memory data only** — All telemetry is held in memory and lost on page refresh. A production implementation would persist recent data to IndexedDB or replay from a server-side buffer on reconnect.

**Fixed chart dimensions with SVG scaling** — Charts use a fixed `viewBox` and scale via CSS. This is simple and responsive but means bar/line density doesn't adapt to screen width — a narrow screen shows the same number of data points as a wide one, just smaller.
