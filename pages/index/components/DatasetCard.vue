<script setup lang="ts">
import { ArrowRight24Regular } from "@vicons/fluent";
import type { Component } from "vue";

defineProps<{
    icon: Component;
    title: string;
    description: string;
    href: string;
    actionText: string;
}>();
</script>

<template>
  <a
    :href="href"
    class="group flex h-full flex-col border border-muted bg-surface p-6 transition-[background-color,border-color,color,transform] duration-180 hover:border-primary hover:bg-secondary/60"
    >
    <div class="flex items-start gap-4 border-b border-muted pb-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center border border-muted bg-background text-primary transition-colors duration-150 group-hover:border-primary"
      >
        <component :is="icon" class="h-7 w-7" />
      </div>

      <div class="min-w-0">
        <h2 class="text-xl font-semibold leading-tight text-content">
          {{ title }}
        </h2>
      </div>
    </div>

    <p class="flex-1 pt-4 text-sm leading-6 text-accent">
      {{ description }}
    </p>

    <div
      class="mt-6 flex items-center justify-between border-t border-muted pt-4 text-sm font-semibold uppercase tracking-[0.08em] text-primary"
    >
      <span>{{ actionText }}</span>
      <ArrowRight24Regular class="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </div>
  </a>
</template>