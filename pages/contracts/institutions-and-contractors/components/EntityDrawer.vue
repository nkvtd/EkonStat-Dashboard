<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import {
    AlertOn24Regular,
    Dismiss24Regular,
    DocumentCheckmark24Regular,
    DocumentEdit24Regular,
} from "@vicons/fluent";
import { computed } from "vue";
import AppFooter from "../../../../components/AppFooter.vue";
import contractsService from "../../../../services/contracts.service";
import type {
    AwardedContractItem,
    ContractorDetails,
    InstitutionDetails,
    RealisedContractItem,
} from "../../../../services/types/contracts/Response.types";

const props = withDefaults(
    defineProps<{
        isOpen?: boolean;
        entityType?: "institution" | "contractor" | null;
        entityId?: number | null;
    }>(),
    {
        isOpen: false,
        entityType: null,
        entityId: null,
    },
);

const emit = defineEmits<{
    close: [];
}>();

type EntityDetails = {
    info: InstitutionDetails | ContractorDetails | null;
    awarded: AwardedContractItem[];
    realised: RealisedContractItem[];
};

const queryKey = computed(() => [
    "entity-details",
    props.entityType,
    props.entityId,
]);

const {
    data: details,
    isLoading,
    isError,
    refetch,
} = useQuery<EntityDetails>({
    queryKey,
    queryFn: async () => {
        if (!props.entityId || !props.entityType) {
            return { info: null, awarded: [], realised: [] };
        }

        if (props.entityType === "institution") {
            const res =
                await contractsService.institutions.getInstitutionDetails(
                    props.entityId,
                    5,
                );

            return {
                info: res.institutionInfo.data,
                awarded: res.institutionAwardedContracts.data,
                realised: res.institutionRealisedContracts.data,
            };
        }

        const res = await contractsService.contractors.getContractorDetails(
            props.entityId,
            5,
        );

        return {
            info: res.contractorInfo.data,
            awarded: res.contractorAwardedContracts.data,
            realised: res.contractorRealisedContracts.data,
        };
    },
    enabled: computed(
        () =>
            props.isOpen &&
            props.entityId !== null &&
            props.entityType !== null,
    ),
});

const isInstitution = computed(() => props.entityType === "institution");

const money = computed(() => {
    const info = details.value?.info;
    if (!info) return 0;
    return "spendings" in info ? info.spendings : info.earnings;
});

const moneyLabel = computed(() =>
    isInstitution.value ? "Вкупен расход" : "Вкупен приход",
);

const entityName = computed(() => details.value?.info?.name || "Детали");

const formatAmount = (value: number | null | undefined) =>
    Number(value ?? 0).toLocaleString();

