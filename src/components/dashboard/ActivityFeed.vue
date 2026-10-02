<script setup lang="ts">
import type { ActivityEvent } from '@/types/dashboard'
import PanelHeader from '@/components/dashboard/PanelHeader.vue'

defineProps<{
  events: ActivityEvent[]
}>()

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp)
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25 sm:min-h-[360px]">
    <PanelHeader eyebrow="Live Feed" title="Activity" :meta="`${events.length} events`" />

    <TransitionGroup v-if="events.length" name="feed" tag="ul" class="grid max-h-[286px] gap-3 overflow-auto px-3 pb-4 pt-2 sm:px-5 sm:pb-5">
      <li
        v-for="event in events.slice(0, 12)"
        :key="event.id"
        class="grid grid-cols-1 gap-1 border-l-[3px] pl-3 sm:grid-cols-[74px_1fr] sm:gap-3"
        :class="{
          'border-emerald-400 text-emerald-300': event.severity === 'info',
          'border-amber-400 text-amber-300': event.severity === 'warning',
          'border-rose-400 text-rose-300': event.severity === 'critical',
        }"
      >
        <time class="text-sm text-slate-500 dark:text-slate-400">{{ formatTime(event.timestamp) }}</time>
        <div>
          <strong class="text-sm text-slate-900 dark:text-slate-100">{{ event.service }}</strong>
          <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ event.message }}</p>
        </div>
      </li>
    </TransitionGroup>

    <div v-else class="px-3 py-7 text-slate-500 dark:text-slate-400 sm:px-5">Waiting for telemetry events.</div>
  </section>
</template>
