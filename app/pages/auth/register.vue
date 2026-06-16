<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'
import { registerSchema } from '~/schemas/auth'
import type { SocialProvider } from '~/types/auth'
import { parseApiError } from '~/services/auth'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Skye — Create Account' })

const { t, te } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

/**
 * Resolve error text: if it's an i18n key → translate, otherwise show raw message.
 * Zod errors use keys like 'auth.validation.invalid_phone',
 * Backend DRF errors are raw strings like 'Số điện thoại đã được sử dụng.'
 */
const getErrorText = (err?: string) => {
  if (!err) return undefined
  return te(err) ? t(err) : err
}

// --- Form setup with Zod ---
const { handleSubmit, isSubmitting, meta } = useForm({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    confirmTermsAndConditions: false,
  },
})

const { value: fullName, errorMessage: fullNameError, handleBlur: handleFullNameBlur } = useField<string>('fullName')
const { value: email, errorMessage: emailError, handleBlur: handleEmailBlur } = useField<string>('email')
const { value: phone, errorMessage: phoneError, handleBlur: handlePhoneBlur } = useField<string>('phone')
const { value: password, errorMessage: passwordError, handleBlur: handlePasswordBlur } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError, handleBlur: handleConfirmPasswordBlur } = useField<string>('confirmPassword')
const { value: terms, errorMessage: termsError } = useField<boolean>('confirmTermsAndConditions')

// --- Password visibility ---
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// --- Server errors (decoupled from VeeValidate to avoid Zod re-validation overwrite) ---
const serverError = ref('')
const serverFieldErrors = ref<Record<string, string>>({})

/**
 * Get the final error for a field: VeeValidate (Zod) error takes priority,
 * then server-side error from backend.
 */
const getFieldError = (veeError?: string, fieldName?: string) => {
  if (veeError) return getErrorText(veeError)
  if (fieldName && serverFieldErrors.value[fieldName]) return serverFieldErrors.value[fieldName]
  return undefined
}

// Clear individual server field error when user edits that field
watch(fullName, () => { delete serverFieldErrors.value.fullName })
watch(email, () => { delete serverFieldErrors.value.email })
watch(phone, () => { delete serverFieldErrors.value.phone })

// --- Submit ---
const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  serverFieldErrors.value = {}
  try {
    await authStore.register(values)
    // Success → redirect to login with toast
    await router.push('/auth/login?registered=true')
  } catch (err) {
    const parsed = parseApiError(err)
    if (parsed.fieldErrors) {
      serverFieldErrors.value = { ...parsed.fieldErrors }
    } else {
      serverError.value = parsed.message
      // Clear password fields only for general errors (e.g. wrong credentials)
      password.value = ''
      confirmPassword.value = ''
    }
  }
})

