import type { NewPlugin } from 'pretty-format';

// custom string serializer so that we can use single-quoted strings instead of double quoted strings
// this plays nicer with the way that the snapshot diff result, which is a pure string
const serializer: NewPlugin = {
  test(val: unknown) {
    return typeof val === 'string';
  },
  serialize(
    str: string,
    // config,
    // indentation,
    // depth,
    // refs,
    // printer,
  ) {
    return `'${str.replaceAll(/'|\\/g, '\\$&')}'`;
  },
};

export { serializer };
