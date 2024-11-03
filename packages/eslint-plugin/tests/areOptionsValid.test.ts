import { createRule } from '../src/util';
import { areOptionsValid } from './areOptionsValid';

const exampleRule = createRule<['value-a' | 'value-b'], never>({
  create() {
    return {};
  },
  defaultOptions: ['value-a'],
  meta: {
    docs: {
      description: 'Detects something or other',
    },
    messages: {},
    schema: [{ enum: ['value-a', 'value-b'], type: 'string' }],
    type: 'suggestion',
  },
  name: 'my-example-rule',
});

test('returns true for valid options', () => {
  expect(areOptionsValid(exampleRule, ['value-a'])).toBe(true);
});

describe('returns false for invalid options', () => {
  test('bad enum value', () => {
    expect(areOptionsValid(exampleRule, ['value-c'])).toBe(false);
  });

  test('bad type', () => {
    expect(areOptionsValid(exampleRule, [true])).toBe(false);
  });
});
