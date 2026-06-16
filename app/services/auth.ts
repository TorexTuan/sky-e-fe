/**
 * Auth API Service
 *
 * Centralized HTTP calls to auth endpoints.
 * Uses useApiFetch composable for automatic Accept-Language header.
 * Handles camelCase ↔ snake_case mapping at the API boundary.
 */

import type { 
  LoginResponse, 
  RegisterResponse, 
  RefreshTokenResponse,
  LoginPayload,
  RegisterPayload 
} from '~/types/auth'

/**
 * Create auth API functions bound to current locale context.
 * Must be called within a Vue setup context (component, store, middleware).
 */
export function useAuthService() {
  const { apiFetch } = useApiFetch()

  /**
   * POST /api/users/login/
   */
  async function login(data: LoginPayload): Promise<LoginResponse> {
    return await apiFetch<LoginResponse>('/api/users/login/', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * POST /api/users/register/
   *
   * Maps camelCase (frontend) → snake_case (backend) for outgoing payload.
   * Maps snake_case (backend) → camelCase (frontend) for incoming response.
   */
  async function register(data: RegisterPayload): Promise<RegisterResponse> {
    // Format phone to E.164 for backend based on current locale
    let formattedPhone = data.phone
    if (formattedPhone.startsWith('0')) {
      const nuxtApp = useNuxtApp()
      const locale = (nuxtApp.$i18n as any)?.locale?.value || 'vi'
      const prefix = locale === 'vi' ? '+84' : '+1' // Default en to +1
      formattedPhone = prefix + formattedPhone.slice(1)
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: formattedPhone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      confirmTermsAndConditions: data.confirmTermsAndConditions,
    }

    const response = await apiFetch<{
      id: string
      fullName: string
      email: string
      phone: string
    }>('/api/users/register/', {
      method: 'POST',
      body: payload,
    })

    return response
  }

  /**
   * POST /api/users/token/refresh/
   */
  async function refreshToken(data: { refresh: string }): Promise<RefreshTokenResponse> {
    return await apiFetch<RefreshTokenResponse>('/api/users/token/refresh/', {
      method: 'POST',
      body: data,
    })
  }

  return { login, register, refreshToken }
}

export function parseApiError(error: unknown): { message: string; fieldErrors?: Record<string, string> } {
  // ofetch FetchError may store response body in err.data or err.response._data
  const err = error as {
    data?: Record<string, unknown>
    response?: { _data?: Record<string, unknown> }
    statusCode?: number
  }
  const responseData = err?.data ?? err?.response?._data
  const fieldErrors: Record<string, string> = {}

  if (responseData) {
    // SimpleJWT / DRF detail-based error (e.g. login 401)
    if (typeof responseData.detail === 'string') {
      return { message: responseData.detail }
    }

    // DRF field-level validation errors (e.g. register 400)
    // Format: { "fieldName": ["error message", ...] }
    let hasFieldErrors = false
    for (const [field, messages] of Object.entries(responseData)) {
      if (field === 'non_field_errors' && Array.isArray(messages) && messages.length > 0) {
        return { message: String(messages[0]) }
      }

      if (Array.isArray(messages) && messages.length > 0) {
        // Convert snake_case field to camelCase
        const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        fieldErrors[camelField] = String(messages[0]) || 'Unknown error'
        hasFieldErrors = true
      }
    }

    if (hasFieldErrors) {
      return { message: '', fieldErrors }
    }
  }

  return { message: 'auth.validation.server_error' }
}
