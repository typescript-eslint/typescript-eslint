<!-- Hello.vue -->
<template>
    <div>
        <div>
		    <!-- !!!!! expected error !!!!! -->
			Hello {{ (name as any) }}{{exclamationMarks}}
		</div>
        <button @click="decrement">-</button>
        <button @click="increment">+</button>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
    props: ['name', 'initialEnthusiasm'],
    data() {
        return {
            enthusiasm: this.initialEnthusiasm,
        }
    },
    methods: {
        increment() { this.enthusiasm++; },
        decrement() {
            if (this.enthusiasm > 1) {
                this.enthusiasm--;
            }
        },
    },
    computed: {
        exclamationMarks(): any { // !!!!! expected error !!!!!
            return Array(this.enthusiasm + 1).join('!');
        }
    }
});
</script>
