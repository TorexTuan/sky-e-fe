<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div
    class="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-8 text-white lg:p-12"
  >
    <!-- Decorative background circles -->
    <div class="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
    <div class="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" />

    <!-- Logo -->
    <div class="relative z-10 flex items-center gap-3">
      <Icon name="mdi:shopping" size="32" class="shrink-0 text-white" />
      <span class="text-2xl font-bold leading-none tracking-tight">Skye</span>
    </div>

    <!-- Main content -->
    <div class="relative z-10 space-y-8">
      <div class="space-y-3">
        <h1 class="text-3xl font-bold leading-tight lg:text-4xl">
          {{ t('auth.branding.title') }}
        </h1>
        <p class="max-w-md text-base leading-relaxed text-white/80">
          {{ t('auth.branding.subtitle') }}
        </p>
      </div>

      <!-- Feature cards -->
      <div class="space-y-3">
        <AuthFeatureCard
          icon="mdi:flash"
          :title="t('auth.features.flash_sale')"
          :description="t('auth.branding.flash_sale_desc')"
        />
        <AuthFeatureCard
          icon="mdi:trending-up"
          :title="t('auth.features.latest_trends')"
          :description="t('auth.branding.latest_trends_desc')"
        />
        <AuthFeatureCard
          icon="mdi:shield-check"
          :title="t('auth.features.buyer_protection')"
          :description="t('auth.branding.buyer_protection_desc')"
        />
      </div>
    </div>

    <!-- Stats bar -->
    <div class="relative z-10 flex items-center gap-6 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-md">
      <div class="flex-1 text-center">
        <div class="text-xl font-bold lg:text-2xl">10M+</div>
        <div class="text-xs text-white/70">{{ t('auth.stats.users').replace('10M+ ', '') }}</div>
      </div>
      <div class="h-8 w-px bg-white/20" />
      <div class="flex-1 text-center">
        <div class="text-xl font-bold lg:text-2xl">500K+</div>
        <div class="text-xs text-white/70">{{ t('auth.stats.products').replace('500K+ ', '') }}</div>
      </div>
      <div class="h-8 w-px bg-white/20" />
      <div class="flex-1 text-center">
        <div class="text-xl font-bold lg:text-2xl">99%</div>
        <div class="text-xs text-white/70">{{ t('auth.stats.satisfaction').replace('99% ', '') }}</div>
      </div>
    </div>
  </div>
</template>
