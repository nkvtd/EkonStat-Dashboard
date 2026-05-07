<script setup lang="ts">
import type { Component } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
    icon: Component;
    title: string;
    count: number | string;
    href: string;
    actionText: string;
}>();
</script>

<template>
  <a
    :href="href"
    class="group grid h-full min-h-46 grid-rows-[auto_1fr_auto] border border-muted bg-surface transition-[background-color,border-color,color] duration-150 hover:border-primary hover:bg-secondary"
  >
    <div class="flex items-start gap-3 border-b border-muted p-4 sm:p-5">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center border border-muted text-primary transition-colors duration-150 group-hover:border-primary"
      >
        <component :is="icon" class="h-6 w-6 sm:h-7 sm:w-7" />
      </div>

      <h2 class="min-w-0 text-left text-base font-semibold leading-tight text-content sm:text-lg">
        {{ title }}
      </h2>
    </div>

    <div class="flex items-end p-4 sm:p-5">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
          {{ t('common.total') }}
        </p>

        <div class="mt-2 text-4xl font-bold leading-none text-content sm:text-5xl">
          <template v-if="typeof count === 'number'">
            {{ count.toLocaleString() }}+
          </template>
          <template v-else>
            {{ count }}
          </template>
        </div>
      </div>
    </div>

    <div
      class="flex min-h-12 items-center justify-between border-t border-muted px-4 sm:px-5 text-sm font-semibold uppercase tracking-[0.08em] text-accent transition-colors duration-150 group-hover:text-primary"
    >
      <span class="truncate">{{ actionText }}</span>
      <span aria-hidden="true">→</span>
    </div>
  </a>
</template>