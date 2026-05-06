<template>
  <div class="layout">
    <AppHeader />

    <main class="page-shell">
      <div class="page-loader" aria-hidden="true">
        <div class="page-loader__backdrop" />
        <div
          class="page-loader__content"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <div class="page-loader__spinner" />
          <span class="page-loader__label">Се вчитува...</span>
        </div>
      </div>

      <div id="page-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import {
    type Currency,
    DEFAULT_CURRENCY,
    isCurrency,
} from "../services/util/currencyConverter";

const currentStored =
    typeof window !== "undefined" ? localStorage.getItem("currency") : null;
const selectedCurrency = ref<Currency>(
    currentStored && isCurrency(currentStored)
        ? currentStored
        : DEFAULT_CURRENCY,
);
provide("selectedCurrency", selectedCurrency);
</script>

<style>
:root {
  --motion-base: 260ms;
  --motion-fast: 180ms;
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
}

body {
  margin: 0;
  overflow-x: hidden;
  box-sizing: border-box;
}

a {
  text-decoration: none;
}

.page-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

#page-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  opacity: 1;
  transform: translateY(0);
  will-change: opacity, transform;
  transition:
    opacity var(--motion-base) var(--ease-soft),
    transform var(--motion-base) var(--ease-soft),
    filter var(--motion-fast) ease;
}

.page-loader {
  position: absolute;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--motion-fast) ease,
    visibility 0s linear var(--motion-fast);
}

.page-loader__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-background) 84%, transparent);
  backdrop-filter: blur(4px);
}

.page-loader__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.page-loader__spinner {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  border: 3px solid color-mix(in srgb, var(--color-muted) 78%, transparent);
  border-top-color: var(--color-primary);
  animation: page-loader-spin 0.75s linear infinite;
}

.page-loader__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
}

body.page-transition #page-content {
  opacity: 0.4;
  transform: translateY(6px);
  filter: saturate(0.92);
}

body.page-transition .page-loader {
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

@keyframes page-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  #page-content,
  .page-loader {
    transition: none;
  }

  .page-loader__spinner {
    animation-duration: 1.2s;
  }
}
</style>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>