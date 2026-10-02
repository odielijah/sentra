import type { ChartMode, MetricKey, Severity, TimeRange } from '@/types/dashboard'

export const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
]

export const metricOptions: { label: string; value: MetricKey }[] = [
  { label: 'CPU', value: 'cpu' },
  { label: 'Mem', value: 'memory' },
  { label: 'Latency', value: 'latency' },
  { label: 'RPM', value: 'throughput' },
  { label: 'Errors', value: 'errors' },
]

export const severityOptions: { label: string; value: Severity | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Info', value: 'info' },
  { label: 'Warn', value: 'warning' },
  { label: 'Crit', value: 'critical' },
]

export const chartModeOptions: { label: string; value: ChartMode }[] = [
  { label: 'Line', value: 'line' },
  { label: 'Area', value: 'area' },
]

export const metricLabels: Record<MetricKey, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  latency: 'Latency',
  throughput: 'Throughput',
  errors: 'Errors',
}

export const metricColors: Record<MetricKey, string> = {
  cpu: '#38bdf8',
  memory: '#a78bfa',
  latency: '#f59e0b',
  throughput: '#22c55e',
  errors: '#fb7185',
}

export const areaChartLabels: Record<MetricKey, string> = {
  cpu: 'CPU saturation',
  memory: 'Memory pressure',
  latency: 'Latency envelope',
  throughput: 'Request volume',
  errors: 'Error density',
}

export const severityToneClass: Record<Severity, string> = {
  info: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-rose-400',
}
