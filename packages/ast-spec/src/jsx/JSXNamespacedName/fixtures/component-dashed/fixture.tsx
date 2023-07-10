declare namespace JSX {
  interface IntrinsicElements {
    foo: any;
    'foo-bar:baz-bam': any;
  }
}

// @ts-expect-error -- https://github.com/typescript-eslint/typescript-eslint/issues/7166
const componentBasic = <foo />;
// @ts-expect-error -- https://github.com/typescript-eslint/typescript-eslint/issues/7166
const componentDashed = <foo-bar:baz-bam />;
