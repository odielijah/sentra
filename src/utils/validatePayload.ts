import type {
  ActivityEvent,
  ChartPoint,
  LogEntry,
  ServiceSnapshot,
  Severity,
  TelemetryPayload,
} from '@/types/dashboard'

const severities: Severity[] = ['info', 'warning', 'critical']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const sanitizeText = (value: unknown, fallback = 'unknown') =>
  String(typeof value === 'string' || typeof value === 'number' ? value : fallback)
    .replace(/[<>]/g, '')
    .slice(0, 120)

const numberInRange = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

const severityOf = (value: unknown): Severity =>
  severities.includes(value as Severity) ? (value as Severity) : 'info'

function validatePoint(value: unknown): ChartPoint | null {
  if (!isRecord(value)) return null

  return {
    timestamp: numberInRange(value.timestamp, Date.now(), 0, Date.now() + 60_000),
    cpu: numberInRange(value.cpu, 0, 0, 100),
    memory: numberInRange(value.memory, 0, 0, 100),
    latency: numberInRange(value.latency, 0, 0, 1_000),
    throughput: numberInRange(value.throughput, 0, 0, 10_000),
    errors: numberInRange(value.errors, 0, 0, 100),
  }
}

function validateService(value: unknown): ServiceSnapshot | null {
  if (!isRecord(value)) return null

  return {
    id: sanitizeText(value.id),
    name: sanitizeText(value.name),
    region: sanitizeText(value.region),
    cpu: numberInRange(value.cpu, 0, 0, 100),
    memory: numberInRange(value.memory, 0, 0, 100),
    latency: numberInRange(value.latency, 0, 0, 1_000),
    throughput: numberInRange(value.throughput, 0, 0, 10_000),
    errors: numberInRange(value.errors, 0, 0, 100),
    status: severityOf(value.status),
  }
}

function validateEvent(value: unknown): ActivityEvent | null {
  if (!isRecord(value)) return null

  return {
    id: sanitizeText(value.id, `evt-${Date.now()}`),
    timestamp: numberInRange(value.timestamp, Date.now(), 0, Date.now() + 60_000),
    severity: severityOf(value.severity),
    service: sanitizeText(value.service),
    message: sanitizeText(value.message, 'Telemetry update received'),
  }
}

function validateLog(value: unknown): LogEntry | null {
  if (!isRecord(value)) return null
  const event = validateEvent(value)
  if (!event) return null

  return {
    ...event,
    region: sanitizeText(value.region),
    code: sanitizeText(value.code, 'HEALTH_OK'),
  }
}

export function validateTelemetryPayload(value: unknown): TelemetryPayload | null {
  if (!isRecord(value)) return null

  const metrics = validatePoint(value.metrics)
  const event = validateEvent(value.event)
  const log = validateLog(value.log)
  const services = Array.isArray(value.services)
    ? value.services.map(validateService).filter((service): service is ServiceSnapshot => Boolean(service))
    : []

  if (!metrics || !event || !log || services.length === 0) return null

  return {
    timestamp: numberInRange(value.timestamp, Date.now(), 0, Date.now() + 60_000),
    metrics,
    services,
    event,
    log,
  }
}
