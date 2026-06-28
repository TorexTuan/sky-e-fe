/**
 * Phone Utility Functions
 *
 * Pure functions for phone number normalization and validation.
 * No side effects — safe to use anywhere (component, service, test).
 */

import { PHONE_COUNTRIES_MAP } from '~/constants/auth'

/**
 * Strip the dial code prefix from a phone number if the user typed it themselves.
 *
 * Examples (dialCode = '+84'):
 *   '+84912345678' → '912345678'
 *   '0912345678'   → '0912345678' (untouched — handled by normalizePhoneToE164)
 *   '912345678'    → '912345678'  (untouched)
 */
export function stripDialCode(phone: string, dialCode: string): string {
  const trimmed = phone.trim()
  if (trimmed.startsWith(dialCode)) {
    return trimmed.slice(dialCode.length)
  }
  return trimmed
}

/**
 * Strip the leading '0' from a local VN-style number.
 * Only applies when the number starts with '0'.
 *
 * Example: '0912345678' → '912345678'
 */
function stripLeadingZero(phone: string): string {
  return phone.startsWith('0') ? phone.slice(1) : phone
}

/**
 * Validate whether the raw phone value (as typed by the user) is valid
 * for the given dial code.
 *
 * Accepts all of:
 *   - Full E.164:  '+84912345678'
 *   - Local 0-prefix (VN only): '0912345678'
 *   - Subscriber only: '912345678'
 *
 * Returns false if the dialCode is not in PHONE_COUNTRIES_MAP.
 */
export function validatePhoneByDialCode(phone: string, dialCode: string): boolean {
  const country = PHONE_COUNTRIES_MAP[dialCode]
  if (!country) return false

  const trimmed = phone.trim()

  // Case 1: User typed full E.164 (+84xxxxxxxxx)
  if (trimmed.startsWith(dialCode)) {
    const subscriber = trimmed.slice(dialCode.length)
    return country.subscriberRegex.test(subscriber)
  }

  // Case 2: VN local format with leading 0 (0xxxxxxxxx)
  if (country.localRegex.test(trimmed)) {
    return true
  }

  // Case 3: Subscriber only (no prefix, no leading 0)
  return country.subscriberRegex.test(trimmed)
}

/**
 * Normalize a phone number to E.164 format for sending to the backend.
 *
 * Always returns a string starting with the dialCode.
 * Assumes the phone has already been validated with validatePhoneByDialCode.
 *
 * Examples (dialCode = '+84'):
 *   '0912345678'    → '+84912345678'
 *   '912345678'     → '+84912345678'
 *   '+84912345678'  → '+84912345678'
 *
 * Examples (dialCode = '+1'):
 *   '2025551234'    → '+12025551234'
 *   '+12025551234'  → '+12025551234'
 */
export function normalizePhoneToE164(phone: string, dialCode: string): string {
  const trimmed = phone.trim()

  // Already in E.164 with this dialCode
  if (trimmed.startsWith(dialCode)) {
    return trimmed
  }

  // Strip leading 0 (VN local format) then prepend dialCode
  const subscriber = stripLeadingZero(trimmed)
  return `${dialCode}${subscriber}`
}
