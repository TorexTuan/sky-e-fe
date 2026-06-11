/**
 * Zod Validation Schemas for Auth Forms
 *
 * These are the single source of truth for both validation logic
 * and TypeScript types (derived via z.infer<>).
 */

import { z } from 'zod'
import { VALIDATION_RULES } from '~/constants/auth'

// --- Login Schema ---
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'auth.validation.required_email' })
    .email({ message: 'auth.validation.invalid_email' }),
  password: z
    .string()
    .min(1, { message: 'auth.validation.required_password' }),
  rememberMe: z.boolean(),
})

// --- Register Schema ---
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(VALIDATION_RULES.FULL_NAME_MIN_LENGTH, { message: 'auth.validation.full_name_min' })
      .max(VALIDATION_RULES.FULL_NAME_MAX_LENGTH, { message: 'auth.validation.full_name_max' }),
    email: z
      .string()
      .min(1, { message: 'auth.validation.required_email' })
      .email({ message: 'auth.validation.invalid_email' }),
    phone: z
      .string()
      .min(1, { message: 'auth.validation.invalid_phone' })
      .regex(VALIDATION_RULES.PHONE_REGEX, { message: 'auth.validation.invalid_phone' }),
    password: z
      .string()
      .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, { message: 'auth.validation.password_min' })
      .regex(VALIDATION_RULES.PASSWORD_REGEX, { message: 'auth.validation.password_strength' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'auth.validation.required_confirm_password' }),
    confirmTermsAndConditions: z
      .boolean()
      .refine((v) => v === true, { message: 'auth.validation.terms_required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.validation.passwords_do_not_match',
  })

// --- Derived Types ---
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
