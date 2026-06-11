<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="flex items-start gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-md transition-transform duration-200 hover:scale-[1.02]">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
      <Icon :name="icon" class="h-5 w-5 text-white" />
    </div>
    <div class="min-w-0">
      <h3 class="text-sm font-bold text-white">{{ title }}</h3>
      <p class="mt-0.5 text-xs leading-relaxed text-white/70">{{ description }}</p>
    </div>
  </div>
</template>
