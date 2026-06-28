<script setup lang="ts">
import type { SocialProvider } from '~/types/auth'
import { SOCIAL_PROVIDERS, SOCIAL_PROVIDER_ICONS } from '~/constants/auth'

defineProps<{
  dividerText: string
}>()

const emit = defineEmits<{
  'social-login': [provider: SocialProvider]
}>()

const providerLabels: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  x: 'X',
}
</script>

<template>
  <div class="space-y-4">
    <!-- Divider -->
    <div class="relative flex items-center">
      <div class="flex-1 border-t border-gray-200" />
      <span class="px-4 text-sm text-gray-400">{{ dividerText }}</span>
      <div class="flex-1 border-t border-gray-200" />
    </div>

    <!-- Social buttons -->
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="provider in SOCIAL_PROVIDERS"
        class="flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        type="button"
        :key="provider"
        :aria-label="providerLabels[provider]"
        @click="emit('social-login', provider)"
      >
        <Icon class="h-5 w-5" :name="SOCIAL_PROVIDER_ICONS[provider]" />
      </button>
    </div>
  </div>
</template>
