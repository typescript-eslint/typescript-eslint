import rule from '../../../src/rules/strict-enums';
import { fruitEnumDefinition, strictEnumsRuleTester } from './strict-enums';

strictEnumsRuleTester.run('strict-enums-incrementing', rule, {
  valid: [
    {
      code:
        fruitEnumDefinition +
        `
let fruit = 0;
fruit++;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
let fruit = 1;
fruit--;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
let fruit = 0;
++fruit;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
let fruit = 1;
--fruit
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
let fruit = 0;
fruit += 1;
  `,
    },
    {
      code:
        fruitEnumDefinition +
        `
let fruit = 1;
fruit -= 1;
  `,
    },
  ],
  invalid: [
    {
      code:
        fruitEnumDefinition +
        `
    let fruit = Fruit.Apple;
    fruit++;
      `,
      errors: [{ messageId: 'incorrectIncrement' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    let fruit = Fruit.Banana;
    fruit--;
      `,
      errors: [{ messageId: 'incorrectIncrement' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    let fruit = Fruit.Apple;
    ++fruit;
      `,
      errors: [{ messageId: 'incorrectIncrement' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    let fruit = Fruit.Banana;
    --fruit;
      `,
      errors: [{ messageId: 'incorrectIncrement' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    let fruit = Fruit.Apple;
    fruit += 1;
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
    {
      code:
        fruitEnumDefinition +
        `
    let fruit = Fruit.Banana;
    fruit -= 1;
      `,
      errors: [{ messageId: 'mismatchedAssignment' }],
    },
  ],
});
