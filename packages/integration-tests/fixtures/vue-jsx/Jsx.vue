<script lang="tsx">
import Vue from 'vue'
import { mapMutations } from 'vuex'
import { Component } from 'vue-property-decorator'

@Component({
  created () {
    this.toggleHeader(false)
  },
  methods: {
    ...mapMutations('APP_SCOPE_NAME', ['toggleHeader'])
  }
})
export default class Jsx extends Vue {
  render (): JSX.Element {
    // expected error - no-explicit-any
    const path: any = '/';
    return (
      // An error occurred in the next line: "Parsing error: '>' expected.eslint"
      <div class="mg-notFound">
        <div class="fixed-center text-center">
          <p>
            img goes here
          </p>
          <p class="text-faded">Sorry, nothing here...<strong>(404)</strong></p>
          <q-btn
            color="secondary"
            style="width:200px;"
            onClick={() => console.log(path)}
          >Go back</q-btn>
        </div>
      </div>
    )
  }
}
</script>
