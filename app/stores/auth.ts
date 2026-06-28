/**
 * Auth Pinia Store
 */

import { defineStore } from 'pinia'
import type { LoginFormData, RegisterFormData } from '~/schemas/auth'
import type { LoginResponse } from '~/types/auth'
import { REMEMBER_ME_DURATION } from '~/constants/auth'
import { useAuthService, parseApiError } from '~/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // --- Auth API (locale-aware) ---
  const { login: loginApi, register: registerApi, refreshToken: refreshTokenApi } = useAuthService()
  // --- State ---
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // --- Cookies (for "Remember me" persistence) ---
  const accessCookie = useCookie('auth_access', {
    maxAge: REMEMBER_ME_DURATION * 24 * 60 * 60,
    sameSite: 'lax',
  })
  const refreshCookie = useCookie('auth_refresh', {
    maxAge: REMEMBER_ME_DURATION * 24 * 60 * 60,
    sameSite: 'lax',
  })

  // --- Getters ---
  const isAuthenticated = computed(() => !!accessToken.value)

  // --- Init: Restore tokens from cookies ---
  function init() {
    if (accessCookie.value) {
      accessToken.value = accessCookie.value
    }
    if (refreshCookie.value) {
      refreshToken.value = refreshCookie.value
    }
  }

  // --- Actions ---
  async function login(data: LoginFormData) {
    isLoading.value = true
    error.value = null

    try {
      const response: LoginResponse = await loginApi({
        email: data.email,
        password: data.password,
      })

      accessToken.value = response.access
      refreshToken.value = response.refresh

      // Persist tokens based on "Remember me"
      if (data.rememberMe) {
        accessCookie.value = response.access
        refreshCookie.value = response.refresh
      } else {
        // Session only — clear cookies if they exist
        accessCookie.value = null
        refreshCookie.value = null
      }

      return response
    } catch (err) {
      const parsed = parseApiError(err)
      error.value = parsed.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterFormData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await registerApi(data)
      return response
    } catch (err) {
      const parsed = parseApiError(err)
      error.value = parsed.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    accessCookie.value = null
    refreshCookie.value = null
    error.value = null
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) return

    try {
      const response = await refreshTokenApi({ refresh: refreshToken.value })
      accessToken.value = response.access
      if (accessCookie.value) {
        accessCookie.value = response.access
      }
    } catch {
      // Refresh token invalid → log out
      logout()
    }
  }

  // Restore tokens on init
  init()

  return {
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAccessToken,
  }
})
