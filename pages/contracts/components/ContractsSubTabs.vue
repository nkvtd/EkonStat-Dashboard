<script setup lang="ts">
import { Home24Regular } from "@vicons/fluent";
import { usePageContext } from "vike-vue/usePageContext";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const pageContext = usePageContext();
const { t } = useI18n();
const pendingPath = ref<string | null>(null);

const routePath = computed(
    () => pageContext.urlPathname || window.location.pathname,
);

const activePath = computed(() => pendingPath.value ?? routePath.value);

const tabs = [
    { labelKey: "", href: "/contracts", icon: Home24Regular },
    {
        labelKey: "contracts.tabs.institutionsAndContractors",
        href: "/contracts/institutions-and-contractors",
    },
    {
        labelKey: "contracts.tabs.awardedContracts",
        href: "/contracts/awarded-contracts",
    },
    {
        labelKey: "contracts.tabs.realisedTenders",
        href: "/contracts/realised-contracts",
    },
];

watch(routePath, () => {
    pendingPath.value = null;
});

const isTabActive = (href: string) => activePath.value === href;

const handleTabClick = (href: string) => {
    pendingPath.value = href;
};
</script>

<template>
  <nav class="w-full">
    <div
      class="grid w-full grid-cols-2 overflow-hidden border border-muted bg-surface lg:inline-flex lg:w-auto lg:min-w-max lg:grid-cols-none"
    >
      <a
        v-for="(tab, index) in tabs"
        :key="tab.href"
        :href="tab.href"
        @click="handleTabClick(tab.href)"
        class="flex min-h-13 items-center justify-center gap-2 px-4 py-3 text-center text-sm font-semibold leading-tight transition-[background-color,color,border-color] duration-150"
        :class="[
          index % 2 !== 0 ? 'border-l border-muted' : '',
          index > 1 ? 'border-t border-muted' : '',
          index !== 0 ? 'lg:border-l' : '',
          index > 1 ? 'lg:border-t-0' : '',
          tab.icon ? 'min-w-13 shrink-0 lg:w-13' : 'min-w-0',
          !tab.icon ? 'col-span-1' : '',
          isTabActive(tab.href)
            ? 'bg-primary/50 text-content hover:bg-primary/25 hover:text-accent'
            : 'text-accent hover:bg-secondary hover:text-content',
        ]"
      >
        <component
          :is="tab.icon"
          v-if="tab.icon"
          class="h-5 w-5 shrink-0"
        />

        <span
          v-if="tab.labelKey"
            class="wrap-break-word text-center [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden"        >
          {{ t(tab.labelKey) }}
        </span>
      </a>
    </div>
  </nav>
</template>