// --- Social login placeholder ---
const handleSocialLogin = (provider: SocialProvider) => {
  console.log('Social login:', provider)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Heading -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {{ t('auth.register.title') }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ t('auth.register.subtitle') }}
      </p>
    </div>

    <!-- Server error -->
    <div
      v-if="serverError"
      data-testid="register-server-error"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {{ getErrorText(serverError) }}
    </div>

    <!-- Form -->
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <!-- Full Name -->
      <BaseInput
        id="register-fullname"
        data-testid="register-fullname-input"
        v-model="fullName"
        :label="t('auth.form.full_name')"
        type="text"
        :placeholder="t('auth.form.full_name')"
        :error="getFieldError(fullNameError, 'fullName')"
        @blur="handleFullNameBlur"
      >
        <template #prefix>
          <Icon name="mdi:account-outline" class="h-5 w-5" />
        </template>
      </BaseInput>

      <!-- Email -->
      <BaseInput
        id="register-email"
        data-testid="register-email-input"
        v-model="email"
        :label="t('auth.form.email')"
        type="email"
        :placeholder="t('auth.form.email_placeholder')"
        :error="getFieldError(emailError, 'email')"
        @blur="handleEmailBlur"
      >
        <template #prefix>
          <Icon name="mdi:email-outline" class="h-5 w-5" />
        </template>
      </BaseInput>

      <!-- Phone -->
      <BaseInput
        id="register-phone"
        data-testid="register-phone-input"
        v-model="phone"
        :label="t('auth.form.phone')"
        type="tel"
        placeholder="0912345678"
        :error="getFieldError(phoneError, 'phone')"
        @blur="handlePhoneBlur"
      >
        <template #prefix>
          <Icon name="mdi:phone-outline" class="h-5 w-5" />
        </template>
      </BaseInput>

      <!-- Password -->
      <BaseInput
        id="register-password"
        data-testid="register-password-input"
        v-model="password"
        :label="t('auth.form.password')"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('auth.form.password_placeholder')"
        :error="getErrorText(passwordError)"
        @blur="handlePasswordBlur"
      >
        <template #prefix>
          <Icon name="mdi:lock-outline" class="h-5 w-5" />
        </template>
        <template #suffix>
          <button
            type="button"
            data-testid="register-toggle-password"
            class="cursor-pointer focus:outline-none"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <Icon
              :name="showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600"
            />
          </button>
        </template>
      </BaseInput>

      <!-- Confirm Password -->
      <BaseInput
        id="register-confirm-password"
        data-testid="register-confirm-password-input"
        v-model="confirmPassword"
        :label="t('auth.form.confirm_password')"
        :type="showConfirmPassword ? 'text' : 'password'"
        :placeholder="t('auth.form.password_placeholder')"
        :error="getErrorText(confirmPasswordError)"
        @blur="handleConfirmPasswordBlur"
      >
        <template #prefix>
          <Icon name="mdi:lock-outline" class="h-5 w-5" />
        </template>
        <template #suffix>
          <button
            type="button"
            data-testid="register-toggle-confirm-password"
            class="cursor-pointer focus:outline-none"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon
              :name="showConfirmPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600"
            />
          </button>
        </template>
      </BaseInput>

      <!-- Terms & Conditions -->
      <div class="space-y-1">
        <BaseCheckbox
          id="register-terms"
          data-testid="register-terms-checkbox"
          v-model="terms"
        >
          <span class="text-sm text-gray-700">
            {{ t('auth.register.terms_start') }}
            <NuxtLink to="#" class="cursor-pointer font-medium text-purple-600 hover:text-purple-700">
              {{ t('auth.register.terms_of_service') }}
            </NuxtLink>
            {{ t('auth.register.terms_and') }}
            <NuxtLink to="#" class="cursor-pointer font-medium text-purple-600 hover:text-purple-700">
              {{ t('auth.register.privacy_policy') }}
            </NuxtLink>
          </span>
        </BaseCheckbox>
        <p v-if="termsError" class="text-sm font-medium text-red-500">
          {{ getErrorText(termsError) }}
        </p>
      </div>

      <!-- Submit button -->
      <BaseButton
        id="register-submit"
        data-testid="register-submit-button"
        type="submit"
        variant="primary"
        size="lg"
        :class="['w-full', { 'cursor-pointer': meta.valid && meta.touched }]"
        :is-loading="isSubmitting"
        :disabled="!meta.valid && meta.touched"
      >
        {{ t('auth.register.submit') }}
      </BaseButton>
    </form>

    <!-- Social login -->
    <AuthSocialButtons
      :divider-text="t('auth.social.divider_register')"
      @social-login="handleSocialLogin"
    />

    <!-- Login link -->
    <p class="text-center text-sm text-gray-500">
      {{ t('auth.register.already_have_account') }}
      <NuxtLink
        to="/auth/login"
        data-testid="register-login-link"
        class="cursor-pointer font-semibold text-purple-600 hover:text-purple-700"
      >
        {{ t('auth.register.sign_in_now') }}
      </NuxtLink>
    </p>
  </div>
</template>
