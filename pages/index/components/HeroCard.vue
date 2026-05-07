<script setup lang="ts">
import { ChevronDownOutline, LogoGithub } from "@vicons/ionicons5";
import { useI18n } from "vue-i18n";
import Logo from "../../../components/Logo.vue";

const { t } = useI18n();

defineProps<{
    githubHref: string;
}>();

const emit = defineEmits<{
    datasetsClick: [];
}>();
</script>

<template>
  <section class="border border-muted bg-surface">
    <div class="p-10 sm:p-6 lg:p-12">
      <div
        class="flex flex-col items-center gap-5 text-center lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-8 lg:text-left"
      >
        <div class="flex justify-center lg:justify-start">
          <Logo class="h-24 w-24 shrink-0 sm:h-32 sm:w-32 lg:h-48 lg:w-48" />
        </div>

        <div class="min-w-0 w-full">
          <div class="mt-2 lg:mt-0 lg:border-l-4 lg:border-primary lg:pl-6">
            <h1 class="text-4xl font-bold leading-none text-content sm:text-5xl lg:text-6xl">
              {{ t('common.title') }}
            </h1>

            <p class="mx-auto mt-4 max-w-2xl text-base leading-7 text-accent sm:text-lg lg:mx-0">
              {{ t('home.heroDesc') }}
            </p>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <button
              @click="emit('datasetsClick')"
              class="inline-flex min-h-11.5 items-center justify-center gap-2 border border-primary bg-primary px-5 text-sm font-semibold uppercase tracking-[0.08em] text-black transition-[background-color,color,border-color] duration-240 ease-in-out hover:bg-transparent hover:text-primary sm:px-6"
            >
              <span>{{ t('home.viewDatasets') }}</span>
              <ChevronDownOutline class="h-5 w-5" />
            </button>

            <a
              :href="githubHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-11.5 items-center justify-center gap-2 border border-muted bg-surface px-5 text-sm font-semibold uppercase tracking-[0.08em] text-content transition-[background-color,color,border-color] duration-240 ease-in-out hover:border-primary hover:text-primary sm:px-6"
            >
              <LogoGithub class="h-5 w-5" />
              <span>{{ t('home.contributeOnGithub') }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>