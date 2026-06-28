/**
 * Auth-related constants
 */

// --- Phone Country Config ---
export interface PhoneCountry {
  code: string       // ISO 3166-1 alpha-2
  dialCode: string   // e.g. '+84'
  flag: string       // Nuxt Icon name
  label: string      // Display label
  /** Regex for the subscriber number ONLY (without dial code, without leading 0) */
  subscriberRegex: RegExp
  /** Regex for local format WITH leading 0 (optional shortcut) */
  localRegex: RegExp
  exampleSubscriber: string // e.g. '912345678'
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    code: 'VN',
    dialCode: '+84',
    flag: 'twemoji:flag-vietnam',
    label: 'Vietnam (+84)',
    // Subscriber: [3-9]\d{8} (9 digits, first digit 3-9)
    subscriberRegex: /^[3-9]\d{8}$/,
    // Local: 0[3-9]\d{8} (10 digits with leading 0)
    localRegex: /^0[3-9]\d{8}$/,
    exampleSubscriber: '912345678',
  },
  {
    code: 'US',
    dialCode: '+1',
    flag: 'twemoji:flag-united-states',
    label: 'United States (+1)',
    // Subscriber: [2-9]\d{9} (10 digits, area code cannot start with 0 or 1)
    subscriberRegex: /^[2-9]\d{9}$/,
    // US has no local 0-prefix format
    localRegex: /^[2-9]\d{9}$/,
    exampleSubscriber: '2025551234',
  },
] as const

export const PHONE_COUNTRIES_MAP = Object.fromEntries(
  PHONE_COUNTRIES.map((c) => [c.dialCode, c]),
) as Record<string, PhoneCountry>

// --- Validation Rules ---
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
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
