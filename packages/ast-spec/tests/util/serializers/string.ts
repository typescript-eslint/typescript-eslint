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
    const characters: string[] = [];

    characters.push("'");
    for (const character of str) {
      switch (character) {
        case "'":
          characters.push('\\');
          break;

        case '\\':
          characters.push('\\');
          break;
      }
      characters.push(character);
    }
    characters.push("'");

    return characters.join('');
  },
};

export { serializer };
