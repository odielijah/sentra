<script setup lang="ts">
import { computed } from 'vue'
import type { LogEntry } from '@/types/dashboard'
import PanelHeader from '@/components/dashboard/PanelHeader.vue'
import SeverityBadge from '@/components/dashboard/SeverityBadge.vue'

const props = defineProps<{
  logs: LogEntry[]
}>()

const visibleLogs = computed(() => props.logs.slice(0, 80))
const columns: { label: string; key: keyof LogEntry; variant?: 'primary' | 'severity' }[] = [
  { label: 'Time', key: 'timestamp' },
  { label: 'Severity', key: 'severity', variant: 'severity' },
  { label: 'Service', key: 'service', variant: 'primary' },
  { label: 'Region', key: 'region' },
  { label: 'Code', key: 'code' },
  { label: 'Message', key: 'message' },
]

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp)

const cellValue = (log: LogEntry, key: keyof LogEntry) =>
  key === 'timestamp' ? formatTime(log.timestamp) : log[key]

const cellClass = (variant?: 'primary' | 'severity') =>
  [
    'border-t border-slate-200/80 px-5 py-3 text-sm dark:border-slate-700/60',
    variant === 'primary' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300',
  ]
</script>

<template>
  <section class="col-span-full min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25">
    <PanelHeader eyebrow="Inspectable Stream" title="Event Logs" :meta="`${logs.length} visible`" />

    <div class="grid max-h-[460px] gap-3 overflow-auto px-3 pb-4 pt-2 md:hidden" v-if="logs.length">
      <article
        v-for="log in visibleLogs"
        :key="log.id"
        class="rounded-lg border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-950/35"
      >
        <div class="mb-2 flex items-center justify-between gap-3">
          <time class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ formatTime(log.timestamp) }}</time>
          <SeverityBadge :severity="log.severity" />
        </div>
        <strong class="block text-sm text-slate-900 dark:text-slate-100">{{ log.service }}</strong>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ log.message }}</p>
        <div class="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>{{ log.region }}</span>
          <span>{{ log.code }}</span>
        </div>
      </article>
    </div>

    <div class="hidden max-h-[420px] overflow-auto md:block" v-if="logs.length">
      <table class="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="sticky top-0 z-[1] border-t border-slate-200/80 bg-white/95 px-5 py-3 text-left text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-950/95 dark:text-slate-400"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in visibleLogs" :key="log.id">
            <td v-for="column in columns" :key="column.key" :class="cellClass(column.variant)">
              <SeverityBadge v-if="column.variant === 'severity'" :severity="log.severity" />
              <template v-else>{{ cellValue(log, column.key) }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="px-3 py-7 text-slate-500 dark:text-slate-400 sm:px-5">No logs match the active filters.</div>
  </section>
</template>
