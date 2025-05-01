import { containsAllTypesByName } from '../src';

describe(containsAllTypesByName, () => {
  describe('allowAny', () => {
    describe('is true', () => {
      const options = { allowAny: true };

      it.for([
        ['type Test = unknown;'],
        ['type Test = any;'],
        ['type Test = string;'],
      ] as const)(
        'when code is "%s" it does not contain all types by name',
        ([code], { expect }) => {
          expect(code).not.toContainsAllTypesByName(options);
        },
      );
    });

    describe('is false', () => {
      const options = { allowAny: false };

      it.for([['type Test = unknown;'], ['type Test = any;']] as const)(
        'when code is "%s" it contains all types by name',
        ([code], { expect }) => {
          expect(code).toContainsAllTypesByName(options);
        },
      );

      it.for([['type Test = string;']] as const)(
        'when code is "%s" it does not contain all types by name',
        ([code], { expect }) => {
          expect(code).not.toContainsAllTypesByName(options);
        },
      );
    });
  });

  describe('matchAnyInstead', () => {
    describe('is true', () => {
      const options = {
        allowedNames: new Set(['Object', 'Promise']),
        matchAnyInstead: true,
      };

      it.for([
        [`type Test = Promise<void> & string`],
        ['type Test = Promise<void> | string'],
        ['type Test = Promise<void> | Object'],
      ] as const)(
        'when code is "%s" it contains all types by name',
        ([code], { expect }) => {
          expect(code).toContainsAllTypesByName(options);
        },
      );
    });

    describe('is false', () => {
      const options = {
        allowedNames: new Set(['Object', 'Promise']),
        matchAnyInstead: false,
      };

      it.for([['type Test = Promise<void> | Object']] as const)(
        'when code is "%s" it contains all types by name',
        ([code], { expect }) => {
          expect(code).toContainsAllTypesByName(options);
        },
      );

      it.for([
        ['type Test = Promise<void> & string'],
        ['type Test = Promise<void> | string'],
      ] as const)(
        'when code is "%s" it does not contain all types by name',
        ([code], { expect }) => {
          expect(code).not.toContainsAllTypesByName(options);
        },
      );
    });
  });
});
