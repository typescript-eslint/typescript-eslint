<!-- Hello.vue -->
<template>
  <div>
    <div>
      <!-- !!!!! expected error !!!!! -->
      Hello {{ name as any }}{{ exclamationMarks }}
    </div>
    <button @click="decrement">-</button>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  initialEnthusiasm?: number;
  name?: string;
}

const { initialEnthusiasm = 1, name = 'World' } = defineProps<Props>();

const enthusiasm = ref(initialEnthusiasm);

// !!!!! expected error !!!!!
const exclamationMarks = computed((): any => '!'.repeat(enthusiasm.value));

function increment(): void {
  enthusiasm.value++;
}

function decrement(): void {
  if (enthusiasm.value > 1) {
    enthusiasm.value--;
  }
}
</script>
