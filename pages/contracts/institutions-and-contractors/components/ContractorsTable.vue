<script setup lang="ts">
import { useInfiniteQuery } from "@tanstack/vue-query";
import {
    type ColumnDef,
    FlexRender,
    getCoreRowModel,
    useVueTable,
} from "@tanstack/vue-table";
import {
    AlertOn24Regular,
    ArrowSort24Regular,
    Search24Regular,
} from "@vicons/fluent";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import contractsService from "../../../../services/contracts.service";
import type { ContractorsQuery } from "../../../../services/types/contracts/Query.types";
import type { ContractorItem } from "../../../../services/types/contracts/Response.types";

const emit = defineEmits<{
    select: [id: number];
}>();

const searchQuery = ref("");
const debouncedSearch = ref("");
const sorting = ref<{ id: string; desc: boolean }[]>([
    { id: "id", desc: false },
]);

let debounceTimer: ReturnType<typeof setTimeout>;

watch(searchQuery, (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        debouncedSearch.value = value.trim();
    }, 300);
});

const queryBase = computed<ContractorsQuery>(() => ({
    name: debouncedSearch.value || undefined,
    sortBy: sorting.value[0]?.id,
    sortDirection: sorting.value[0]?.desc ? "desc" : "asc",
    pageSize: 50,
}));

const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
} = useInfiniteQuery({
    queryKey: computed(() => ["contractors", queryBase.value]),
    queryFn: async ({ pageParam }) =>
        contractsService.contractors.getContractors({
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

const columns: ColumnDef<ContractorItem>[] = [
    {
        accessorKey: "name",
        id: "name",
        header: "Име на оператор",
        enableSorting: false,
    },
    {
        accessorKey: "earnings",
        id: "earnings",
        header: "Приход",
        cell: (info) => `${Number(info.getValue() ?? 0).toLocaleString()} ден.`,
    },
    {
        accessorKey: "awardedContractsCount",
        id: "awardedContractsCount",
        header: "Склучени договори",
    },
    {
        accessorKey: "realisedContractsCount",
        id: "realisedContractsCount",
        header: "Реализирани тендери",
    },
];

const table = useVueTable({
    get data() {
        return rows.value;
    },
    columns,
    state: {
        get sorting() {
            return sorting.value;
        },
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
        sorting.value =
            typeof updater === "function" ? updater(sorting.value) : updater;
    },
});

const parentRef = ref<HTMLDivElement | null>(null);
const containerHeight = ref(0);
const scrollTop = ref(0);
const ROW_HEIGHT = 52;
const OVERSCAN = 8;
let resizeObserver: ResizeObserver | null = null;

const onScroll = () => {
    const el = parentRef.value;
    if (!el) return;

    scrollTop.value = el.scrollTop;

    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 400 && hasNextPage.value && !isFetchingNextPage.value) {
        fetchNextPage();
    }
};

onMounted(() => {
    if (!parentRef.value) return;

    containerHeight.value = parentRef.value.clientHeight;

    resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            containerHeight.value = entry.contentRect.height;
        }
    });

    resizeObserver.observe(parentRef.value);
});

onUnmounted(() => {
    resizeObserver?.disconnect();
    clearTimeout(debounceTimer);
});

watch(
    queryBase,
    () => {
        scrollTop.value = 0;
        parentRef.value?.scrollTo({ top: 0 });
    },
    { deep: true },
);

const rowCount = computed(() => rows.value.length);
const startIndex = computed(() =>
    Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN),
);
const endIndex = computed(() =>
    Math.min(
        rowCount.value - 1,
        Math.ceil((scrollTop.value + containerHeight.value) / ROW_HEIGHT) +
            OVERSCAN,
    ),
);

const visibleRows = computed(() =>
    table.getRowModel().rows.slice(startIndex.value, endIndex.value + 1),
);

const paddingTop = computed(() => startIndex.value * ROW_HEIGHT);
const paddingBottom = computed(() => {
    const lastRendered = endIndex.value;
    if (lastRendered >= rowCount.value - 1) return 0;
    return (rowCount.value - lastRendered - 1) * ROW_HEIGHT;
});

