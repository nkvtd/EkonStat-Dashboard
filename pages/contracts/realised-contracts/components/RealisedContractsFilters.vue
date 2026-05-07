<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import DatePicker from "../../../../components/ui/DatePicker.vue";
import FilterDropdown from "../../../../components/ui/FilterDropdown.vue";
import type { ReferenceDataResponse } from "../../../../services/types/contracts/Response.types";

const { t } = useI18n();

export type RealisedFilterForm = {
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

const props = withDefaults(
    defineProps<{
        modelValue: RealisedFilterForm;
        referenceData?: ReferenceDataResponse;
        isReferenceLoading?: boolean;
        activeCount?: number;
        embedded?: boolean;
    }>(),
    {
        embedded: false,
    },
);

const emit = defineEmits<{
    "update:modelValue": [value: RealisedFilterForm];
    reset: [];
}>();

const sections = ref({
    text: true,
    types: true,
    value: true,
});

const currentYear = new Date().getFullYear();

const updateField = <K extends keyof RealisedFilterForm>(
    key: K,
    value: RealisedFilterForm[K],
) => {
    emit("update:modelValue", {
        ...props.modelValue,
        [key]: value,
    });
};

const toggleSection = (key: keyof typeof sections.value) => {
    sections.value[key] = !sections.value[key];
};

const createOptions = (source?: Record<string, string>) => [
    { label: t("common.all"), value: "" },
    ...Object.entries(source ?? {}).map(([value, label]) => ({
        value,
        label,
    })),
];

const procedureOptions = computed(() =>
    createOptions(props.referenceData?.procedureTypes),
);

const offerOptions = computed(() =>
    createOptions(props.referenceData?.offerTypes),
);

const frameworkOptions = computed(() =>
    createOptions(props.referenceData?.frameworkAgreementTypes),
);

const wrapperClass = computed(() =>
    props.embedded
        ? "flex min-h-0 flex-col bg-surface"
        : "grid min-h-0 grid-rows-[auto_minmax(0,1fr)] border border-muted bg-surface",
);

const sectionBorderClass = "border-b border-muted";
const sectionButtonClass =
    "flex w-full items-center justify-between bg-background px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-content transition-colors duration-150 hover:bg-secondary";
const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-tertiary";
const inputClass =
    "h-10 w-full border border-muted bg-background px-3 text-sm text-content placeholder:text-tertiary focus:border-primary focus:outline-none";
const valueGroupTitleClass =
    "text-xs font-semibold uppercase tracking-[0.08em] text-content";
</script>

<template>
  <aside :class="wrapperClass">
    <div v-if="!embedded" class="border-b border-muted px-4 py-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-2xl font-bold uppercase tracking-[0.08em] text-content">
            {{ t('common.filters') }}
          </h2>
          <p class="mt-1 text-xs uppercase tracking-[0.08em] text-tertiary">
            {{ activeCount ?? 0 }} {{ t('common.activeFilters') }}
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 border border-muted bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent transition-colors duration-150 hover:bg-secondary hover:text-content"
          @click="emit('reset')"
        >
          {{ t('actions.clear') }}
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <section :class="sectionBorderClass">
        <button type="button" :class="sectionButtonClass" @click="toggleSection('text')">
          <span>{{ t('contracts.filters.basic') }}</span>
          <span>{{ sections.text ? "−" : "+" }}</span>
        </button>

        <div v-if="sections.text" class="space-y-3 p-4">
          <div>
            <label :class="labelClass">{{ t('contracts.filters.subject') }}</label>
            <input
              :value="modelValue.subject"
              type="text"
              :class="inputClass"
              :placeholder="t('contracts.filters.searchSubject')"
              @input="updateField('subject', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div>
            <label :class="labelClass">{{ t('contracts.filters.institution') }}</label>
            <input
              :value="modelValue.institution"
              type="text"
              :class="inputClass"
              :placeholder="t('contracts.filters.searchInstitution')"
              @input="updateField('institution', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <div>
            <label :class="labelClass">{{ t('contracts.filters.contractor') }}</label>
            <input
              :value="modelValue.contractor"
              type="text"
              :class="inputClass"
              :placeholder="t('contracts.filters.searchContractor')"
              @input="updateField('contractor', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </section>

      <section :class="sectionBorderClass">
        <button type="button" :class="sectionButtonClass" @click="toggleSection('types')">
          <span>{{ t('contracts.filters.types') }}</span>
          <span>{{ sections.types ? "−" : "+" }}</span>
        </button>

        <div v-if="sections.types" class="space-y-3 p-4">
          <div>
            <label :class="labelClass">{{ t('contracts.filters.typeProcedure') }}</label>
            <FilterDropdown
              :model-value="modelValue.typeProcedureId"
              :options="procedureOptions"
              :placeholder="t('contracts.filters.selectType')"
              @update:model-value="updateField('typeProcedureId', $event)"
            />
          </div>

          <div>
            <label :class="labelClass">{{ t('contracts.filters.typeOffer') }}</label>
            <FilterDropdown
              :model-value="modelValue.typeOfferId"
              :options="offerOptions"
              :placeholder="t('contracts.filters.selectType')"
              @update:model-value="updateField('typeOfferId', $event)"
            />
          </div>

          <div>
            <label :class="labelClass">{{ t('contracts.filters.typeFramework') }}</label>
            <FilterDropdown
              :model-value="modelValue.typeFrameworkAgreementId"
              :options="frameworkOptions"
              :placeholder="t('contracts.filters.selectType')"
              @update:model-value="updateField('typeFrameworkAgreementId', $event)"
            />
          </div>

          <div v-if="isReferenceLoading" class="text-sm text-accent">
            {{ t('contracts.filters.loadingTypes') }}
          </div>
        </div>
      </section>

      <section>
        <button type="button" :class="sectionButtonClass" @click="toggleSection('value')">
          <span>{{ t('contracts.filters.values') }}</span>
          <span>{{ sections.value ? "−" : "+" }}</span>
        </button>

        <div v-if="sections.value" class="space-y-4 p-4">
          <div class="space-y-3">
            <p :class="valueGroupTitleClass">{{ t('contracts.fields.assignedValue') }}</p>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelClass">{{ t('contracts.filters.from') }}</label>
                <input
                  :value="modelValue.moreThanAssignedValue"
                  type="number"
                  min="0"
                  :class="inputClass"
                  @input="updateField('moreThanAssignedValue', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div>
                <label :class="labelClass">{{ t('contracts.filters.to') }}</label>
                <input
                  :value="modelValue.lessThanAssignedValue"
                  type="number"
                  min="0"
                  :class="inputClass"
                  @input="updateField('lessThanAssignedValue', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <p :class="valueGroupTitleClass">{{ t('contracts.fields.realisedValue') }}</p>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelClass">{{ t('contracts.filters.from') }}</label>
                <input
                  :value="modelValue.moreThanRealisedValue"
                  type="number"
                  min="0"
                  :class="inputClass"
                  @input="updateField('moreThanRealisedValue', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div>
                <label :class="labelClass">{{ t('contracts.filters.to') }}</label>
                <input
                  :value="modelValue.lessThanRealisedValue"
                  type="number"
                  min="0"
                  :class="inputClass"
                  @input="updateField('lessThanRealisedValue', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <p :class="valueGroupTitleClass">{{ t('contracts.fields.paidValue') }}</p>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label :class="labelClass">{{ t('contracts.filters.from') }}</label>
                <input
                  :value="modelValue.moreThanPaidValue"
                  type="number"
                  min="0"
                  :class="inputClass"
                  @input="updateField('moreThanPaidValue', ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div>
                <label :class="labelClass">{{ t('contracts.filters.to') }}</label>
                <input
                  :value="modelValue.lessThanPaidValue"
                  type="number"
                  min="0"
                  :class="inputClass"
                  @input="updateField('lessThanPaidValue', ($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>
          </div>

          <div>
            <label :class="labelClass">{{ t('contracts.filters.publishedFrom') }}</label>
            <DatePicker
              :model-value="modelValue.afterPostDate"
              :placeholder="t('contracts.filters.selectDate')"
              :min-year="2000"
              :max-year="currentYear"
              @update:model-value="updateField('afterPostDate', $event)"
            />
          </div>

          <div>
            <label :class="labelClass">{{ t('contracts.filters.publishedTo') }}</label>
            <DatePicker
              :model-value="modelValue.beforePostDate"
              :placeholder="t('contracts.filters.selectDate')"
              :min-year="2000"
              :max-year="currentYear"
              @update:model-value="updateField('beforePostDate', $event)"
            />
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>