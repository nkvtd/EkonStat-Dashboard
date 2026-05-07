<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import {
    AlertOn24Regular,
    BuildingGovernment24Regular,
    BuildingRetailMoney24Regular,
    Dismiss24Regular,
    DocumentEdit24Regular,
} from "@vicons/fluent";
import { computed, inject, type Ref } from "vue";
import { useI18n } from "vue-i18n";
import AppFooter from "../../../../components/AppFooter.vue";
import contractsService from "../../../../services/contracts.service";
import type {
    AwardedContractItem,
    ChangesInAwardedContractItem,
} from "../../../../services/types/contracts/Response.types";
import {
    type Currency,
    formatCurrency,
    formatSignedCurrencyDifference,
} from "../../../../services/util/currencyConverter";

const props = withDefaults(
    defineProps<{
        isOpen?: boolean;
        contract?: AwardedContractItem | null;
    }>(),
    {
        isOpen: false,
        contract: null,
    },
);

const emit = defineEmits<{
    close: [];
}>();

const { t } = useI18n();

const selectedCurrency = inject("selectedCurrency") as Ref<Currency>;

const title = computed(() => props.contract?.subject || t("common.details"));

const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
};

const {
    data: changes,
    isLoading: isChangesLoading,
    isError: isChangesError,
    refetch,
} = useQuery<ChangesInAwardedContractItem[]>({
    queryKey: computed(() => [
        "awarded-contract-changes",
        props.contract?.id ?? null,
    ]),
    queryFn: async () => {
        if (!props.contract?.id) return [];
        const res = await contractsService.awarded.getAwardedContractChanges(
            props.contract.id,
        );
        return res.data;
    },
    enabled: computed(() => Boolean(props.isOpen && props.contract?.id)),
    retry: 1,
});

const hasContractChanges = computed(() => (changes.value?.length ?? 0) > 0);

const showOriginalValue = computed(() => {
    if (!props.contract) return false;

    return (
        hasContractChanges.value &&
        Number(props.contract.originalContractValue ?? 0) !==
            Number(props.contract.assignedContractValue ?? 0)
    );
});

const shouldShowChangesSection = computed(
    () =>
        isChangesLoading.value ||
        isChangesError.value ||
        hasContractChanges.value,
);
</script>