const getCounterpartyName = (
    contract: AwardedContractItem | RealisedContractItem,
) =>
    isInstitution.value
        ? contract.contractor?.name
        : contract.institution?.name;
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
            Дополнителни информации
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
          v-if="isLoading"
          class="flex flex-1 items-center justify-center px-6 text-sm text-accent"
        >
          Вчитување...
        </div>

        <div v-else-if="isError" class="flex flex-1 items-start p-4">
          <div class="w-full border border-red-300/60 bg-red-500/5 p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center text-red-500">
                <AlertOn24Regular class="h-5 w-5" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-content">
                  Деталите не можеа да бидат вчитани
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
          </div>
        </div>

        <div v-else-if="details?.info" class="flex min-h-0 flex-1 flex-col">
          <div class="border-b border-muted bg-background px-4 py-4">
            <h3 class="text-base font-semibold leading-snug text-content">
              {{ entityName }}
            </h3>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="flex min-h-full flex-col">
              <div class="space-y-4 p-4">
                <section class="grid grid-cols-2 gap-4">
                  <div class="col-span-2 border border-muted bg-background px-4 py-5">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      {{ moneyLabel }}
                    </p>
                    <p class="mt-3 text-3xl font-bold leading-none text-content">
                      {{ formatAmount(money) }}
                      <span class="text-sm font-semibold text-accent">ден.</span>
                    </p>
                  </div>

                  <div class="border border-muted bg-background p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      Склучени договори
                    </p>

                    <div class="mt-4 flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-primary">
                        <DocumentEdit24Regular class="h-5 w-5" />
                      </div>

                      <div class="text-2xl font-bold leading-none text-content">
                        {{ details.info.awardedContractsCount ?? 0 }}
                      </div>
                    </div>
                  </div>

                  <div class="border border-muted bg-background p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.08em] text-tertiary">
                      Реализирани тендери
                    </p>

                    <div class="mt-4 flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center border border-muted bg-surface text-primary">
                        <DocumentCheckmark24Regular class="h-5 w-5" />
                      </div>

                      <div class="text-2xl font-bold leading-none text-content">
                        {{ details.info.realisedContractsCount ?? 0 }}
                      </div>
                    </div>
                  </div>
                </section>

                <section class="border border-muted bg-surface">
                  <div class="border-b border-muted bg-background px-4 py-3">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
                      Најнови склучени договори
                    </h4>
                  </div>

                  <div class="divide-y divide-muted">
                    <article
                      v-for="contract in details.awarded"
                      :key="contract.id"
                      class="bg-surface px-4 py-4"
                    >
                      <p class="text-sm font-semibold leading-5 text-content">
                        {{ contract.subject }}
                      </p>

                      <p
                        v-if="getCounterpartyName(contract)"
                        class="mt-1 text-sm leading-5 text-accent"
                      >
                        Со {{ getCounterpartyName(contract) }}
                      </p>

                      <div class="mt-4 grid gap-3 sm:grid-cols-2">
                        <div class="border border-muted bg-background px-3 py-3">
                          <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                            Проценета вредност
                          </p>
                          <p class="mt-2 text-sm font-medium text-content">
                            {{ formatAmount(contract.estimatedContractValue) }} ден.
                          </p>
                        </div>

                        <div class="border border-muted bg-background px-3 py-3">
                          <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                            Спогодена вредност
                          </p>
                          <p class="mt-2 text-sm font-bold text-content">
                            {{ formatAmount(contract.assignedContractValue) }} ден.
                          </p>
                        </div>
                      </div>
                    </article>

                    <div
                      v-if="!details.awarded.length"
                      class="px-4 py-5 text-sm text-accent"
                    >
                      Нема достапни склучени договори.
                    </div>
                  </div>
                </section>

                <section class="border border-muted bg-surface">
                  <div class="border-b border-muted bg-background px-4 py-3">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.08em] text-content">
                      Најнови реализирани тендери
                    </h4>
                  </div>

                  <div class="divide-y divide-muted">
                    <article
                      v-for="contract in details.realised"
                      :key="contract.id"
                      class="bg-surface px-4 py-4"
                    >
                      <p class="text-sm font-semibold leading-5 text-content">
                        {{ contract.subject }}
                      </p>

                      <p
                        v-if="getCounterpartyName(contract)"
                        class="mt-1 text-sm leading-5 text-accent"
                      >
                        Со {{ getCounterpartyName(contract) }}
                      </p>

                      <div class="mt-4 grid gap-3">
                        <div class="grid gap-3 sm:grid-cols-2">
                          <div class="border border-muted bg-background px-3 py-3">
                            <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                              Спогодена вредност
                            </p>
                            <p class="mt-2 text-sm font-medium text-content">
                              {{ formatAmount(contract.assignedContractValue) }} ден.
                            </p>
                          </div>

                          <div class="border border-muted bg-background px-3 py-3">
                            <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                              Реализирана вредност
                            </p>
                            <p class="mt-2 text-sm font-medium text-content">
                              {{ formatAmount(contract.realisedContractValue) }} ден.
                            </p>
                          </div>
                        </div>

                        <div class="border border-muted bg-background px-3 py-3">
                          <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                            Исплатена вредност
                          </p>
                          <p class="mt-2 text-sm font-bold text-content">
                            {{ formatAmount(contract.paidContractValue) }} ден.
                          </p>
                        </div>
                      </div>
                    </article>

                    <div
                      v-if="!details.realised.length"
                      class="px-4 py-5 text-sm text-accent"
                    >
                      Нема достапни реализирани тендери.
                    </div>
                  </div>
                </section>
              </div>

              <AppFooter variant="drawer" class="mt-auto shrink-0" />
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-1 items-center justify-center px-6 text-center text-sm text-accent"
        >
          Нема достапни детали.
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>