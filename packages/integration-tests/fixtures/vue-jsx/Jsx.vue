<script lang="tsx">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Jsx',
  setup() {
    const count = ref(0);

    // expected error - no-explicit-any
    const increment = (amount: any): void => {
      count.value += amount;
    };

    return () => (
      <div class="counter">
        <p class="counter-value">
          Count: <strong>{count.value}</strong>
        </p>
        <button type="button" onClick={() => increment(1)}>
          Increment
        </button>
      </div>
    );
  },
});
</script>
