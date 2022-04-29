import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/utils/src/ts-eslint';
import rule, { MessageIds } from '../../src/rules/strict-enums';
import { fruitEnumDefinition, strictEnumsRuleTester } from './strict-enums';

const valid: ValidTestCase<unknown[]>[] = [];
const invalid: InvalidTestCase<MessageIds, unknown[]>[] = [];

valid.push({
  name: 'Declaring an enum with an empty initializer',
  code:
    fruitEnumDefinition +
    `
  let fruit: Fruit;
  if (true) {
    fruit = Fruit.Apple;
  } else {
    fruit = Fruit.Banana;
  }
    `,
});

/**
 * In development, this would trigger run-time errors due to the
 * `typeChecker.getTypeAtLocation` method being buggy and not having a proper
 * function signature.
 */
valid.push({
  name: 'Declaring an "empty" variable with array destructuring',
  code: `
  const myArray = [1];
  const [firstElement] = myArray;
    `,
});

strictEnumsRuleTester.run('strict-enums-declaration', rule, {
  valid,
  invalid,
});
