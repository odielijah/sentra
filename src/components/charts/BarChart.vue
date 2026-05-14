<script setup lang="ts">
import { computed } from 'vue'
import { metricColors, metricLabels } from '@/constants/dashboard'
import type { ChartPoint, MetricKey } from '@/types/dashboard'
import PanelHeader from '@/components/dashboard/PanelHeader.vue'

const props = defineProps<{
  data: ChartPoint[]
  metric: MetricKey
}>()

const width = 720
const height = 220
const padding = 30
const barGap = 2

const series = computed(() => props.data.slice(-60))

const max = computed(() => Math.max(...series.value.map((p) => p[props.metric]), 100))

const bars = computed(() => {
  const count = series.value.length
  const barWidth = Math.max(2, (width - padding * 2) / Math.max(1, count) - barGap)
  return series.value.map((point, index) => {
    const value = point[props.metric]
    const barHeight = (value / max.value) * (height - padding * 2)
    return {
      x: padding + index * ((width - padding * 2) / Math.max(1, count)),
      y: height - padding - barHeight,
      width: barWidth,
      height: barHeight,
      value,
    }
  })
})
</script>

<template>
  <section
    class="min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25 sm:min-h-[286px]"
  >
    <PanelHeader eyebrow="Histogram" :title="`${metricLabels[metric]} Distribution`" />
    <div class="relative px-2 pb-3 pt-1 sm:px-3 sm:pb-4">
      <svg class="block h-auto w-full" viewBox="0 0 720 220" role="img" aria-label="Live bar chart">
        <rect
          v-for="(bar, index) in bars"
          :key="index"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          :fill="metricColors[metric]"
          opacity="0.75"
          rx="2"
        />
      </svg>
    </div>
  </section>
</template>
