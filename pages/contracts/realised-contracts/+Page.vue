<script setup lang="ts">
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import type { SortingState } from "@tanstack/vue-table";
import {
    Dismiss24Regular,
    Filter24Regular,
    FilterDismiss24Regular,
} from "@vicons/fluent";
import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    type Ref,
    reactive,
    ref,
    watch,
} from "vue";
import { useI18n } from "vue-i18n";
import contractsService from "../../../services/contracts.service";
import type { RealisedContractsQuery } from "../../../services/types/contracts/Query.types";
import type {
    RealisedContractItem,
    ReferenceDataResponse,
} from "../../../services/types/contracts/Response.types";
import {
    type Currency,
    convertToMkd,
} from "../../../services/util/currencyConverter";
import ContractsSubTabs from "../components/ContractsSubTabs.vue";
import RealisedContractDrawer from "./components/RealisedContractDrawer.vue";
import RealisedContractsFilters from "./components/RealisedContractsFilters.vue";
import RealisedContractsTable from "./components/RealisedContractsTable.vue";

const { t } = useI18n();

type FilterForm = {
    subject: string;
    institution: string;
    contractor: string;
    typeProcedureId: string;
    typeOfferId: string;
    typeFrameworkAgreementId: string;
    moreThanAssignedValue: string;
    lessThanAssignedValue: string;
    moreThanRealisedValue: string;
    lessThanRealisedValue: string;
    moreThanPaidValue: string;
    lessThanPaidValue: string;
    afterPostDate: string;
    beforePostDate: string;
};

const initialFilters = (): FilterForm => ({
    subject: "",
    institution: "",
    contractor: "",
    typeProcedureId: "",
    typeOfferId: "",
    typeFrameworkAgreementId: "",
    moreThanAssignedValue: "",
    lessThanAssignedValue: "",
    moreThanRealisedValue: "",
    lessThanRealisedValue: "",
    moreThanPaidValue: "",
    lessThanPaidValue: "",
    afterPostDate: "",
    beforePostDate: "",
});

const filters = reactive<FilterForm>(initialFilters());
const debouncedFilters = ref<FilterForm>(initialFilters());
const sorting = ref<SortingState>([]);
const selectedContract = ref<RealisedContractItem | null>(null);
const mobileFiltersOpen = ref(false);
const desktopFiltersOpen = ref(true);
const isDesktop = ref(false);

let debounceTimer: ReturnType<typeof setTimeout>;

watch(
    filters,
    (value) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            debouncedFilters.value = { ...value };
        }, 300);
    },
    { deep: true, immediate: true },
);

const syncViewport = () => {
    isDesktop.value = window.innerWidth >= 1024;
};

onMounted(() => {
    syncViewport();
    window.addEventListener("resize", syncViewport);
});

onUnmounted(() => {
    clearTimeout(debounceTimer);
    window.removeEventListener("resize", syncViewport);
});

