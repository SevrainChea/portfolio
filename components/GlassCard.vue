<template>
  <component
    :is="props.component"
    class="rounded-xl border border-transparent p-8"
    :class="[
      props.glassOnHover
        ? 'transition-all duration-300 hover:border-white/20 hover:bg-black/40 hover:backdrop-blur-xl'
        : 'border border-white/20 bg-black/40 shadow-2xl backdrop-blur-xl',
    ]"
    v-bind="$props"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    component?: string;
    glassOnHover?: boolean;
    href?: string;
    target?: string;
  }>(),
  {
    component: "div",
    glassOnHover: false,
  },
);
</script>

<style lang="scss" scoped></style>
