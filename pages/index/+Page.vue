<script setup lang="ts">
import {
    BuildingBank24Regular,
    DocumentCatchUp24Regular,
} from "@vicons/fluent";
import { onMounted, onUnmounted } from "vue";
import AppFooter from "../../components/AppFooter.vue";
import DatasetCard from "./components/DatasetCard.vue";
import HeroCard from "./components/HeroCard.vue";

const scrollToDatasets = () => {
    document.getElementById("datasets")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};

onMounted(() => {
    document.documentElement.classList.add("page-landing");
});

onUnmounted(() => {
    document.documentElement.classList.remove("page-landing");
});
</script>

<template>
  <div class="flex flex-col bg-background">
    <section
      class="min-h-screen snap-always snap-start bg-background px-4 py-4 sm:px-6 lg:px-8"
    >
      <div class="mx-auto w-full max-w-336">
        <div
          class="flex min-h-[calc(100dvh-8rem)] flex-col justify-start pt-6 sm:min-h-[calc(100dvh-9rem)] sm:pt-8 lg:pt-10"
        >
          <HeroCard
            github-href="https://github.com/nkvtd/EkonStat-API"
            @datasets-click="scrollToDatasets"
          />
        </div>
      </div>
    </section>

    <section
      id="datasets"
      class="min-h-screen snap-always snap-start bg-background"
    >
      <div
        class="mx-auto grid h-[calc(100dvh-8rem)] w-full max-w-336 grid-rows-[1fr_auto] sm:h-[calc(100dvh-9rem)]"
      >
        <div class="px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
          <div class="mb-6 border-l-4 border-primary pl-4 sm:mb-8 sm:pl-5">
            <h2 class="text-3xl font-bold leading-tight text-content sm:text-4xl">
              Јавно достапни податоци
            </h2>
            <p class="mt-2 text-sm leading-6 text-accent sm:text-base">
              Избери област
            </p>
          </div>

          <div class="grid grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            <DatasetCard
              :icon="DocumentCatchUp24Regular"
              title="Јавни Набавки"
              description="База на податоци за јавни набавки, договори, јавни институции и економски оператори."
              href="/contracts"
              action-text="Пребарај тендери"
            />

            <DatasetCard
              :icon="BuildingBank24Regular"
              title="Трезор"
              description="Увид во сите трансакции и исплати од државниот буџет."
              href="/treasury"
              action-text="Пребарај трансакции"
            />
          </div>
        </div>

        <AppFooter />
      </div>
    </section>
  </div>
</template>

<style>
.page-landing {
  scroll-snap-type: y mandatory;
  scroll-padding-top: 6rem;
  scroll-behavior: smooth;
}

@media (min-width: 768px) {
  .page-landing {
    scroll-padding-top: 9rem;
  }
}
</style>