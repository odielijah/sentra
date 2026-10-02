import type { ActivityEvent, LogEntry, ServiceSnapshot, TelemetryPayload } from '@/types/dashboard'

const services = [
  { id: 'api-gateway', name: 'API Gateway', region: 'us-east-1' },
  { id: 'auth-core', name: 'Auth Core', region: 'eu-west-1' },
  { id: 'billing-worker', name: 'Billing Worker', region: 'us-west-2' },
  { id: 'stream-ingest', name: 'Stream Ingest', region: 'ap-south-1' },
  { id: 'search-index', name: 'Search Index', region: 'eu-central-1' },
  { id: 'edge-cache', name: 'Edge Cache', region: 'global' },
]

let sequence = 0
let baseCpu = 46
let baseMemory = 58
let baseLatency = 118
let baseThroughput = 1280
let baseErrors = 1.8

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const jitter = (amount: number) => (Math.random() - 0.5) * amount
const round = (value: number, places = 1) => Number(value.toFixed(places))

const pick = <T>(items: readonly T[]): T => {
  const item = items[Math.floor(Math.random() * items.length)]
  if (item === undefined) throw new Error('Cannot pick from an empty array')
  return item
}

function nextSeverity(cpu: number, memory: number, latency: number, errors: number) {
  if (cpu > 86 || memory > 88 || latency > 260 || errors > 7) return 'critical'
  if (cpu > 72 || memory > 76 || latency > 190 || errors > 4) return 'warning'
  return 'info'
}

export function generateMockPayload(): TelemetryPayload {
  sequence += 1

  const spike = sequence % 31 === 0 ? Math.random() * 18 : 0
  baseCpu = clamp(baseCpu + jitter(8) + spike * 0.4, 18, 96)
  baseMemory = clamp(baseMemory + jitter(5) + spike * 0.25, 28, 94)
  baseLatency = clamp(baseLatency + jitter(34) + spike * 5, 46, 340)
  baseThroughput = clamp(baseThroughput + jitter(220) - spike * 16, 520, 2450)
  baseErrors = clamp(baseErrors + jitter(1.1) + spike * 0.12, 0, 11)

  const timestamp = Date.now()
  const snapshots: ServiceSnapshot[] = services.map((service, index) => {
    const cpu = clamp(baseCpu + jitter(18) + index * 1.4, 5, 99)
    const memory = clamp(baseMemory + jitter(14), 10, 98)
    const latency = clamp(baseLatency + jitter(80) + index * 7, 25, 430)
    const throughput = clamp(baseThroughput + jitter(360) - index * 42, 120, 3000)
    const errors = clamp(baseErrors + jitter(3), 0, 18)

    return {
      ...service,
      cpu: round(cpu),
      memory: round(memory),
      latency: Math.round(latency),
      throughput: Math.round(throughput),
      errors: round(errors),
      status: nextSeverity(cpu, memory, latency, errors),
    }
  })

  const focus = pick(snapshots)
  const severity = focus.status
  const message =
    severity === 'critical'
      ? `${focus.name} breached latency/error budget`
      : severity === 'warning'
        ? `${focus.name} showing elevated resource pressure`
        : `${focus.name} heartbeat normal`

  const event: ActivityEvent = {
    id: `evt-${timestamp}-${sequence}`,
    timestamp,
    severity,
    service: focus.name,
    message,
  }

  const log: LogEntry = {
    ...event,
    id: `log-${timestamp}-${sequence}`,
    region: focus.region,
    code: severity === 'critical' ? 'SLO_BREACH' : severity === 'warning' ? 'RESOURCE_WARN' : 'HEALTH_OK',
  }

  return {
    timestamp,
    metrics: {
      timestamp,
      cpu: round(baseCpu),
      memory: round(baseMemory),
      latency: Math.round(baseLatency),
      throughput: Math.round(baseThroughput),
      errors: round(baseErrors),
    },
    services: snapshots,
    event,
    log,
  }
}

export function generateMalformedPayload(): unknown {
  return Math.random() > 0.5
    ? { timestamp: Date.now(), metrics: { cpu: 'hot' } }
    : { type: 'telemetry', services: null, event: '<script>alert(1)</script>' }
}
