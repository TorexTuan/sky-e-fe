<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'
import { registerSchema } from '~/schemas/auth'
import type { SocialProvider } from '~/types/auth'
import { parseApiError } from '~/services/auth'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Skye — Create Account' })

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

// --- Form setup with Zod ---
const { handleSubmit, isSubmitting, meta, setFieldError } = useForm({
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

// --- Server error ---
const serverError = ref('')

// --- Submit ---
const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  try {
    await authStore.register(values)
    // Success → redirect to login with toast
    await router.push('/auth/login?registered=true')
  } catch (err) {
    const parsed = parseApiError(err)
    if (parsed.fieldErrors) {
      for (const [field, msg] of Object.entries(parsed.fieldErrors)) {
        setFieldError(field as any, msg)
      }
    } else {
      serverError.value = parsed.message
    }
    // Clear password fields on failure
    password.value = ''
    confirmPassword.value = ''
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
    >
      {{ t(serverError) }}
    </div>

    <!-- Form -->
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <!-- Full Name -->
      <BaseInput
        id="register-fullname"
        v-model="fullName"
        :label="t('auth.form.full_name')"
        type="text"
        :placeholder="t('auth.form.full_name')"
        :error="fullNameError ? t(fullNameError) : undefined"
        @blur="handleFullNameBlur"
      >
        <template #prefix>
          <Icon name="mdi:account-outline" class="h-5 w-5" />
        </template>
      </BaseInput>

      <!-- Email -->
      <BaseInput
        id="register-email"
        v-model="email"
        :label="t('auth.form.email')"
        type="email"
        :placeholder="t('auth.form.email_placeholder')"
        :error="emailError ? t(emailError) : undefined"
        @blur="handleEmailBlur"
      >
        <template #prefix>
          <Icon name="mdi:email-outline" class="h-5 w-5" />
        </template>
      </BaseInput>

      <!-- Phone -->
      <BaseInput
        id="register-phone"
        v-model="phone"
        :label="t('auth.form.phone')"
        type="tel"
        placeholder="0912345678"
        :error="phoneError ? t(phoneError) : undefined"
        @blur="handlePhoneBlur"
      >
        <template #prefix>
          <Icon name="mdi:phone-outline" class="h-5 w-5" />
        </template>
      </BaseInput>

      <!-- Password -->
      <BaseInput
        id="register-password"
        v-model="password"
        :label="t('auth.form.password')"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('auth.form.password_placeholder')"
        :error="passwordError ? t(passwordError) : undefined"
        @blur="handlePasswordBlur"
      >
        <template #prefix>
          <Icon name="mdi:lock-outline" class="h-5 w-5" />
        </template>
        <template #suffix>
          <button
            type="button"
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
        v-model="confirmPassword"
        :label="t('auth.form.confirm_password')"
        :type="showConfirmPassword ? 'text' : 'password'"
        :placeholder="t('auth.form.password_placeholder')"
        :error="confirmPasswordError ? t(confirmPasswordError) : undefined"
        @blur="handleConfirmPasswordBlur"
      >
        <template #prefix>
          <Icon name="mdi:lock-outline" class="h-5 w-5" />
        </template>
        <template #suffix>
          <button
            type="button"
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
          {{ t(termsError) }}
        </p>
      </div>

      <!-- Submit button -->
      <BaseButton
        id="register-submit"
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
        class="cursor-pointer font-semibold text-purple-600 hover:text-purple-700"
      >
        {{ t('auth.register.sign_in_now') }}
      </NuxtLink>
    </p>
  </div>
</template>
