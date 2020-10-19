<script lang="ts">
/* https://github.com/typescript-eslint/typescript-eslint/issues/2591 */
/* eslint-disable class-methods-use-this */
export default class Utility {
  get a() {
    const list: Array<string> = [];
    return list;
  }

  get b() {
    const a = this.a as Array<string>;
    return a;
  }
}
</script>
