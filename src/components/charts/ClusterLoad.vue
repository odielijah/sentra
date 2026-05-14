<script setup lang="ts">
import { computed } from 'vue'
import { severityToneClass } from '@/constants/dashboard'
import type { ServiceSnapshot } from '@/types/dashboard'
import PanelHeader from '@/components/dashboard/PanelHeader.vue'

const props = defineProps<{
  services: ServiceSnapshot[]
}>()

const bars = computed(() =>
  props.services.map((service) => ({
    ...service,
    score: Math.round(service.cpu * 0.35 + service.memory * 0.3 + Math.min(100, service.latency / 3) * 0.25 + service.errors * 2),
  })),
)
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-black/25 sm:min-h-[360px]">
    <PanelHeader eyebrow="Service Pressure" title="Cluster Load" :meta="`${services.length} nodes`" />

    <div class="grid gap-3 px-3 pb-4 pt-2 sm:px-5 sm:pb-5" v-if="bars.length">
      <article
        v-for="service in bars"
        :key="service.id"
        class="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(128px,1fr)_minmax(120px,1.2fr)_48px] md:gap-3"
      >
        <div>
          <strong class="block text-sm text-slate-900 dark:text-slate-100">{{ service.name }}</strong>
          <span class="block text-sm text-slate-500 dark:text-slate-400">{{ service.region }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/70">
          <span
            class="block h-full rounded-full transition-[width] duration-500 ease-out"
            :class="severityToneClass[service.status]"
            :style="{ width: `${Math.min(100, service.score)}%` }"
          ></span>
        </div>
        <b class="text-sm text-slate-500 dark:text-slate-400">{{ service.score }}%</b>
      </article>
    </div>

    <div v-else class="px-3 py-7 text-slate-500 dark:text-slate-400 sm:px-5">Waiting for service snapshots.</div>
  </section>
</template>
