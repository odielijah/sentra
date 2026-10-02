<script setup lang="ts">
import { computed, ref } from 'vue'
import { metricColors, metricLabels } from '@/constants/dashboard'
import type { ChartPoint, MetricKey } from '@/types/dashboard'
import PanelHeader from '@/components/dashboard/PanelHeader.vue'

const props = defineProps<{
  data: ChartPoint[]
  metrics: MetricKey[]
}>()

const width = 720
const height = 280
const padding = 34
const active = ref<ChartPoint | null>(null)

const normalizedData = computed(() => props.data.slice(-140))

const bounds = computed(() => {
  const values = normalizedData.value.flatMap((point) => props.metrics.map((metric) => point[metric]))
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 100)
  return { min, max: max === min ? min + 1 : max }
})

const xFor = (index: number) => {
  const count = Math.max(1, normalizedData.value.length - 1)
  return padding + (index / count) * (width - padding * 2)
}

const yFor = (value: number) => {
  const { min, max } = bounds.value
  const ratio = (value - min) / (max - min)
  return height - padding - ratio * (height - padding * 2)
}

const paths = computed(() =>
  props.metrics.map((metric) => ({
    metric,
    color: metricColors[metric],
    d: normalizedData.value
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point[metric])}`)
      .join(' '),
  })),
)

const inspect = (event: MouseEvent) => {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (event.clientX - rect.left - padding) / Math.max(1, rect.width - padding * 2)
  const index = Math.min(
    normalizedData.value.length - 1,
    Math.max(0, Math.round(ratio * (normalizedData.value.length - 1))),
  )
  active.value = normalizedData.value[index] ?? null
}
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25 sm:min-h-[360px]">
    <PanelHeader eyebrow="Primary Telemetry" title="Real-Time Line Chart">
      <div class="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 md:justify-end">
        <span v-for="path in paths" :key="path.metric" class="inline-flex items-center gap-1.5">
          <i class="h-2.5 w-2.5 rounded-full" :style="{ background: path.color }"></i>{{ metricLabels[path.metric] }}
        </span>
      </div>
    </PanelHeader>

    <div class="relative px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
      <svg
        class="block h-auto w-full"
        viewBox="0 0 720 280"
        role="img"
        aria-label="Live line chart"
        @mousemove="inspect"
        @mouseleave="active = null"
      >
        <defs>
          <pattern id="grid" width="72" height="56" patternUnits="userSpaceOnUse">
            <path d="M 72 0 L 0 0 0 56" fill="none" stroke="rgba(148,163,184,.16)" stroke-width="1" />
          </pattern>
        </defs>
        <rect width="720" height="280" fill="url(#grid)" />
        <path
          v-for="path in paths"
          :key="path.metric"
          :d="path.d"
          :stroke="path.color"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div
        v-if="active"
        class="absolute right-3 top-3 grid max-w-[calc(100%-1.5rem)] gap-1 rounded-lg border border-slate-200/80 bg-white/95 p-2 text-xs text-slate-700 shadow-xl dark:border-slate-700/70 dark:bg-slate-950/95 dark:text-slate-300 sm:right-5 sm:top-5 sm:min-w-[150px] sm:p-3"
      >
        <strong>{{ new Date(active.timestamp).toLocaleTimeString() }}</strong>
        <span v-for="metric in metrics" :key="metric">{{ metricLabels[metric] }}: {{ active[metric] }}</span>
      </div>
    </div>
  </section>
</template>
