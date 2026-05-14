import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type {
  ChartMode,
  ChartPoint,
  ConnectionState,
  LogEntry,
  MetricCardModel,
  MetricKey,
  Severity,
  ServiceSnapshot,
  TelemetryPayload,
  TimeRange,
  ActivityEvent,
} from '@/types/dashboard'
import { validateTelemetryPayload } from '@/utils/validatePayload'

const maxPoints = 720
const maxEvents = 140
const maxLogs = 220
const rangeMs: Record<TimeRange, number> = {
  '1m': 60_000,
  '5m': 300_000,
  '15m': 900_000,
  '1h': 3_600_000,
}

const metricMeta: Record<MetricKey, { label: string; unit: string }> = {
  cpu: { label: 'CPU Load', unit: '%' },
  memory: { label: 'Memory', unit: '%' },
  latency: { label: 'P95 Latency', unit: 'ms' },
  throughput: { label: 'Throughput', unit: 'rpm' },
  errors: { label: 'Error Rate', unit: '%' },
}

const toneForMetric = (key: MetricKey, value: number): Severity => {
  if (key === 'latency') return value > 260 ? 'critical' : value > 180 ? 'warning' : 'info'
  if (key === 'throughput') return value < 760 ? 'critical' : value < 980 ? 'warning' : 'info'
  if (key === 'errors') return value > 7 ? 'critical' : value > 4 ? 'warning' : 'info'
  return value > 86 ? 'critical' : value > 72 ? 'warning' : 'info'
}

const trim = <T>(items: T[], limit: number) => items.slice(0, limit)

export const useDashboardStore = defineStore('dashboard', () => {
  const points = shallowRef<ChartPoint[]>([])
  const services = shallowRef<ServiceSnapshot[]>([])
  const events = shallowRef<ActivityEvent[]>([])
  const logs = shallowRef<LogEntry[]>([])
  const selectedMetrics = ref<MetricKey[]>(['cpu', 'memory', 'latency'])
  const timeRange = ref<TimeRange>('5m')
  const chartMode = ref<ChartMode>('line')
  const paused = ref(false)
  const severityFilter = ref<Severity | 'all'>('all')
  const search = ref('')
  const invalidPayloads = ref(0)
  const connection = ref<ConnectionState>({
    status: 'connecting',
    lastMessageAt: null,
    attempts: 0,
    error: null,
  })

  const filteredPoints = computed(() => {
    const since = Date.now() - rangeMs[timeRange.value]
    return points.value.filter((point) => point.timestamp >= since)
  })

  const latestPoint = computed(() => points.value.at(-1) ?? null)

  const metricCards = computed<MetricCardModel[]>(() => {
    const latest = latestPoint.value
    const previous = points.value.at(-12) ?? points.value.at(0)
    const keys: MetricKey[] = ['cpu', 'memory', 'latency', 'throughput', 'errors']

    return keys.map((key) => {
      const value = latest?.[key] ?? 0
      const oldValue = previous?.[key] ?? value
      return {
        key,
        label: metricMeta[key].label,
        value,
        unit: metricMeta[key].unit,
        trend: value - oldValue,
        tone: toneForMetric(key, value),
      }
    })
  })

  const filteredLogs = computed(() => {
    const needle = search.value.trim().toLowerCase()
    return logs.value.filter((log) => {
      const severityMatches =
        severityFilter.value === 'all' || log.severity === severityFilter.value
      const searchMatches =
        !needle ||
        `${log.severity} ${log.service} ${log.message} ${log.region} ${log.code}`
          .toLowerCase()
          .includes(needle)
      return severityMatches && searchMatches
    })
  })

  const systemHealth = computed(() => {
    const critical = services.value.filter((service) => service.status === 'critical').length
    const warning = services.value.filter((service) => service.status === 'warning').length
    if (critical > 0) return 'critical'
    if (warning > 1) return 'warning'
    return 'info'
  })

  function ingest(payload: unknown) {
    const validPayload: TelemetryPayload | null = validateTelemetryPayload(payload)
    if (!validPayload) {
      invalidPayloads.value += 1
      connection.value = {
        ...connection.value,
        status: 'error',
        error: 'Malformed telemetry payload dropped',
      }
      return
    }

    points.value = [...points.value, validPayload.metrics].slice(-maxPoints)
    services.value = validPayload.services
    events.value = trim([validPayload.event, ...events.value], maxEvents)
    logs.value = trim([validPayload.log, ...logs.value], maxLogs)
    connection.value = {
      status: paused.value ? 'paused' : 'live',
      lastMessageAt: validPayload.timestamp,
      attempts: 0,
      error: null,
    }
  }

  function setPaused(value: boolean) {
    paused.value = value
    connection.value = {
      ...connection.value,
      status: value ? 'paused' : 'live',
    }
  }

  function setConnection(status: ConnectionState['status'], error: string | null = null) {
    connection.value = {
      ...connection.value,
      status,
      attempts:
        status === 'reconnecting' ? connection.value.attempts + 1 : connection.value.attempts,
      error,
    }
  }

  function setTimeRange(value: TimeRange) {
    timeRange.value = value
  }

  function setChartMode(value: ChartMode) {
    chartMode.value = value
  }

  function toggleMetric(metric: MetricKey) {
    selectedMetrics.value = selectedMetrics.value.includes(metric)
      ? selectedMetrics.value.filter((item) => item !== metric)
      : [...selectedMetrics.value, metric]
  }

  return {
    chartMode,
    connection,
    events,
    filteredLogs,
    filteredPoints,
    ingest,
    invalidPayloads,
    logs,
    metricCards,
    paused,
    points,
    search,
    selectedMetrics,
    services,
    setChartMode,
    setConnection,
    setPaused,
    setTimeRange,
    severityFilter,
    systemHealth,
    timeRange,
    toggleMetric,
  }
})