<template>
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
        v-if="isOpen"
        class="fixed inset-0 z-60 bg-content/20"
        @click="emit('close')"
      />
    </Transition>

    <Transition
      appear
      enter-active-class="transform-gpu transition-[transform,opacity] duration-200 ease-out"
      enter-from-class="translate-x-6 opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transform-gpu transition-[transform,opacity] duration-150 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-6 opacity-0"
    >
      <aside
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-70 flex w-full max-w-full flex-col overflow-hidden border-l border-muted bg-surface md:w-2xl lg:w-3xl"
      >
        <div class="flex items-center justify-between border-b border-muted px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
            {{ t('contracts.awarded.drawerTitle') }}
          </p>

          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-background text-accent transition-colors duration-150 hover:bg-secondary hover:text-content"
            :aria-label="t('actions.close')"
            @click="emit('close')"
          >
            <Dismiss24Regular class="h-5 w-5" />
          </button>
        </div>

        <div
          v-if="!contract"
          class="flex flex-1 items-center justify-center px-6 text-center text-sm text-accent"
        >
          {{ t('contracts.awarded.noDetails') }}
        </div>

        <div v-else class="flex min-h-0 flex-1 flex-col">
          <div class="border-b border-muted bg-background px-4 py-4">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-primary">
                    <DocumentEdit24Regular class="h-5 w-5" />
                  </div>

                  <div class="min-w-0">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ t('contracts.fields.processNumber') }}
                    </p>
                    <p class="mt-1 truncate text-sm font-semibold text-content sm:text-base">
                      {{ contract.processNumber || "—" }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="shrink-0 text-right">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                  {{ t('contracts.fields.postDate') }}
                </p>
                <p class="mt-2 text-sm font-medium text-content">
                  {{ formatDate(contract.postDate) }}
                </p>
              </div>
            </div>

            <div class="mt-5">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                {{ t('contracts.fields.subject') }}
              </p>
              <h3 class="mt-2 text-xl font-bold leading-tight text-content sm:text-2xl">
                {{ title }}
              </h3>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="flex min-h-full flex-col">
              <div class="space-y-4 p-4">
                <section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="border border-muted bg-background p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ t('contracts.fields.institution') }}
                    </p>

                    <div class="mt-4 flex items-start gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-primary">
                        <BuildingGovernment24Regular class="h-5 w-5" />
                      </div>

                      <div class="min-w-0">
                        <p class="text-base font-semibold leading-snug text-content">
                          {{ contract.institution?.name || "—" }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-muted bg-background p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ t('contracts.fields.contractor') }}
                    </p>

                    <div class="mt-4 flex items-start gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-primary">
                        <BuildingRetailMoney24Regular class="h-5 w-5" />
                      </div>

                      <div class="min-w-0">
                        <p class="text-base font-semibold leading-snug text-content">
                          {{ contract.contractor?.name || "—" }}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="border border-muted bg-background px-4 py-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ t('contracts.fields.estimatedValue') }}
                    </p>
                    <p class="mt-3 text-xl font-semibold leading-none text-content">
                        {{ formatCurrency(contract.estimatedContractValue, selectedCurrency) }}
                    </p>
                  </div>

                  <div
                    v-if="showOriginalValue"
                    class="border border-muted bg-background px-4 py-4"
                  >
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ t('contracts.fields.originalValue') }}
                    </p>
                    <p class="mt-3 text-xl font-semibold leading-none text-content">
                        {{ formatCurrency(contract.originalContractValue, selectedCurrency) }}
                    </p>
                  </div>

                  <div
                    class="border border-muted bg-background px-4 py-5"
                    :class="showOriginalValue ? 'sm:col-span-2' : ''"
                  >
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ t('contracts.fields.assignedValue') }}
                    </p>
                    <p class="mt-3 text-2xl font-bold leading-none text-content">
                        {{ formatCurrency(contract.assignedContractValue, selectedCurrency) }}
                    </p>
                  </div>
                </section>

                <section class="border border-muted bg-surface">
                  <div class="border-b border-muted bg-background px-4 py-3">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
                      {{ t('contracts.awarded.additionalInfo') }}
                    </h4>
                  </div>

                  <div class="divide-y divide-muted">
                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        {{ t('contracts.fields.contractType') }}
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.contractType?.name || "—" }}
                      </p>
                    </div>

                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        {{ t('contracts.fields.procedureType') }}
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.procedureType?.name || "—" }}
                      </p>
                    </div>

                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        {{ t('contracts.fields.offerType') }}
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.offerType?.name || "—" }}
                      </p>
                    </div>

                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        {{ t('contracts.fields.frameworkAgreementType') }}
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.frameworkAgreementType?.name || "—" }}
                      </p>
                    </div>
                  </div>
                </section>

                <section
                  v-if="shouldShowChangesSection"
                  class="border border-muted bg-surface"
                >
                  <div class="border-b border-muted bg-background px-4 py-3">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
                      {{ t('contracts.awarded.contractChanges') }}
                    </h4>
                  </div>

                  <div v-if="isChangesLoading" class="px-4 py-5 text-sm text-accent">
                    {{ t('common.loading') }}
                  </div>

                  <div v-else-if="isChangesError" class="p-4">
                    <div class="border border-red-300/60 bg-red-500/5 p-4">
                      <div class="flex items-start gap-3">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center text-red-500">
                          <AlertOn24Regular class="h-5 w-5" />
                        </div>

                        <div class="min-w-0 flex-1">
                          <p class="text-sm font-semibold text-content">
                            {{ t('contracts.awarded.errorDetailsLoading') }}
                          </p>
                          <p class="mt-1 text-sm leading-5 text-accent">
                            {{ t('contracts.awarded.dataNotAvailableRetry') }}
                          </p>
                        </div>

                        <button
                          class="shrink-0 border border-red-300/70 bg-surface px-3 py-2 text-sm font-medium text-content transition-colors duration-150 hover:bg-red-500/5"
                          @click="refetch()"
                        >
                          {{ t('actions.retry') }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else-if="changes?.length"
                    class="overflow-x-auto"
                  >
                    <table class="w-full min-w-160 border-collapse text-sm">
                      <thead class="bg-background">
                        <tr class="border-b border-muted">
                          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-content">
                            {{ t('contracts.fields.changeReason') }}
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-content">
                            {{ t('contracts.fields.newValue') }}
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-content">
                            {{ t('contracts.fields.difference') }}
                          </th>
                          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-content">
                            {{ t('contracts.fields.changedDate') }}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr
                          v-for="change in changes"
                          :key="change.id"
                          class="border-b border-muted last:border-b-0"
                        >
                          <td class="px-4 py-3 text-sm font-medium text-content">
                            {{ change.changeReason?.name || "—" }}
                          </td>
                          <td class="px-4 py-3 text-sm text-content">
                              {{ formatCurrency(change.updatedContractValue, selectedCurrency) }}
                              </td>
                              <td class="px-4 py-3 text-sm font-semibold text-content">
                              {{ formatSignedCurrencyDifference(change.differenceInValue, selectedCurrency) }}
                          </td>
                          <td class="px-4 py-3 text-sm text-content">
                            {{ formatDate(change.changeDate) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <AppFooter variant="drawer" class="mt-auto shrink-0" />
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
