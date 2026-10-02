import { onMounted, onUnmounted, ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const storageKey = 'sentra-theme'

const getPreferredTheme = (): Theme => {
  const stored = window.localStorage.getItem(storageKey)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function useTheme() {
  const theme = ref<Theme>('dark')
  let mediaQuery: MediaQueryList | null = null

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const syncSystemTheme = (event: MediaQueryListEvent) => {
    if (window.localStorage.getItem(storageKey)) return
    theme.value = event.matches ? 'dark' : 'light'
  }

  onMounted(() => {
    theme.value = getPreferredTheme()
    applyTheme(theme.value)
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', syncSystemTheme)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', syncSystemTheme)
  })

  watch(theme, (value) => {
    window.localStorage.setItem(storageKey, value)
    applyTheme(value)
  })

  return {
    theme,
    toggleTheme,
  }
}
