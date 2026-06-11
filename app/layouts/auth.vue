<script setup lang="ts">
useSeoMeta({
  title: 'Skye — Authentication',
})
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <!-- Left: Branding panel (desktop only) -->
    <div class="hidden lg:flex">
      <AuthBrandingPanel />
    </div>

    <!-- Right: Form content -->
    <div class="flex items-center justify-center bg-white px-4 py-8 sm:px-8 lg:px-12">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template> 
