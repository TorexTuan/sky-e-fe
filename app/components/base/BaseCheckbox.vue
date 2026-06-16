<script setup lang="ts">
import { computed } from 'vue'

// Allow passing attributes (like data-testid) to the input
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: boolean
  label?: string
  id?: string
  disabled?: boolean
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = computed(() => props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`)

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <div class="flex items-center space-x-2" :class="props.class">
    <input
      v-bind="$attrs"
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="peer h-4 w-4 shrink-0 cursor-pointer rounded border border-gray-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 text-purple-600 accent-purple-600"
      @change="handleChange"
    >
    <label
      v-if="label || $slots.default"
      :for="checkboxId"
      class="cursor-pointer text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
