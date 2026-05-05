<script setup lang="ts">
import {
    CalendarLtr24Regular,
    ChevronDown24Regular,
    ChevronLeft20Regular,
    ChevronRight20Regular,
    Dismiss20Regular,
} from "@vicons/fluent";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
    defineProps<{
        modelValue: string;
        placeholder?: string;
        minYear?: number;
        maxYear?: number;
    }>(),
    {
        placeholder: "Избери датум",
        minYear: 2000,
        maxYear: new Date().getFullYear(),
    },
);

const emit = defineEmits<{
    "update:modelValue": [value: string];
}>();

type CalendarCell = {
    key: string;
    iso: string;
    label: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
};

const rootRef = ref<HTMLElement | null>(null);
const open = ref(false);
const instanceId = `date-picker-${Math.random().toString(36).slice(2, 10)}`;

const weekdayLabels = ["П", "В", "С", "Ч", "П", "С", "Н"];
const monthLabels = [
    "Јануари",
    "Февруари",
    "Март",
    "Април",
    "Мај",
    "Јуни",
    "Јули",
    "Август",
    "Септември",
    "Октомври",
    "Ноември",
    "Декември",
];

const pad = (value: number) => String(value).padStart(2, "0");

const toIsoDate = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromIsoDate = (value: string) => {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
};

const today = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

const selectedDate = computed(() => fromIsoDate(props.modelValue));
const viewDate = ref(selectedDate.value ?? today());

watch(
    () => props.modelValue,
    (value) => {
        const parsed = fromIsoDate(value);
        viewDate.value = parsed ?? today();
    },
);

const formattedValue = computed(() => {
    if (!props.modelValue) return props.placeholder;

    const parsed = fromIsoDate(props.modelValue);
    if (!parsed) return props.placeholder;

    return parsed.toLocaleDateString("mk-MK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
});

const hasValue = computed(() => props.modelValue !== "");

const yearOptions = computed(() =>
    Array.from(
        { length: props.maxYear - props.minYear + 1 },
        (_, index) => props.minYear + index,
    ),
);

const selectedMonth = computed({
    get: () => viewDate.value.getMonth(),
    set: (month: number) => {
        viewDate.value = new Date(viewDate.value.getFullYear(), month, 1);
    },
});

const selectedYear = computed({
    get: () => viewDate.value.getFullYear(),
    set: (year: number) => {
        viewDate.value = new Date(year, viewDate.value.getMonth(), 1);
    },
});

const calendarCells = computed<CalendarCell[]>(() => {
    const monthStart = startOfMonth(viewDate.value);
    const startWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - startWeekday);

    const selectedIso = props.modelValue;
    const todayIso = toIsoDate(today());

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);

        const iso = toIsoDate(date);

        return {
            key: iso,
            iso,
            label: date.getDate(),
            isCurrentMonth: date.getMonth() === viewDate.value.getMonth(),
            isToday: iso === todayIso,
            isSelected: iso === selectedIso,
        };
    });
});

const close = () => {
    open.value = false;
};

const toggleOpen = () => {
    const next = !open.value;
    open.value = next;

    if (next) {
        window.dispatchEvent(
            new CustomEvent("filter-dropdown-opened", {
                detail: { id: instanceId },
            }),
        );
    }
};

const clear = () => {
    emit("update:modelValue", "");
    close();
};

const selectDate = (iso: string) => {
    emit("update:modelValue", iso);
    close();
};

const goToPreviousMonth = () => {
    viewDate.value = new Date(
        viewDate.value.getFullYear(),
        viewDate.value.getMonth() - 1,
        1,
    );
};

const goToNextMonth = () => {
    viewDate.value = new Date(
        viewDate.value.getFullYear(),
        viewDate.value.getMonth() + 1,
        1,
    );
};

const goToToday = () => {
    const next = today();
    viewDate.value = next;
    emit("update:modelValue", toIsoDate(next));
    close();
};

const onDropdownOpened = (event: Event) => {
    const customEvent = event as CustomEvent<{ id: string }>;
    if (customEvent.detail?.id !== instanceId) {
        open.value = false;
    }
};

