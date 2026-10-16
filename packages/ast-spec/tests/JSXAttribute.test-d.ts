import type { JSXAttribute, JSXFragment } from '../src';

test('JSX fragments are valid attribute values', () => {
  expectTypeOf<JSXFragment>().toExtend<NonNullable<JSXAttribute['value']>>();
});
