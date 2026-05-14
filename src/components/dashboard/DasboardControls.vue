<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  chartModeOptions,
  metricOptions,
  severityOptions,
  timeRangeOptions,
} from '@/constants/dashboard'
import { useDashboardStore } from '@/stores/dashboardStore'

const store = useDashboardStore()
const { chartMode, paused, search, selectedMetrics, severityFilter, timeRange } = storeToRefs(store)
</script>

<template>
  <section
    class="static z-10 mb-5 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/75 dark:shadow-black/25 md:sticky md:top-3"
    aria-label="Dashboard controls"
  >
    <!-- Row 1: stream controls + dataset toggles -->
    <div class="grid grid-cols-1 gap-2 border-b border-slate-200/80 px-3 py-2.5 dark:border-slate-700/60 md:flex md:flex-wrap md:items-center">

      <!-- Pause / Resume -->
      <button
        type="button"
        class="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-bold transition md:w-auto"
        :class="paused
          ? 'border-amber-400/60 bg-amber-400/10 text-amber-600 dark:text-amber-300'
          : 'border-slate-300/80 bg-white/90 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200'"
        @click="store.setPaused(!paused)"
      >
        <span class="h-2 w-2 rounded-full" :class="paused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'" />
        {{ paused ? 'Resume' : 'Pause' }}
      </button>

      <div class="hidden h-5 w-px bg-slate-200 dark:bg-slate-700 md:block" />

      <!-- Time range -->
      <div class="grid grid-cols-4 gap-1 md:flex md:items-center" role="group" aria-label="Time range">
        <button
          v-for="range in timeRangeOptions"
          :key="range.value"
          type="button"
          class="h-9 rounded-lg border px-3 text-sm font-medium transition"
          :class="timeRange === range.value
            ? 'border-sky-400/70 bg-sky-400/15 text-sky-700 dark:text-sky-300'
            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'"
          @click="store.setTimeRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>

      <div class="hidden h-5 w-px bg-slate-200 dark:bg-slate-700 md:block" />

      <!-- Chart mode -->
      <div class="grid grid-cols-2 gap-1 sm:w-64 md:flex md:w-auto md:items-center" role="group" aria-label="Chart mode">
        <button
          v-for="mode in chartModeOptions"
          :key="mode.value"
          type="button"
          class="h-9 rounded-lg border px-3 text-sm font-medium transition"
          :class="chartMode === mode.value
            ? 'border-sky-400/70 bg-sky-400/15 text-sky-700 dark:text-sky-300'
            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'"
          @click="store.setChartMode(mode.value)"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <!-- Row 2: dataset toggles + search + severity -->
    <div class="grid grid-cols-1 gap-2 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)_auto] md:items-center">

      <!-- Dataset toggles -->
      <div class="grid grid-cols-3 gap-1 sm:grid-cols-5 md:flex md:flex-wrap md:items-center" role="group" aria-label="Datasets">
        <button
          v-for="metric in metricOptions"
          :key="metric.value"
          type="button"
          class="h-8 rounded-full border px-3 text-xs font-bold transition"
          :class="selectedMetrics.includes(metric.value)
            ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-700 dark:text-emerald-300'
            : 'border-slate-200 bg-white/60 text-slate-400 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500 dark:hover:text-slate-300'"
          @click="store.toggleMetric(metric.value)"
        >
          {{ metric.label }}
        </button>
      </div>

      <!-- Spacer -->
      <!-- Search -->
      <div class="relative w-full">
        <input
          v-model="search"
          type="text"
          placeholder="Search logs…"
          class="h-9 w-full rounded-lg border border-slate-200/80 bg-white/90 pl-3 pr-14 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500"
        />
        <button
          v-if="search"
          type="button"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          @click="search = ''"
        >
          Clear
        </button>
      </div>

      <!-- Severity -->
      <select
        v-model="severityFilter"
        aria-label="Filter log severity"
        class="h-9 w-full rounded-lg border border-slate-200/80 bg-white/90 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-slate-200 md:w-auto"
      >
        <option v-for="severity in severityOptions" :key="severity.value" :value="severity.value">
          {{ severity.label }}
        </option>
      </select>
    </div>
  </section>
</template>