const toPositiveNumber = (value: string) => {
    if (value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const selectedCurrency = inject<Ref<Currency>>("selectedCurrency");

const toMoneyFilterValue = (value: string): number | undefined => {
    const num = toPositiveNumber(value);
    return num !== undefined
        ? convertToMkd(num, selectedCurrency?.value)
        : undefined;
};

const pad = (value: number) => String(value).padStart(2, "0");

const getTimezoneOffsetString = (date: Date) => {
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absolute = Math.abs(offsetMinutes);
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;

    return `${sign}${pad(hours)}:${pad(minutes)}`;
};

const toZonedDateTimeString = (value: string) => {
    if (!value) return undefined;

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return undefined;

    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    return `${year}-${pad(month)}-${pad(day)}T00:00:00${getTimezoneOffsetString(localDate)}`;
};

const queryBase = computed<RealisedContractsQuery>(() => {
    const activeSort = sorting.value[0];

    return {
        subject: debouncedFilters.value.subject.trim() || undefined,
        institution: debouncedFilters.value.institution.trim() || undefined,
        contractor: debouncedFilters.value.contractor.trim() || undefined,
        typeProcedureId: toPositiveNumber(
            debouncedFilters.value.typeProcedureId,
        ),
        typeOfferId: toPositiveNumber(debouncedFilters.value.typeOfferId),
        typeFrameworkAgreementId: toPositiveNumber(
            debouncedFilters.value.typeFrameworkAgreementId,
        ),
        moreThanAssignedValue: toMoneyFilterValue(
            debouncedFilters.value.moreThanAssignedValue,
        ),
        lessThanAssignedValue: toMoneyFilterValue(
            debouncedFilters.value.lessThanAssignedValue,
        ),
        moreThanRealisedValue: toMoneyFilterValue(
            debouncedFilters.value.moreThanRealisedValue,
        ),
        lessThanRealisedValue: toMoneyFilterValue(
            debouncedFilters.value.lessThanRealisedValue,
        ),
        moreThanPaidValue: toMoneyFilterValue(
            debouncedFilters.value.moreThanPaidValue,
        ),
        lessThanPaidValue: toMoneyFilterValue(
            debouncedFilters.value.lessThanPaidValue,
        ),
        afterPostDate: toZonedDateTimeString(
            debouncedFilters.value.afterPostDate,
        ),
        beforePostDate: toZonedDateTimeString(
            debouncedFilters.value.beforePostDate,
        ),
        sortBy: activeSort?.id,
        sortDirection: activeSort
            ? activeSort.desc
                ? "desc"
                : "asc"
            : undefined,
        pageSize: 50,
    };
});

const { data: referenceData, isLoading: isReferenceLoading } =
    useQuery<ReferenceDataResponse>({
        queryKey: ["contracts-reference"],
        queryFn: contractsService.reference.getReferenceData,
        staleTime: 1000 * 60 * 30,
    });

const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
} = useInfiniteQuery({
    queryKey: computed(() => ["realised-contracts", queryBase.value]),
    queryFn: async ({ pageParam }) =>
        contractsService.realised.getRealisedContracts({
            ...queryBase.value,
            cursor: pageParam as string | undefined,
        }),
    getNextPageParam: (lastPage) =>
        lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    retry: 1,
});

const rows = computed(
    () => data.value?.pages.flatMap((page) => page.data ?? []) ?? [],
);

const activeFiltersCount = computed(
    () =>
        [
            filters.subject,
            filters.institution,
            filters.contractor,
            filters.typeProcedureId,
            filters.typeOfferId,
            filters.typeFrameworkAgreementId,
            filters.moreThanAssignedValue,
            filters.lessThanAssignedValue,
            filters.moreThanRealisedValue,
            filters.lessThanRealisedValue,
            filters.moreThanPaidValue,
            filters.lessThanPaidValue,
            filters.afterPostDate,
            filters.beforePostDate,
        ].filter(Boolean).length,
);

const filtersAreOpen = computed(() =>
    isDesktop.value ? desktopFiltersOpen.value : mobileFiltersOpen.value,
);

const openDrawer = (contract: RealisedContractItem) => {
    selectedContract.value = contract;
};

const closeDrawer = () => {
    selectedContract.value = null;
};

const resetFilters = () => {
    Object.assign(filters, initialFilters());
};

const toggleDesktopFilters = () => {
    desktopFiltersOpen.value = !desktopFiltersOpen.value;
};

const openFilters = () => {
    if (isDesktop.value) {
        toggleDesktopFilters();
        return;
    }

    mobileFiltersOpen.value = true;
};

const closeMobileFilters = () => {
    mobileFiltersOpen.value = false;
};
</script>

<template>
  <div
    class="relative min-h-0 h-[calc(100dvh-6rem)] overflow-hidden md:h-[calc(100dvh-8.25rem)]"
  >
    <aside
      class="absolute inset-y-0 left-0 top-0 z-20 hidden w-[18rem] transform transition-[transform,opacity] duration-200 ease-out lg:flex"
      :class="
        desktopFiltersOpen
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0 pointer-events-none'
      "
    >
      <div
        class="flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-muted bg-surface"
      >
        <div
          class="flex items-start justify-between gap-3 border-b border-muted bg-background px-4 py-4"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
              {{ t('common.filters') }}
            </p>
            <p class="mt-1 text-xs uppercase tracking-[0.08em] text-tertiary">
              {{ activeFiltersCount }} {{ t('common.activeFilters') }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="inline-flex h-10 items-center justify-center border border-muted bg-surface px-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent transition-colors duration-150 hover:bg-secondary hover:text-content"
              @click="resetFilters"
            >
              {{ t('actions.clear') }}
            </button>

            <button
              class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-accent transition-colors duration-150 hover:bg-secondary hover:text-content"
              aria-label="Close filters"
              @click="toggleDesktopFilters"
            >
              <Dismiss24Regular class="h-5 w-5" />
            </button>
          </div>
        </div>

        <RealisedContractsFilters
          embedded
          class="min-h-0 flex-1 border-0"
          :model-value="filters"
          :reference-data="referenceData"
          :is-reference-loading="isReferenceLoading"
          :active-count="activeFiltersCount"
          @update:model-value="Object.assign(filters, $event)"
          @reset="resetFilters"
        />
      </div>
    </aside>

    <div
      class="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] transition-[padding-left] duration-200 ease-out"
      :class="desktopFiltersOpen ? 'lg:pl-72' : 'lg:pl-0'"
    >
      <div class="border-b border-muted bg-background px-4 py-4 sm:px-6 lg:px-8">
        <ContractsSubTabs />
      </div>

      <div
        class="flex items-center justify-start gap-3 border-b border-muted bg-surface px-4 py-3"
      >
        <button
          class="inline-flex h-10 items-center justify-center gap-2 border border-muted px-3 text-sm font-semibold uppercase tracking-[0.08em] text-content transition-colors duration-150 hover:text-accent"
          :class="[filtersAreOpen
            ? 'bg-primary/50 hover:bg-primary/25'
            : 'bg-background hover:bg-background/25']"
          @click="openFilters"
        >
          <FilterDismiss24Regular v-if="filtersAreOpen" class="h-4 w-4" />
          <Filter24Regular v-else class="h-4 w-4" />
          <span>{{ t('common.filters') }}</span>
        </button>

        <div class="min-w-0">
          <h3 class="text-sm font-semibold uppercase tracking-[0.08em] text-content">
            {{ t('contracts.tabs.realisedTenders') }}
          </h3>
          <p class="mt-1 text-xs uppercase tracking-[0.08em] text-tertiary">
            {{ t('common.activeFilters') }}: {{ activeFiltersCount }}
          </p>
        </div>
      </div>

      <div class="min-h-0 overflow-hidden">
        <RealisedContractsTable
          class="h-full min-h-0"
          :rows="rows"
          :sorting="sorting"
          :is-loading="isLoading"
          :is-error="isError"
          :is-fetching-next-page="isFetchingNextPage"
          :has-next-page="hasNextPage"
          :active-filters-count="activeFiltersCount"
          @update:sorting="sorting = $event"
          @retry="refetch"
          @fetch-more="fetchNextPage"
          @select="openDrawer"
        />
      </div>
    </div>

    <Teleport to="body">
      <Transition
        appear
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileFiltersOpen"
          class="fixed inset-0 z-79 bg-content/55 backdrop-blur-[2px] lg:hidden"
          @click="closeMobileFilters"
        />
      </Transition>

      <Transition
        appear
        enter-active-class="transform-gpu transition-[transform,opacity] duration-200 ease-out"
        enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transform-gpu transition-[transform,opacity] duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-4 opacity-0"
      >
        <aside
          v-if="mobileFiltersOpen"
          class="fixed inset-0 z-80 flex flex-col overflow-hidden bg-content text-white dark:bg-background lg:hidden"
        >
          <div
            class="flex items-start justify-between gap-3 border-b border-white/15 bg-white/5 px-4 py-4"
          >
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-white">
                {{ t('common.filters') }}
              </p>
              <p class="mt-1 text-xs uppercase tracking-[0.08em] text-white/65">
                {{ t('common.active') }}: {{ activeFiltersCount }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="inline-flex h-10 items-center justify-center border border-white/15 bg-white/5 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                @click="resetFilters"
              >
                {{ t('actions.clear') }}
              </button>

              <button
                class="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                :aria-label="t('actions.closeFilters')"
              >
                <Dismiss24Regular class="h-5 w-5" />
              </button>
            </div>
          </div>

          <RealisedContractsFilters
            embedded
            class="min-h-0 flex-1 border-0"
            :model-value="filters"
            :reference-data="referenceData"
            :is-reference-loading="isReferenceLoading"
            :active-count="activeFiltersCount"
            @update:model-value="Object.assign(filters, $event)"
            @reset="resetFilters"
          />
          <div class="border-t border-white/15 p-4">
            <button
              type="button"
              class="flex h-11 w-full items-center justify-center border border-white/15 bg-primary px-4 text-sm font-semibold uppercase tracking-[0.08em] text-black transition-colors duration-150 hover:bg-primary/50 hover:text-white"
              @click="closeMobileFilters"
            >
              {{ t("actions.search") }}
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <RealisedContractDrawer
      :is-open="!!selectedContract"
      :contract="selectedContract"
      @close="closeDrawer"
    />
  </div>
</template>