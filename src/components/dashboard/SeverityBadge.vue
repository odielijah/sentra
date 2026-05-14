<script setup lang="ts">
import { computed } from 'vue'
import { severityToneClass } from '@/constants/dashboard'
import type { Severity } from '@/types/dashboard'

const props = defineProps<{
  severity: Severity
}>()

const toneClass = computed(() => severityToneClass[props.severity])
</script>

<template>
  <span
    class="inline-flex min-w-[68px] justify-center rounded-full px-2 py-1 text-xs font-black uppercase text-slate-950"
    :class="toneClass"
  >
    {{ severity }}
  </span>
</template>
