<!-- World.vue -->
<template>
  <div>
    <div :id="name">
      {{ enthusiasm }}
    </div>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  initialEnthusiasm?: number;
  name?: string;
}

const { name = 'World', initialEnthusiasm = 1 } = defineProps<Props>();

const enthusiasm = ref(initialEnthusiasm);

function increment(): void {
  enthusiasm.value++;
}

function decrement(): void {
  if (enthusiasm.value > 1) {
    enthusiasm.value--;
  }
}
</script>
