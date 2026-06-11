/**
 * Centralized API Fetch Utility
 *
 * Wraps $fetch with:
 * - Automatic Accept-Language header from current i18n locale
 * - Base URL from runtimeConfig
 *
 * All API service files should use this instead of raw $fetch.
 */


export function useApiFetch() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  async function apiFetch<T>(endpoint: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const nuxtApp = useNuxtApp()
    const locale = (nuxtApp.$i18n as any)?.locale?.value || 'vi'

    return await $fetch<T>(`${apiBase}${endpoint}`, {
      ...options,
      headers: {
        'Accept-Language': locale,
        ...options.headers,
      },
    })
  }

  return { apiFetch }
}
