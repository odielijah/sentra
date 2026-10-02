<script setup lang="ts">
import { computed } from 'vue'
import { areaChartLabels, metricColors } from '@/constants/dashboard'
import type { ChartPoint, MetricKey } from '@/types/dashboard'
import PanelHeader from '@/components/dashboard/PanelHeader.vue'

const props = defineProps<{
  data: ChartPoint[]
  metric: MetricKey
  metrics?: MetricKey[]
}>()

const activeMetrics = computed(() => (props.metrics?.length ? props.metrics : [props.metric]))

const width = 720
const height = 220
const padding = 30

const series = computed(() => props.data.slice(-120))

const xFor = (index: number) =>
  padding + (index / Math.max(1, series.value.length - 1)) * (width - padding * 2)

const maxFor = (metric: MetricKey) => Math.max(...series.value.map((point) => point[metric]), 100)

const yFor = (value: number, metric: MetricKey) =>
  height - padding - (value / maxFor(metric)) * (height - padding * 2)

const linePathFor = (metric: MetricKey) =>
  series.value
    .map(
      (point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point[metric], metric)}`,
    )
    .join(' ')

const areaPathFor = (metric: MetricKey) => {
  if (!series.value.length) return ''
  return `${linePathFor(metric)} L ${xFor(series.value.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`
}
</script>

<template>
  <section
    class="min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25 sm:min-h-[286px]"
  >
    <PanelHeader
      eyebrow="Capacity Envelope"
      :title="activeMetrics.length === 1 ? areaChartLabels[activeMetrics[0]!] : 'Multi-Metric View'"
    />
    <div class="relative px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
      <svg
        class="block h-auto w-full"
        viewBox="0 0 720 220"
        role="img"
        aria-label="Live area chart"
      >
        <template v-for="m in activeMetrics" :key="m">
          <path :d="areaPathFor(m)" :fill="metricColors[m]" opacity=".18" />
          <path
            :d="linePathFor(m)"
            :stroke="metricColors[m]"
            fill="none"
            stroke-width="3"
            stroke-linejoin="round"
          />
        </template>
      </svg>
    </div>
  </section>
</template>
