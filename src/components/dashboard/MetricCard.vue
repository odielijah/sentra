<script setup lang="ts">
import { computed } from 'vue'
import type { MetricCardModel } from '@/types/dashboard'

const props = defineProps<{
  metric: MetricCardModel
}>()

const toneClass = computed(() => {
  if (props.metric.tone === 'critical') return 'from-rose-100 to-white text-rose-950 dark:from-rose-500/28 dark:to-rose-500/5 dark:text-rose-200'
  if (props.metric.tone === 'warning') return 'from-amber-100 to-white text-amber-950 dark:from-amber-500/28 dark:to-amber-500/5 dark:text-amber-200'
  return 'from-sky-100 to-white text-sky-950 dark:from-sky-500/24 dark:to-emerald-500/5 dark:text-sky-100'
})

const barClass = computed(() => {
  if (props.metric.tone === 'critical') return 'bg-rose-400'
  if (props.metric.tone === 'warning') return 'bg-amber-400'
  return 'bg-sky-400'
})
</script>

<template>
  <article
    class="min-h-[142px] rounded-lg border border-slate-200/80 bg-gradient-to-br p-4 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:shadow-black/25 md:min-h-[132px]"
    :class="toneClass"
  >
    <div class="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
      <span>{{ metric.label }}</span>
      <strong class="text-slate-900 dark:text-slate-100">{{ metric.trend >= 0 ? '+' : '' }}{{ metric.trend.toFixed(1) }}</strong>
    </div>
    <div class="my-4 text-3xl font-black leading-none text-slate-950 dark:text-white md:text-4xl">
      {{ metric.value.toLocaleString() }}<small class="ml-1 text-sm font-bold text-slate-500 dark:text-slate-400">{{ metric.unit }}</small>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/70">
      <span
        class="block h-full rounded-full transition-[width] duration-500 ease-out"
        :class="barClass"
        :style="{ width: `${Math.min(100, Math.max(5, metric.value))}%` }"
      ></span>
    </div>
  </article>
</template>
