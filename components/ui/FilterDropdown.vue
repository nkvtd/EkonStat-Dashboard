<script setup lang="ts">
import { ChevronDown24Regular, Dismiss24Regular } from "@vicons/fluent";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

type Option = {
    label: string;
    value: string;
};

const props = withDefaults(
    defineProps<{
        modelValue: string;
        options: Option[];
        placeholder?: string;
        emptyValue?: string;
    }>(),
    {
        placeholder: "",
        emptyValue: "",
    },
);

const resolvedPlaceholder = computed(
    () => props.placeholder || t("contracts.filters.select"),
);

const emit = defineEmits<{
    "update:modelValue": [value: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const open = ref(false);
const instanceId = `dropdown-${Math.random().toString(36).slice(2, 10)}`;

const hasValue = computed(() => props.modelValue !== props.emptyValue);

const selectedLabel = computed(
    () =>
        props.options.find((option) => option.value === props.modelValue)
            ?.label ?? resolvedPlaceholder.value,
);

const clear = () => {
    emit("update:modelValue", props.emptyValue);
    open.value = false;
};

const selectOption = (value: string) => {
    emit("update:modelValue", value);
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
      <span class="min-w-0 truncate" :class="hasValue ? 'text-content' : 'text-tertiary'">
        {{ selectedLabel }}
      </span>

      <span class="flex shrink-0 items-center">
        <button
          v-if="hasValue"
          type="button"
          class="inline-flex h-5 w-5 items-center justify-center text-tertiary transition-colors duration-150 hover:bg-secondary hover:text-content"
          @click.stop="clear"
        >
          <Dismiss24Regular class="h-4 w-4" />
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
      class="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto border border-muted bg-surface shadow-lg"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex min-h-10 w-full items-center justify-between gap-3 border-b border-muted px-3 py-2 text-left text-sm text-content transition-colors duration-150 last:border-b-0 hover:bg-secondary"
        :class="option.value === modelValue ? 'bg-secondary' : ''"
        @click="selectOption(option.value)"
      >
        <span class="truncate">{{ option.label }}</span>
        <span
          v-if="option.value === modelValue"
          class="text-xs font-semibold uppercase tracking-[0.08em] text-primary"
        >
          ✓
        </span>
      </button>
    </div>
  </div>
</template>