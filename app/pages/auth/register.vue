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
const { locale } = useI18n()

// Default dial code based on current locale
const defaultDialCode = computed(() => locale.value === 'vi' ? '+84' : '+1')

const { handleSubmit, isSubmitting, meta } = useForm({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    fullName: '',
    email: '',
    phoneDialCode: defaultDialCode.value,
    phone: '',
    password: '',
    confirmPassword: '',
    confirmTermsAndConditions: false,
  },
})

const { value: fullName, errorMessage: fullNameError, handleBlur: handleFullNameBlur } = useField<string>('fullName')
const { value: email, errorMessage: emailError, handleBlur: handleEmailBlur } = useField<string>('email')
const { value: phoneDialCode } = useField<string>('phoneDialCode')
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

// Disable submit button if any field currently shows an error (Zod or server)
const hasVisibleErrors = computed(() => {
  const veeErrors = [fullNameError.value, emailError.value, phoneError.value, passwordError.value, confirmPasswordError.value, termsError.value]
  const hasVeeError = veeErrors.some(Boolean)
  const hasServerFieldError = Object.keys(serverFieldErrors.value).length > 0
  return hasVeeError || hasServerFieldError
})

// Keep phoneDialCode in sync if locale changes after mount
watch(locale, (newLocale) => {
  if (!phone.value) {
    phoneDialCode.value = newLocale === 'vi' ? '+84' : '+1'
  }
})

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
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
      data-testid="register-server-error"
    >
      {{ getErrorText(serverError) }}
    </div>

    <!-- Form -->
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <!-- Full Name -->
      <BaseInput
        v-model="fullName"
        id="register-fullname"
        type="text"
        data-testid="register-fullname-input"
        :label="t('auth.form.full_name')"
        :placeholder="t('auth.form.full_name')"
        :error="getFieldError(fullNameError, 'fullName')"
        @blur="handleFullNameBlur"
      >
        <template #prefix>
          <Icon class="h-5 w-5" name="mdi:account-outline" />
        </template>
      </BaseInput>

      <!-- Email -->
      <BaseInput
        v-model="email"
        id="register-email"
        type="email"
        data-testid="register-email-input"
        :label="t('auth.form.email')"
        :placeholder="t('auth.form.email_placeholder')"
        :error="getFieldError(emailError, 'email')"
        @blur="handleEmailBlur"
      >
        <template #prefix>
          <Icon class="h-5 w-5" name="mdi:email-outline" />
        </template>
      </BaseInput>

      <!-- Phone -->
      <BasePhoneInput
        v-model="phone"
        v-model:dialCode="phoneDialCode"
        id="register-phone"
        data-testid="register-phone-input"
        :label="t('auth.form.phone')"
        :error="getFieldError(phoneError, 'phone')"
        @blur="handlePhoneBlur"
      />

      <!-- Password -->
      <BaseInput
        v-model="password"
        id="register-password"
        data-testid="register-password-input"
        :label="t('auth.form.password')"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('auth.form.password_placeholder')"
        :error="getErrorText(passwordError)"
        @blur="handlePasswordBlur"
      >
        <template #prefix>
          <Icon class="h-5 w-5" name="mdi:lock-outline" />
        </template>
        <template #suffix>
          <button
            class="cursor-pointer focus:outline-none"
            type="button"
            data-testid="register-toggle-password"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <Icon
              class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600"
              :name="showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
            />
          </button>
        </template>
      </BaseInput>

      <!-- Confirm Password -->
      <BaseInput
        v-model="confirmPassword"
        id="register-confirm-password"
        data-testid="register-confirm-password-input"
        :label="t('auth.form.confirm_password')"
        :type="showConfirmPassword ? 'text' : 'password'"
        :placeholder="t('auth.form.password_placeholder')"
        :error="getErrorText(confirmPasswordError)"
        @blur="handleConfirmPasswordBlur"
      >
        <template #prefix>
          <Icon class="h-5 w-5" name="mdi:lock-outline" />
        </template>
        <template #suffix>
          <button
            class="cursor-pointer focus:outline-none"
            type="button"
            data-testid="register-toggle-confirm-password"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon
              class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600"
              :name="showConfirmPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
            />
          </button>
        </template>
      </BaseInput>

      <!-- Terms & Conditions -->
      <div class="space-y-1">
        <BaseCheckbox
          v-model="terms"
          id="register-terms"
          data-testid="register-terms-checkbox"
        >
          <span class="text-sm text-gray-700">
            {{ t('auth.register.terms_start') }}
            <NuxtLink class="cursor-pointer font-medium text-purple-600 hover:text-purple-700" to="#">
              {{ t('auth.register.terms_of_service') }}
            </NuxtLink>
            {{ t('auth.register.terms_and') }}
            <NuxtLink class="cursor-pointer font-medium text-purple-600 hover:text-purple-700" to="#">
              {{ t('auth.register.privacy_policy') }}
            </NuxtLink>
          </span>
        </BaseCheckbox>
        <p v-if="termsError" class="text-sm font-medium text-red-500" data-testid="register-terms-error">
          {{ getErrorText(termsError) }}
        </p>
      </div>

      <!-- Submit button -->
      <BaseButton
        :class="['w-full', hasVisibleErrors ? 'cursor-not-allowed' : 'cursor-pointer']"
        id="register-submit"
        type="submit"
        data-testid="register-submit-button"
        variant="primary"
        size="lg"
        :is-loading="isSubmitting"
        :disabled="hasVisibleErrors"
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
        class="cursor-pointer font-semibold text-purple-600 hover:text-purple-700"
        to="/auth/login"
        data-testid="register-login-link"
      >
        {{ t('auth.register.sign_in_now') }}
      </NuxtLink>
    </p>
  </div>
</template>
