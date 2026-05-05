<script setup lang="ts">
import AppFooter from "../../components/AppFooter.vue";
import Logo from "../../components/Logo.vue";
</script>

<template>
  <div class="flex min-h-[calc(100dvh-6rem)] flex-col bg-background md:min-h-[calc(100dvh-8.25rem)]">
    <div class="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="flex w-full max-w-xl flex-col items-center text-center">
        <Logo class="h-44 w-44 sm:h-55 sm:w-55" />

        <h1 class="mt-8 text-3xl font-bold leading-tight text-content sm:text-4xl">
          Делот за трезор сѐ уште не е достапна
        </h1>

        <p class="mt-3 text-sm leading-6 text-accent sm:text-base">
          Оваа страна е во изработка и моментално нема достапна содржина
        </p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>