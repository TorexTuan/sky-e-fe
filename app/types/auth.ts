/**
 * Auth TypeScript Types
 *
 * Form data types are derived from Zod schemas (single source of truth).
 * API response and utility types are defined here.
 */

import type { LoginFormData, RegisterFormData } from '~/schemas/auth'
import type { PhoneCountry } from '~/constants/auth'

// Re-export form data types from Zod schemas
export type { LoginFormData, RegisterFormData }

// Re-export PhoneCountry for use across the app
export type { PhoneCountry }

// --- API Payloads ---
export type LoginPayload = Omit<LoginFormData, 'rememberMe'>

/**
 * RegisterPayload strips phoneDialCode from the form data
 * since the service normalizes it into the phone field as E.164 before sending.
 */
export type RegisterPayload = Omit<RegisterFormData, 'phoneDialCode'>

// --- API Responses ---
export interface LoginResponse {
  access: string
  refresh: string
}

export interface RegisterResponse {
  id: string
  fullName: string
  email: string
  phone: string
}

export interface RefreshTokenResponse {
  access: string
}

// --- Social Login ---
export type SocialProvider = 'google' | 'facebook' | 'x'

// --- API Error ---
export interface ApiFieldError {
  [field: string]: string[]
}

export interface ApiError {
  detail?: string
  errors?: ApiFieldError
}
