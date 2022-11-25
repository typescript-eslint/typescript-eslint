import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';

import type { MessageIds } from '../../../src/rules/strict-enums';
import rule from '../../../src/rules/strict-enums';
import { fruitEnumDefinition, strictEnumsRuleTester } from './strict-enums';

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

valid.push({
  name: 'Incrementing a number (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 0;
fruit++;
  `,
});

invalid.push({
  name: 'Incrementing a number enum value (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
fruit++;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Decrementing a number (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 1;
fruit--;
  `,
});

invalid.push({
  name: 'Decrementing a number enum value (postfix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Banana;
fruit--;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Incrementing a number (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 0;
++fruit;
  `,
});

invalid.push({
  name: 'Incrementing a number enum value (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
++fruit;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Decrementing a number (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = 1;
--fruit
  `,
});

invalid.push({
  name: 'Decrementing a number enum value (prefix)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Banana;
--fruit;
  `,
  errors: [{ messageId: 'incorrectIncrement' }],
});

valid.push({
  name: 'Incrementing a number (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = 0;
fruit += 1;
  `,
});

invalid.push({
  name: 'Incrementing a number enum value (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Apple;
fruit += 1;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

valid.push({
  name: 'Decrementing a number (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = 1;
fruit -= 1;
  `,
});

invalid.push({
  name: 'Decrementing a number enum value (assignment operator)',
  code:
    fruitEnumDefinition +
    `
let fruit = Fruit.Banana;
fruit -= 1;
  `,
  errors: [{ messageId: 'mismatchedAssignment' }],
});

strictEnumsRuleTester.run('strict-enums-incrementing', rule, {
  valid,
  invalid,
});
