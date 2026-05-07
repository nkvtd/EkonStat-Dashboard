<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import {
    BuildingGovernment24Regular,
    BuildingRetailMoney24Regular,
    DocumentCheckmark24Regular,
    DocumentEdit24Regular,
} from "@vicons/fluent";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import AppFooter from "../../components/AppFooter.vue";
import contractsService from "../../services/contracts.service";
import StatCard from "./components/StatCard.vue";

const { t } = useI18n();

const { data, isLoading } = useQuery({
    queryKey: ["contracts-stats"],
    queryFn: contractsService.stats.getStatistics,
});

const cards = computed(() => [
    {
        icon: BuildingGovernment24Regular,
        titleKey: "contracts.home.institutions",
        count: data.value?.institutionsCount ?? 0,
        href: "/contracts/institutions-and-contractors",
        actionTextKey: "contracts.home.searchInstitutions",
    },
    {
        icon: BuildingRetailMoney24Regular,
        titleKey: "contracts.home.economicOperators",
        count: data.value?.contractorsCount ?? 0,
        href: "/contracts/institutions-and-contractors",
        actionTextKey: "contracts.home.searchOperators",
    },
    {
        icon: DocumentEdit24Regular,
        titleKey: "contracts.home.awardedContracts",
        count: data.value?.awardedContractsCount ?? 0,
        href: "/contracts/awarded-contracts",
        actionTextKey: "contracts.home.searchContracts",
    },
    {
        icon: DocumentCheckmark24Regular,
        titleKey: "contracts.home.realisedTenders",
        count: data.value?.realisedContractsCount ?? 0,
        href: "/contracts/realised-contracts",
        actionTextKey: "contracts.home.searchTenders",
    },
]);
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col">
    <div class="flex-1 px-4 py-4 sm:px-6 lg:px-8">
      <section class="pt-2 sm:pt-4 lg:pt-6">
        <div class="mx-auto w-full max-w-384">
          <div class="mb-6 border-l-4 border-primary pl-4 sm:mb-8 sm:pl-5">
            <h1 class="text-3xl font-bold leading-tight text-content sm:text-4xl">
              {{ t('contracts.home.pageTitle') }}
            </h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-accent sm:text-base">
              {{ t('contracts.home.pageSubtitle') }}
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              v-for="card in cards"
              :key="card.titleKey"
              :icon="card.icon"
              :title="t(card.titleKey)"
              :count="isLoading ? '-' : card.count"
              :href="card.href"
              :action-text="t(card.actionTextKey)"
            />
          </div>
        </div>
      </section>
    </div>

    <AppFooter />
  </div>
</template>