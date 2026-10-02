<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AreaChart from '@/components/charts/AreaChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import ClusterLoad from '@/components/charts/ClusterLoad.vue'
import LineChart from '@/components/charts/LineChart.vue'
import ActivityFeed from '@/components/dashboard/ActivityFeed.vue'
import DashboardControls from '@/components/dashboard/DasboardControls.vue'
import LogsTable from '@/components/dashboard/LogsTable.vue'
import MetricCard from '@/components/dashboard/MetricCard.vue'
import { useMockStream } from '@/composables/useMockStream'
import { useTheme } from '@/composables/useTheme'
import { useDashboardStore } from '@/stores/dashboardStore'

const store = useDashboardStore()
const {
  chartMode,
  connection,
  events,
  filteredLogs,
  filteredPoints,
  invalidPayloads,
  metricCards,
  selectedMetrics,
  services,
  systemHealth,
} = storeToRefs(store)

useMockStream()
const { theme, toggleTheme } = useTheme()

const connectionLabel = computed(() => {
  if (connection.value.status === 'live') return 'Live stream'
  if (connection.value.status === 'paused') return 'Paused'
  if (connection.value.status === 'reconnecting') return `Reconnecting ${connection.value.attempts}`
  if (connection.value.status === 'error') return 'Payload rejected'
  return 'Connecting'
})

const primaryAreaMetric = computed(() => selectedMetrics.value[0] ?? 'latency')
</script>

<template>
  <main class="mx-auto w-full max-w-[1680px] overflow-x-hidden p-3 sm:p-5 lg:p-7">
    <header class="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div class="min-w-0">
        <p
          class="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          Sentra DevOps Command Center
        </p>
        <h1 class="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
          Real-Time Infrastructure Monitoring
        </h1>
      </div>

      <div class="grid w-full grid-cols-[44px_minmax(0,1fr)] gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
        <button
          type="button"
          aria-label="Toggle color theme"
          :aria-pressed="theme === 'dark'"
          class="inline-flex h-9 w-11 items-center justify-center rounded-lg border border-slate-300/80 bg-white/90 text-slate-600 transition hover:border-sky-400/60 hover:text-slate-900 dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:text-white sm:w-9"
          @click="toggleTheme"
        >
          <span v-if="theme === 'dark'"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </span>
          <span v-else
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              /></svg
          ></span>
        </button>

        <div
          class="inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-300/80 bg-white/90 px-3 text-sm font-semibold text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-slate-200 sm:justify-start"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="{
              'bg-emerald-400 animate-pulse': connection.status === 'live',
              'bg-amber-400': ['paused', 'connecting', 'reconnecting'].includes(connection.status),
              'bg-rose-400': connection.status === 'error',
            }"
          />
          {{ connectionLabel }}
        </div>
      </div>
    </header>

    <div
      v-if="connection.status === 'connecting'"
      class="mb-5 rounded-lg border border-slate-200/80 bg-white/80 px-5 py-4 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-400"
    >
      Establishing stream connection…
    </div>

    <DashboardControls />

    <section
      class="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
      aria-label="Current platform metrics"
    >
      <MetricCard v-for="metric in metricCards" :key="metric.key" :metric="metric" />
    </section>

    <section class="mb-3.5 grid grid-cols-1 gap-3 lg:grid-cols-4">
      <article
        class="flex min-h-[76px] items-center gap-3 rounded-lg border border-slate-200/80 bg-white/80 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25"
      >
        <span
          class="h-2.5 w-2.5 rounded-full"
          :class="{
            'bg-emerald-400': systemHealth === 'info',
            'bg-amber-400': systemHealth === 'warning',
            'bg-rose-400': systemHealth === 'critical',
          }"
        ></span>
        <div>
          <strong class="block capitalize text-slate-900 dark:text-slate-100">{{
            systemHealth === 'info' ? 'Healthy' : systemHealth
          }}</strong>
          <p class="mt-0.5 text-slate-500 dark:text-slate-400">Overall system state</p>
        </div>
      </article>
      <article
        class="flex min-h-[76px] items-center gap-3 rounded-lg border border-slate-200/80 bg-white/80 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25"
      >
        <strong class="block text-slate-900 dark:text-slate-100">{{
          filteredPoints.length
        }}</strong>
        <p class="mt-0.5 text-slate-500 dark:text-slate-400">samples in active window</p>
      </article>
      <article
        class="flex min-h-[76px] items-center gap-3 rounded-lg border border-slate-200/80 bg-white/80 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25"
      >
        <strong class="block text-slate-900 dark:text-slate-100">{{ invalidPayloads }}</strong>
        <p class="mt-0.5 text-slate-500 dark:text-slate-400">malformed payloads dropped</p>
      </article>
      <article
        class="flex min-h-[76px] items-center gap-3 rounded-lg border border-slate-200/80 bg-white/80 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25"
      >
        <strong class="block text-slate-900 dark:text-slate-100">{{
          services.filter((service) => service.status !== 'info').length
        }}</strong>
        <p class="mt-0.5 text-slate-500 dark:text-slate-400">services need attention</p>
      </article>
    </section>

    <section class="space-y-3.5">
      <div class="grid grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <component
          :is="chartMode === 'line' ? LineChart : AreaChart"
          :data="filteredPoints"
          :metrics="selectedMetrics"
          :metric="primaryAreaMetric"
        />
        <ClusterLoad :services="services" />
      </div>

      <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        <ActivityFeed :events="events" />
        <BarChart :data="filteredPoints" metric="cpu" />
        <AreaChart :data="filteredPoints" metric="throughput" />
      </div>

      <LogsTable :logs="filteredLogs" />
    </section>
  </main>
</template>
