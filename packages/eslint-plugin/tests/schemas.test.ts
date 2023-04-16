import eslintPlugin from '../src';
import { areOptionsValid } from './areOptionsValid';

describe("Validating rule's schemas", () => {
  // These two have defaults which cover multiple arguments that are incompatible
  const overrideOptions: Record<string, unknown> = {
    semi: ['never'],
    'func-call-spacing': ['never'],
  };

  for (const [ruleName, rule] of Object.entries(eslintPlugin.rules)) {
    test(`${ruleName} must accept valid arguments`, () => {
      if (
        !areOptionsValid(rule, overrideOptions[ruleName] ?? rule.defaultOptions)
      ) {
        throw new Error(`Options failed validation against rule's schema`);
      }
    });

    test(`${ruleName} rejects arbitrary arguments`, () => {
      if (areOptionsValid(rule, [{ 'arbitrary-schemas.test.ts': true }])) {
        throw new Error(`Options succeeded validation for arbitrary options`);
      }
    });
  }
});
