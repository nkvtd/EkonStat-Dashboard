<script setup lang="ts">
defineOptions({
    inheritAttrs: false,
});
</script>

<template>
  <img
    src="../assets/logo.svg"
    alt="ЕkonStat logo"
    width="64"
    height="64"
    decoding="async"
    draggable="false"
    v-bind="$attrs"
  />
</template>