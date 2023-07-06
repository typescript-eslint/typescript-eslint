declare namespace JSX {
  interface IntrinsicElements {
    'foo-bar:baz-bam': any;
    foo: any;
  }
}

const componentDashed = <foo-bar:baz-bam />;
