<script setup lang="ts">
import {
    type ColumnDef,
    FlexRender,
    getCoreRowModel,
    type Header,
    type SortingState,
    type Updater,
    useVueTable,
} from "@tanstack/vue-table";
import { AlertOn24Regular, ArrowSort24Regular } from "@vicons/fluent";
import {
    computed,
    inject,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
    watch,
} from "vue";
import { useI18n } from "vue-i18n";
import type { AwardedContractItem } from "../../../../services/types/contracts/Response.types";
import {
    type Currency,
    formatCurrency,
} from "../../../../services/util/currencyConverter";

const { t } = useI18n();

const props = withDefaults(
    defineProps<{
        rows: AwardedContractItem[];
        sorting: SortingState;
        isLoading: boolean;
        isError: boolean;
        isFetchingNextPage: boolean;
        hasNextPage?: boolean;
        activeFiltersCount?: number;
    }>(),
    {
        hasNextPage: false,
        activeFiltersCount: 0,
    },
);

const emit = defineEmits<{
    "update:sorting": [value: SortingState];
    retry: [];
    fetchMore: [];
    select: [contract: AwardedContractItem];
}>();

const selectedCurrency = inject("selectedCurrency") as Ref<Currency>;

const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
};

const textColumnIds = ["institution", "contractor"];
const numericColumnIds = [
    "numChanges",
    "estimatedContractValue",
    "originalContractValue",
    "assignedContractValue",
    "postDate",
    "processNumber",
];

const columns = computed<ColumnDef<AwardedContractItem>[]>(() => [
    {
        accessorKey: "processNumber",
        id: "processNumber",
        header: () => t("contracts.table.processNumber"),
        enableSorting: false,
        cell: (info) => info.getValue() || "—",
    },
    {
        accessorFn: (row) => row.numChanges ?? 0,
        id: "numChanges",
        header: () => t("contracts.table.numChanges"),
        cell: (info) => info.getValue() ?? 0,
    },
    {
        accessorFn: (row) => row.institution?.name ?? "—",
        id: "institution",
        header: () => t("contracts.table.publicInstitution"),
        enableSorting: false,
    },
    {
        accessorFn: (row) => row.contractor?.name ?? "—",
        id: "contractor",
        header: () => t("contracts.table.economicOperator"),
        enableSorting: false,
    },
    {
        accessorKey: "estimatedContractValue",
        id: "estimatedContractValue",
        header: () => t("contracts.table.estimatedValue"),
        cell: (info) =>
            formatCurrency(
                Number(info.getValue() ?? 0),
                selectedCurrency.value,
            ),
    },
    {
        accessorKey: "assignedContractValue",
        id: "assignedContractValue",
        header: () => t("contracts.table.assignedValue"),
        cell: (info) =>
            formatCurrency(
                Number(info.getValue() ?? 0),
                selectedCurrency.value,
            ),
    },
    {
        accessorKey: "originalContractValue",
        id: "originalContractValue",
        header: () => t("contracts.table.originalValue"),
        cell: (info) =>
            formatCurrency(
                Number(info.getValue() ?? 0),
                selectedCurrency.value,
            ),
    },
    {
        accessorKey: "postDate",
        id: "postDate",
        header: () => t("contracts.table.postDate"),
        cell: (info) =>
            formatDate(info.getValue() as string | null | undefined),
    },
]);

const table = useVueTable({
    get data() {
        return props.rows;
    },
    get columns() {
        return columns.value;
    },
    state: {
        get sorting() {
            return props.sorting;
        },
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater: Updater<SortingState>) => {
        const nextSorting =
            typeof updater === "function" ? updater(props.sorting) : updater;
        emit("update:sorting", nextSorting);
    },
});

const parentRef = ref<HTMLDivElement | null>(null);
const containerHeight = ref(0);
const scrollTop = ref(0);
const ROW_HEIGHT = 56;
const OVERSCAN = 8;
let resizeObserver: ResizeObserver | null = null;

