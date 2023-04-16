import * as util from '../src/util';
import { areOptionsValid } from './areOptionsValid';

const exampleRule = util.createRule<['value-a' | 'value-b'], never>({
  name: 'space-infix-ops',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require spacing around infix operators',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [{ enum: ['value-a', 'value-b'] }],
    messages: {},
  },
  defaultOptions: ['value-a'],
  create() {
    return {};
  },
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
