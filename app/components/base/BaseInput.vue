<script setup lang="ts">
import { useSlots, computed } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  id?: string
  disabled?: boolean
  error?: string
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
}>()

const slots = useSlots()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const inputClasses = computed(() => {
  return cn(
    'flex h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50',
    slots.prefix ? 'pl-10' : '',
    slots.suffix ? 'pr-10' : '',
    props.error ? 'border-red-500 focus-visible:ring-red-500' : '',
    props.class
  )
})
</script>

<template>
  <div class="space-y-2 w-full">
    <div v-if="label || slots.label" class="flex items-center justify-between">
      <label class="text-sm font-medium leading-none text-gray-700" :for="inputId">
        <slot name="label">{{ label }}</slot>
      </label>
      <slot name="label-right" />
    </div>
    
    <div class="relative">
      <div v-if="slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
        <slot name="prefix" />
      </div>
      
      <input
        v-bind="$attrs"
        :class="inputClasses"
        :disabled="disabled"
        :id="inputId"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
        @blur="handleBlur"
      >
      
      <div v-if="slots.suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center cursor-pointer">
        <slot name="suffix" />
      </div>
    </div>
    
    <p v-if="error" class="text-sm font-medium text-red-500" :data-testid="`${$attrs['data-testid'] || inputId}-error`">
      {{ error }}
    </p>
  </div>
</template>
