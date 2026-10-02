import { onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { generateMalformedPayload, generateMockPayload } from '@/utils/generateMockData'

export function useMockStream() {
  const store = useDashboardStore()
  let intervalId: number | null = null
  let reconnectId: number | null = null
  let frameId: number | null = null
  let pendingPayload: unknown = null

  const flush = () => {
    frameId = null
    if (!store.paused && pendingPayload) {
      store.ingest(pendingPayload)
    }
    pendingPayload = null
  }

  const schedulePayload = (payload: unknown) => {
    pendingPayload = payload
    if (frameId === null) {
      frameId = window.requestAnimationFrame(flush)
    }
  }

  const tick = () => {
    if (store.paused) return

    if (Math.random() < 0.012) {
      simulateReconnect()
      return
    }

    schedulePayload(Math.random() < 0.025 ? generateMalformedPayload() : generateMockPayload())
  }

  const start = () => {
    stop()
    store.setConnection('connecting')
    intervalId = window.setInterval(tick, 850)
    window.setTimeout(() => store.setConnection('live'), 250)
  }

  const stop = () => {
    if (intervalId !== null) window.clearInterval(intervalId)
    if (reconnectId !== null) window.clearTimeout(reconnectId)
    if (frameId !== null) window.cancelAnimationFrame(frameId)
    intervalId = null
    reconnectId = null
    frameId = null
  }

  const simulateReconnect = () => {
    if (intervalId !== null) window.clearInterval(intervalId)
    intervalId = null
    const attempt = store.connection.attempts + 1
    store.setConnection('reconnecting', 'Stream interrupted. Retrying connection...')
    reconnectId = window.setTimeout(
      () => {
        store.setConnection('live')
        intervalId = window.setInterval(tick, 850)
      },
      Math.min(4_000, 600 * attempt),
    )
  }

  onMounted(start)
  onUnmounted(stop)

  return { start, stop }
}