const onScroll = () => {
    const el = parentRef.value;
    if (!el) return;

    scrollTop.value = el.scrollTop;

    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 400 && props.hasNextPage && !props.isFetchingNextPage) {
        emit("fetchMore");
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
});

watch(
    () => props.sorting,
    () => {
        scrollTop.value = 0;
        parentRef.value?.scrollTo({ top: 0 });
    },
    { deep: true },
);

const rowCount = computed(() => props.rows.length);

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

const getSortState = (header: Header<AwardedContractItem, unknown>) =>
    header.column.getIsSorted();

const isTextColumn = (id: string) => textColumnIds.includes(id);
const isNumericColumn = (id: string) => numericColumnIds.includes(id);
</script>

<template>
  <div class="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border border-muted bg-surface">
    <div
      ref="parentRef"
      class="min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
      @scroll="onScroll"
    >
      <table class="w-full min-w-368 table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col class="w-36" />
          <col class="w-24" />
          <col class="w-[18rem]" />
          <col class="w-[18rem]" />
          <col class="w-40" />
          <col class="w-40" />
          <col class="w-40" />
          <col class="w-36" />
        </colgroup>

        <thead class="sticky top-0 z-10 bg-background">
          <tr>
            <th
              v-for="header in table.getHeaderGroups()[0]?.headers ?? []"
              :key="header.id"
              class="border-b-2 border-muted bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-content transition-colors duration-150"
              :class="[
                'text-left',
                header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-secondary/50' : '',
                getSortState(header) ? 'bg-muted/50' : '',
              ]"
              @click="
                header.column.getCanSort() &&
                header.column.getToggleSortingHandler()?.($event)
              "
            >
              <div class="flex items-center justify-start gap-1.5">
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />

                <span
                  v-if="header.column.getCanSort()"
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
            <td colspan="8" class="p-4">
              <div class="flex items-start gap-3 border border-red-300/60 bg-red-500/5 p-4">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center text-red-500">
                  <AlertOn24Regular class="h-5 w-5" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-content">
                    {{ t('contracts.table.errorTitle') }}
                  </p>
                  <p class="mt-1 text-sm leading-5 text-accent">
                    {{ t('contracts.table.errorDesc') }}
                  </p>
                </div>

                <button
                  class="shrink-0 border border-red-300/70 bg-surface px-3 py-2 text-sm font-medium text-content transition-colors duration-150 hover:bg-red-500/5"
                  @click="emit('retry')"
                >
                  {{ t('actions.retry') }}
                </button>
              </div>
            </td>
          </tr>

          <tr v-else-if="isLoading && rows.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-accent">
              {{ t('common.loading') }}
            </td>
          </tr>

          <tr v-else-if="rows.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-accent">
              {{ t('contracts.table.noResultsTitle') }}
            </td>
          </tr>

          <tr v-if="paddingTop > 0">
            <td colspan="8" :style="{ height: `${paddingTop}px`, padding: 0, border: 0 }" />
          </tr>

          <tr
            v-for="row in visibleRows"
            :key="row.id"
            class="cursor-pointer odd:bg-surface even:bg-background/50 transition-colors duration-150 hover:bg-secondary/60"
            :style="{ height: `${ROW_HEIGHT}px` }"
            @click="emit('select', row.original)"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="border-b border-muted/70 px-4 py-3 align-middle"
              :class="
                isTextColumn(cell.column.id)
                  ? 'text-left text-content'
                  : 'whitespace-nowrap text-left text-accent'
              "
            >
              <div
                v-if="isTextColumn(cell.column.id)"
                class="truncate text-content"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </div>

              <div
                v-else
                :class="isNumericColumn(cell.column.id) ? 'font-medium tabular-nums' : ''"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </div>
            </td>
          </tr>

          <tr v-if="paddingBottom > 0">
            <td colspan="8" :style="{ height: `${paddingBottom}px`, padding: 0, border: 0 }" />
          </tr>

          <tr v-if="isFetchingNextPage">
            <td
              colspan="8"
              class="border-t border-muted px-4 py-3 text-center text-xs uppercase tracking-[0.08em] text-tertiary"
            >
              {{ t('contracts.table.loadingMore') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
