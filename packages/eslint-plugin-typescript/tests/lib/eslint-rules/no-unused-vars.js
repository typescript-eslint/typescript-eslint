'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('eslint/lib/rules/no-unused-vars'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {}
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-unused-vars', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/535
    `
import {
  observable,
} from 'mobx';

export default class ListModalStore {
  @observable
  orderList: IObservableArray<BizPurchaseOrderTO> = observable([]);
}
    `
  ],
  invalid: []
});
