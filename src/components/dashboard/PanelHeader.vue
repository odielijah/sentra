<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  meta?: string
}>()
</script>

<template>
  <div class="flex flex-col items-start gap-3 px-3 pb-2 pt-4 sm:px-5 md:flex-row md:items-center md:justify-between">
    <div>
      <p class="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {{ eyebrow }}
      </p>
      <h2 class="text-base font-extrabold text-slate-950 dark:text-white">{{ title }}</h2>
    </div>
    <slot>
      <span v-if="meta" class="text-sm text-slate-500 dark:text-slate-400">{{ meta }}</span>
    </slot>
  </div>
</template>
