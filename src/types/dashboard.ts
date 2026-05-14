export type Severity = 'info' | 'warning' | 'critical'

export type TimeRange = '1m' | '5m' | '15m' | '1h'

export type ChartMode = 'line' | 'area'

export type MetricKey = 'cpu' | 'memory' | 'latency' | 'throughput' | 'errors'

export interface ChartPoint {
  timestamp: number
  cpu: number
  memory: number
  latency: number
  throughput: number
  errors: number
}

export interface ServiceSnapshot {
  id: string
  name: string
  region: string
  cpu: number
  memory: number
  latency: number
  throughput: number
  errors: number
  status: Severity
}

export interface ActivityEvent {
  id: string
  timestamp: number
  severity: Severity
  service: string
  message: string
}

export interface LogEntry extends ActivityEvent {
  region: string
  code: string
}

export interface TelemetryPayload {
  timestamp: number
  metrics: ChartPoint
  services: ServiceSnapshot[]
  event: ActivityEvent
  log: LogEntry
}

export interface MetricCardModel {
  key: MetricKey
  label: string
  value: number
  unit: string
  trend: number
  tone: Severity
}

export interface ConnectionState {
  status: 'connecting' | 'live' | 'paused' | 'reconnecting' | 'error'
  lastMessageAt: number | null
  attempts: number
  error: string | null
}