const onClickOutside = (event: MouseEvent) => {
    if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
        open.value = false;
    }
};

const onEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        open.value = false;
    }
};

onMounted(() => {
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener(
        "filter-dropdown-opened",
        onDropdownOpened as EventListener,
    );
});

onUnmounted(() => {
    document.removeEventListener("click", onClickOutside);
    document.removeEventListener("keydown", onEscape);
    window.removeEventListener(
        "filter-dropdown-opened",
        onDropdownOpened as EventListener,
    );
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="flex h-10 w-full items-center justify-between gap-3 border border-muted bg-background px-3 text-sm text-content transition-colors duration-150 hover:bg-secondary focus:border-primary focus:outline-none"
      :aria-expanded="open"
      @click.stop="toggleOpen"
    >
      <span class="flex min-w-0 items-center gap-2">
        <CalendarLtr24Regular class="h-4 w-4 shrink-0 text-tertiary" />
        <span class="truncate" :class="hasValue ? 'text-content' : 'text-tertiary'">
          {{ formattedValue }}
        </span>
      </span>

      <span class="flex shrink-0 items-center">
        <button
          v-if="hasValue"
          type="button"
          class="inline-flex h-5 w-5 items-center justify-center text-tertiary transition-colors duration-150 hover:bg-secondary hover:text-content"
          @click.stop="clear"
        >
          <Dismiss20Regular class="h-4 w-4" />
        </button>

        <ChevronDown24Regular
          v-else
          class="h-4 w-4 text-tertiary transition-transform duration-150"
          :class="open ? 'rotate-180' : ''"
        />
      </span>
    </button>

    <div
      v-if="open"
      class="absolute left-0 right-0 top-full z-30 mt-2 border border-muted bg-surface shadow-lg"
      @click.stop
    >
      <div class="border-b border-white/15 bg-content px-2 py-2 text-white dark:bg-background">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            @click.stop="goToPreviousMonth"
          >
            <ChevronLeft20Regular class="h-4 w-4" />
          </button>

          <select
            v-model="selectedMonth"
            class="h-8 min-w-0 flex-1 border border-white/15 bg-white/5 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-white outline-none"
            @click.stop
          >
            <option
              v-for="(month, index) in monthLabels"
              :key="month"
              :value="index"
              class="text-black"
            >
              {{ month }}
            </option>
          </select>

          <select
            v-model="selectedYear"
            class="h-8 w-21 shrink-0 border border-white/15 bg-white/5 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-white outline-none"
            @click.stop
          >
            <option
              v-for="year in yearOptions"
              :key="year"
              :value="year"
              class="text-black"
            >
              {{ year }}
            </option>
          </select>

          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            @click.stop="goToNextMonth"
          >
            <ChevronRight20Regular class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="p-2">
        <div class="mb-1 grid grid-cols-7 gap-1">
          <div
            v-for="weekday in weekdayLabels"
            :key="weekday"
            class="flex h-6 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary"
          >
            {{ weekday }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            type="button"
            class="flex h-8 min-w-0 items-center justify-center border text-xs font-semibold transition-colors duration-150"
            :class="[
              cell.isSelected
                ? 'border-primary bg-primary text-black'
                : cell.isToday
                  ? 'border-primary/60 bg-secondary text-content'
                  : cell.isCurrentMonth
                    ? 'border-muted bg-background text-content hover:bg-secondary'
                    : 'border-muted bg-surface text-tertiary hover:bg-secondary',
            ]"
            @click.stop="selectDate(cell.iso)"
          >
            {{ cell.label }}
          </button>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2 border-t border-muted pt-2">
          <button
            type="button"
            class="inline-flex h-8 items-center justify-center border border-muted bg-background px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-accent transition-colors duration-150 hover:bg-secondary hover:text-content"
            @click.stop="clear"
          >
            Исчисти
          </button>

          <button
            type="button"
            class="inline-flex h-8 items-center justify-center border border-primary bg-primary px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-black transition-colors duration-150 hover:bg-primary/85"
            @click.stop="goToToday"
          >
            Денес
          </button>
        </div>
      </div>
    </div>
  </div>
</template>