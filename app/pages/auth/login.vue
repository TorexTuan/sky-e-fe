<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'
import { loginSchema } from '~/schemas/auth'
import type { SocialProvider } from '~/types/auth'
import { parseApiError } from '~/services/auth'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Skye — Sign In' })

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

// --- Form setup with Zod ---
const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
})

const { value: email, errorMessage: emailError, handleBlur: handleEmailBlur } = useField<string>('email')
const { value: password, errorMessage: passwordError, handleBlur: handlePasswordBlur } = useField<string>('password')
const { value: rememberMe } = useField<boolean>('rememberMe')

const route = useRoute()
const successMessage = computed(() => {
  if (route.query.registered === 'true') {
    return 'auth.register.success_message'
  }
  return ''
})

// --- Password visibility ---
const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// --- Server error ---
const serverError = ref('')

// --- Submit ---
const onSubmit = handleSubmit(async (values) => {
  serverError.value = ''
  try {
    await authStore.login(values)
    await router.push('/')
  } catch (err) {
    const parsed = parseApiError(err)
    if (parsed.fieldErrors) {
      for (const [field, msg] of Object.entries(parsed.fieldErrors)) {
        setFieldError(field as 'email' | 'password', msg)
      }
    } else {
      serverError.value = parsed.message
    }
    // Clear password on failure
    password.value = ''
  }
})

// --- Social login placeholder ---
const handleSocialLogin = (provider: SocialProvider) => {
  // OAuth integration — future task
  console.log('Social login:', provider)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Heading -->
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {{ t('auth.login.title') }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ t('auth.login.subtitle') }}
      </p>
    </div>

    <!-- Server error -->
    <div
      v-if="serverError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {{ t(serverError) }}
    </div>

    <!-- Success banner -->
    <div
      v-if="successMessage"
      class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600"
    >
      {{ t(successMessage) }}
    </div>

    <!-- Form -->
    <form class="space-y-5" novalidate @submit.prevent="onSubmit">
      <!-- Email -->
      <BaseInput
        id="login-email"
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

      <!-- Password -->
      <BaseInput
        id="login-password"
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
        <template #label-right>
          <NuxtLink
            to="/auth/forgot-password"
            class="cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            {{ t('auth.login.forgot_password') }}
          </NuxtLink>
        </template>
        <template #suffix>
          <button
            type="button"
            class="cursor-pointer focus:outline-none"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="togglePasswordVisibility"
          >
            <Icon
              :name="showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'"
              class="h-5 w-5 text-gray-400 transition-colors hover:text-gray-600"
            />
          </button>
        </template>
      </BaseInput>

      <!-- Remember me -->
      <BaseCheckbox
        id="login-remember"
        v-model="rememberMe"
        :label="t('auth.login.remember_me')"
      />

      <!-- Submit button -->
      <BaseButton
        id="login-submit"
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :is-loading="isSubmitting"
      >
        {{ t('auth.login.submit') }}
      </BaseButton>
    </form>

    <!-- Social login -->
    <AuthSocialButtons
      :divider-text="t('auth.social.divider_login')"
      @social-login="handleSocialLogin"
    />

    <!-- Register link -->
    <p class="text-center text-sm text-gray-500">
      {{ t('auth.login.dont_have_account') }}
      <NuxtLink
        to="/auth/register"
        class="cursor-pointer font-semibold text-purple-600 hover:text-purple-700"
      >
        {{ t('auth.login.sign_up_now') }}
      </NuxtLink>
    </p>
  </div>
</template>
