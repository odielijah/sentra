# Sentra

Sentra is a single-page Real-Time DevOps Monitoring Dashboard built with Vue 3, TypeScript, Pinia, and Vite. It simulates a production monitoring console with live infrastructure telemetry, metric cards, line/area/bar visualizations, searchable logs, filtering, pause/resume controls, and reconnect/error handling.

## Setup

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
```

## Architecture

- `src/stores/dashboardStore.ts` centralizes telemetry state, user filters, connection status, bounded history, and derived computed views.
- `src/composables/useMockStream.ts` simulates a live stream with requestAnimationFrame-throttled ingestion, pause/resume support, random reconnects, and cleanup on unmount.
- `src/composables/useTheme.ts` manages persisted light/dark mode with system preference fallback.
- `src/utils/generateMockData.ts` produces realistic DevOps telemetry for services, global metrics, alerts, and logs.
- `src/utils/validatePayload.ts` validates and sanitizes all incoming payloads before they reach UI state.
- `src/components/charts/*` contains reusable SVG chart components for line, area, and service-load bar visualizations.
- `src/components/dashboard/*` contains controls, metric cards, activity feed, and logs table.

## State Management Strategy

Pinia owns the live dashboard state. Streaming data is appended into bounded arrays to avoid unbounded memory growth. UI controls such as time range, chart mode, selected datasets, severity filter, and log search are stored centrally so every visualization reads from a consistent source of truth.

## Rendering And Performance

- Telemetry history is capped to 720 chart points, 140 activity events, and 220 log rows.
- Chart rendering uses lightweight SVG paths with sliced windows instead of rendering every historical point.
- Incoming stream updates are batched through `requestAnimationFrame`.
- Computed properties derive filtered time windows and searchable logs without duplicating state.
- Intervals, reconnect timers, and animation frames are cleaned up when the dashboard unmounts.
- Light/dark styling is handled with Tailwind utilities and a persisted root theme class.

## Streaming Approach

The app uses a mocked streaming generator to simulate WebSocket-style telemetry. It emits service snapshots every 850ms, occasionally sends malformed payloads to exercise validation, and randomly simulates connection interruptions with reconnect backoff.

## Resilience And Security

All incoming payloads are schema-checked, numeric fields are clamped, string fields are sanitized, and malformed payloads are dropped with visible dashboard feedback. The UI does not use unsafe HTML injection.

## Trade-Offs

The dashboard uses custom SVG charts instead of a heavier charting dependency. That keeps setup simple and rendering fast for the assignment, while still demonstrating line, area, and bar chart behavior. A production system could swap these components for ECharts, uPlot, or D3 if deeper chart interactions were required.
