declare namespace JSX {
  interface IntrinsicElements {
    foo: any;
    'foo-bar:baz-bam': any;
  }
}

const componentBasic = <foo />;
const componentDashed = <foo-bar:baz-bam />;
