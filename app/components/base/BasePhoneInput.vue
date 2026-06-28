<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PHONE_COUNTRIES } from '~/constants/auth'
import type { PhoneCountry } from '~/constants/auth'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: string
  dialCode: string
  label?: string
  error?: string
  disabled?: boolean
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:dialCode': [dialCode: string]
  'blur': [event: FocusEvent]
}>()

// --- Dropdown state ---
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedCountry = computed<PhoneCountry>(
  () => PHONE_COUNTRIES.find((c) => c.dialCode === props.dialCode) ?? PHONE_COUNTRIES[0]!,
)

function selectCountry(country: PhoneCountry) {
  emit('update:dialCode', country.dialCode)
  isOpen.value = false
}

function toggleDropdown() {
  if (!props.disabled) isOpen.value = !isOpen.value
}

// Close on outside click
function handleOutsideClick(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

// --- Input ---
const inputId = computed(() => props.id || `phone-input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const inputClasses = computed(() =>
  cn(
    'flex h-12 w-full rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50',
    props.error ? 'border-red-500 focus-visible:ring-red-500' : '',
  ),
)

const triggerClasses = computed(() =>
  cn(
    'flex h-12 shrink-0 cursor-pointer items-center gap-1.5 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 transition-colors hover:bg-gray-100',
    props.error ? 'border-red-500' : '',
    props.disabled ? 'cursor-not-allowed opacity-50' : '',
  ),
)
</script>

<template>
  <div class="w-full space-y-2">
    <!-- Label -->
    <label
      v-if="label"
      class="text-sm font-medium leading-none text-gray-700"
      :for="inputId"
    >
      {{ label }}
    </label>

    <!-- Input row -->
    <div ref="dropdownRef" class="relative flex">
      <!-- Country Dropdown Trigger -->
      <button
        type="button"
        data-testid="phone-country-trigger"
        aria-haspopup="listbox"
        :class="triggerClasses"
        :disabled="disabled"
        :aria-expanded="isOpen"
        @click="toggleDropdown"
      >
        <Icon class="h-4 w-4 shrink-0" :name="selectedCountry.flag" />
        <span class="text-sm font-medium text-gray-700">{{ selectedCountry.dialCode }}</span>
        <Icon
          class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
          name="mdi:chevron-down"
        />
      </button>

      <!-- Phone Number Input -->
      <input
        v-bind="$attrs"
        type="tel"
        :id="inputId"
        :class="inputClasses"
        :disabled="disabled"
        :value="modelValue"
        :placeholder="selectedCountry.exampleSubscriber"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @input="handleInput"
        @blur="handleBlur"
      />

      <!-- Country Dropdown Menu -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <ul
          v-if="isOpen"
          class="absolute left-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
          data-testid="phone-country-dropdown"
        >
          <li
            v-for="country in PHONE_COUNTRIES"
            class="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
            role="option"
            :key="country.code"
            :class="{ 'bg-purple-50 font-medium text-purple-700': country.dialCode === dialCode }"
            :aria-selected="country.dialCode === dialCode"
            :data-testid="`phone-country-option-${country.code.toLowerCase()}`"
            @click="selectCountry(country)"
          >
            <Icon class="h-4 w-4 shrink-0" :name="country.flag" />
            <span>{{ country.label }}</span>
            <Icon
              v-if="country.dialCode === dialCode"
              class="ml-auto h-4 w-4 text-purple-600"
              name="mdi:check"
            />
          </li>
        </ul>
      </Transition>
    </div>

    <!-- Error Message -->
    <p
      v-if="error"
      class="text-sm font-medium text-red-500"
      :id="`${inputId}-error`"
      :data-testid="`${$attrs['data-testid'] || inputId}-error`"
    >
      {{ error }}
    </p>
  </div>
</template>
