<script setup lang="ts">
import { ref } from "vue";
import ContractsSubTabs from "../components/ContractsSubTabs.vue";
import ContractorsTable from "./components/ContractorsTable.vue";
import EntityDrawer from "./components/EntityDrawer.vue";
import InstitutionsTable from "./components/InstitutionsTable.vue";

const drawerOpen = ref(false);
const drawerEntityType = ref<"institution" | "contractor" | null>(null);
const drawerEntityId = ref<number | null>(null);

const openDrawer = (type: "institution" | "contractor", id: number) => {
    drawerEntityType.value = type;
    drawerEntityId.value = id;
    drawerOpen.value = true;
};

const closeDrawer = () => {
    drawerOpen.value = false;
    drawerEntityType.value = null;
    drawerEntityId.value = null;
};
</script>

<template>
  <div class="overflow-hidden px-4 pt-4 pb-0 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4">
      <ContractsSubTabs />

      <div
        class="grid gap-4 lg:grid-cols-2 h-[calc(100dvh-5.5rem)] lg:h-[calc(100dvh-13.5rem)]"
      >
        <InstitutionsTable
          class="h-full min-h-0"
          @select="openDrawer('institution', $event)"
        />
        <ContractorsTable
          class="h-full min-h-0"
          @select="openDrawer('contractor', $event)"
        />
      </div>
    </div>

    <EntityDrawer
      :is-open="drawerOpen"
      :entity-type="drawerEntityType"
      :entity-id="drawerEntityId"
      @close="closeDrawer"
    />
  </div>
</template>