const getSortState = (
    header: ReturnType<typeof table.getHeaderGroups>[number]["headers"][number],
) => header.column.getIsSorted();
</script>

<template>
  <div class="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border border-muted bg-surface">
    <div class="flex flex-none flex-col gap-3 border-b border-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold uppercase tracking-[0.08em] text-content">
          Економски оператори
        </h3>
      </div>

      <div class="relative w-full sm:w-72">
        <Search24Regular class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пребарај оператори..."
          class="h-10 w-full border border-muted bg-background py-2 pl-9 pr-4 text-sm text-content placeholder:text-tertiary focus:border-primary focus:outline-none"
        />
      </div>
    </div>

    <div
      ref="parentRef"
      class="min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
      @scroll="onScroll"
    >
      <table class="w-full min-w-2xl table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col class="w-[16rem]" />
          <col class="w-40" />
          <col class="w-32" />
          <col class="w-32" />
        </colgroup>

        <thead class="sticky top-0 z-10 bg-background">
          <tr>
            <th
              v-for="header in table.getHeaderGroups()[0]?.headers ?? []"
              :key="header.id"
               class="border-b-4 border-muted bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-150"
               :class="[
                 'text-left',
                 header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                getSortState(header)
                  ? 'bg-muted/50 text-content'
                  : 'text-content'
              ]"
              @click="header.column.getCanSort() && header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center justify-start gap-1.5">
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />

                <span
                  v-if="header.column.id !== 'name'"
                  class="inline-flex h-4 w-4 items-center justify-center"
                  :class="getSortState(header) ? 'text-primary' : 'text-tertiary'"
                >
                  <template v-if="getSortState(header) === 'asc'">↑</template>
                  <template v-else-if="getSortState(header) === 'desc'">↓</template>
                  <ArrowSort24Regular v-else class="h-4 w-4" />
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="isError && rows.length === 0">
            <td colspan="4" class="p-4">
              <div class="flex items-start gap-3 border border-red-300/60 bg-red-500/5 p-4">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center text-red-500">
                  <AlertOn24Regular class="h-5 w-5" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-content">
                    Не можевме да ги вчитаме операторите
                  </p>
                  <p class="mt-1 text-sm leading-5 text-accent">
                    Податоците моментално не се достапни. Обидете се повторно за неколку секунди.
                  </p>
                </div>

                <button
                  class="shrink-0 border border-red-300/70 bg-surface px-3 py-2 text-sm font-medium text-content transition-colors duration-150 hover:bg-red-500/5"
                  @click="refetch()"
                >
                  Обиди се повторно
                </button>
              </div>
            </td>
          </tr>

          <tr v-else-if="isLoading && rows.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-accent">
              Вчитување...
            </td>
          </tr>

          <tr v-else-if="rows.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-accent">
              Не се пронајдени оператори.
            </td>
          </tr>

          <tr v-if="paddingTop > 0">
            <td colspan="4" :style="{ height: `${paddingTop}px`, padding: 0, border: 0 }" />
          </tr>

          <tr
            v-for="row in visibleRows"
            :key="row.id"
            class="cursor-pointer border-b border-muted/70 odd:bg-surface even:bg-background/50 transition-colors duration-150 hover:bg-secondary/60"
            :style="{ height: `${ROW_HEIGHT}px` }"
            @click="emit('select', row.original.id)"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-4 py-3 align-middle"
              :class="
                cell.column.id === 'name'
                  ? 'truncate text-left font-medium text-content'
                  : 'whitespace-nowrap text-left text-accent'
              "
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>

          <tr v-if="paddingBottom > 0">
            <td colspan="4" :style="{ height: `${paddingBottom}px`, padding: 0, border: 0 }" />
          </tr>

          <tr v-if="isFetchingNextPage">
            <td colspan="4" class="border-t border-muted px-4 py-3 text-center text-xs uppercase tracking-[0.08em] text-tertiary">
              Се вчитуваат повеќе резултати...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>