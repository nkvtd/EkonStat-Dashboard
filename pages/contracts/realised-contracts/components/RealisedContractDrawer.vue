<script setup lang="ts">
import {
    BuildingGovernment24Regular,
    BuildingRetailMoney24Regular,
    Dismiss24Regular,
    DocumentCheckmark24Regular,
} from "@vicons/fluent";
import { computed } from "vue";
import AppFooter from "../../../../components/AppFooter.vue";
import type { RealisedContractItem } from "../../../../services/types/contracts/Response.types";

const props = withDefaults(
    defineProps<{
        isOpen?: boolean;
        contract?: RealisedContractItem | null;
    }>(),
    {
        isOpen: false,
        contract: null,
    },
);

const emit = defineEmits<{
    close: [];
}>();

const title = computed(() => props.contract?.subject || "Детали");

const formatAmount = (value: number | null | undefined) =>
    Number(value ?? 0).toLocaleString();

const formatMoney = (value: number | null | undefined) =>
    `${formatAmount(value)} ден.`;

const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString();
};
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
            Информации за реализираниот тендер
          </p>

          <button
            class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-background text-accent transition-colors duration-150 hover:bg-secondary hover:text-content"
            aria-label="Close"
            @click="emit('close')"
          >
            <Dismiss24Regular class="h-5 w-5" />
          </button>
        </div>

        <div
          v-if="!contract"
          class="flex flex-1 items-center justify-center px-6 text-center text-sm text-accent"
        >
          Нема достапни детали.
        </div>

        <div v-else class="flex min-h-0 flex-1 flex-col">
          <div class="border-b border-muted bg-background px-4 py-4">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-primary">
                    <DocumentCheckmark24Regular class="h-5 w-5" />
                  </div>

                  <div class="min-w-0">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      Број на оглас
                    </p>
                    <p class="mt-1 truncate text-sm font-semibold text-content sm:text-base">
                      {{ contract.processNumber || "—" }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="shrink-0 text-right">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                  Датум на објава
                </p>
                <p class="mt-2 text-sm font-medium text-content">
                  {{ formatDate(contract.postDate) }}
                </p>
              </div>
            </div>

            <div class="mt-5">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                Предмет
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
                      Институција
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
                      Оператор
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
                      Спогодена вредност
                    </p>
                    <p class="mt-3 text-xl font-semibold leading-none text-content">
                      {{ formatMoney(contract.assignedContractValue) }}
                    </p>
                  </div>

                  <div class="border border-muted bg-background px-4 py-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      Реализирана вредност
                    </p>
                    <p class="mt-3 text-xl font-semibold leading-none text-content">
                      {{ formatMoney(contract.realisedContractValue) }}
                    </p>
                  </div>

                  <div class="border border-muted bg-background px-4 py-5 sm:col-span-2">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      Исплатена вредност
                    </p>
                    <p class="mt-3 text-2xl font-bold leading-none text-content">
                      {{ formatMoney(contract.paidContractValue) }}
                    </p>
                  </div>
                </section>

                <section class="border border-muted bg-surface">
                  <div class="border-b border-muted bg-background px-4 py-3">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
                      Дополнителни информации
                    </h4>
                  </div>

                  <div class="divide-y divide-muted">
                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        Вид на договор
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.contractType?.name || "—" }}
                      </p>
                    </div>

                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        Вид на постапка
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.procedureType?.name || "—" }}
                      </p>
                    </div>

                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        Вид на понуда
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.offerType?.name || "—" }}
                      </p>
                    </div>

                    <div class="grid gap-2 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <p class="text-sm font-medium text-content">
                        Вид на рамковен договор
                      </p>
                      <p class="text-base font-semibold leading-snug text-content">
                        {{ contract.frameworkAgreementType?.name || "—" }}
                      </p>
                    </div>
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