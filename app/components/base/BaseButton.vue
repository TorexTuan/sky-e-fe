<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  class?: string
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  class: ''
})

const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90 shadow-md',
  outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900',
  ghost: 'hover:bg-gray-100 hover:text-gray-900 text-gray-600',
  link: 'text-purple-600 underline-offset-4 hover:underline'
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 py-2 text-base',
  lg: 'h-12 px-8 text-lg',
  icon: 'h-10 w-10'
}

const computedClasses = computed(() => {
  return cn(
    baseClasses,
    variants[props.variant],
    sizes[props.size],
    props.class
  )
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="computedClasses"
  >
    <slot />
  </button>
</template>
