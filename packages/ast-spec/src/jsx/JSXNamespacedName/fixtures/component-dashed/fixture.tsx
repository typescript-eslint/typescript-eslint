namespace JSX {
  export interface IntrinsicElements {
    'foo-bar:baz-bam': any;
  }
}

const componentDashed = <foo-bar:baz-bam />;
