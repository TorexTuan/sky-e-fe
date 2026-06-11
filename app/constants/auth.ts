/**
 * Auth-related constants
 */

// --- Validation Rules ---
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
  PHONE_REGEX: /^(\+\d{1,3}|0)\d{8,14}$/,
  FULL_NAME_MIN_LENGTH: 2,
  FULL_NAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
} as const

// --- i18n Message Keys ---
export const AUTH_MESSAGES = {
  EMAIL_REQUIRED: 'auth.validation.required_email',
  EMAIL_INVALID: 'auth.validation.invalid_email',
  EMAIL_IN_USE: 'auth.validation.email_in_use',
  PASSWORD_REQUIRED: 'auth.validation.required_password',
  PASSWORD_INVALID_FORMAT: 'auth.validation.password_strength',
  CONFIRM_PASSWORD_REQUIRED: 'auth.validation.required_password',
  PASSWORD_MISMATCH: 'auth.validation.passwords_do_not_match',
  FULL_NAME_REQUIRED: 'auth.validation.full_name_min',
  FULL_NAME_TOO_SHORT: 'auth.validation.full_name_min',
  PHONE_REQUIRED: 'auth.validation.invalid_phone',
  PHONE_INVALID: 'auth.validation.invalid_phone',
  TERMS_REQUIRED: 'auth.validation.terms_required',
  SERVER_ERROR: 'auth.validation.server_error',
} as const

// --- Social Providers ---
export const SOCIAL_PROVIDERS = ['google', 'facebook', 'x'] as const

export const SOCIAL_PROVIDER_ICONS: Record<typeof SOCIAL_PROVIDERS[number], string> = {
  google: 'flat-color-icons:google',
  facebook: 'logos:facebook',
  x: 'ri:twitter-x-fill',
} as const

// --- Remember Me ---
export const REMEMBER_ME_DURATION = 30 // days
