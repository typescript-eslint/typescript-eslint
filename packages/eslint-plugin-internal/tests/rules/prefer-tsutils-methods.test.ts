import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-tsutils-methods.js';

const ruleTester = new RuleTester();

ruleTester.run('prefer-tsutils-methods', rule, {
  invalid: [
    {
      code: 'type.flags & ts.TypeFlags.Undefined;',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined);',
    },
    {
      code: '(type.flags & ts.TypeFlags.Null) !== 0;',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isTypeFlagSet(type, ts.TypeFlags.Null);',
    },
    {
      code: '(type.flags & ts.TypeFlags.String) === 0;',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: '!tsutils.isTypeFlagSet(type, ts.TypeFlags.String);',
    },
    {
      code: 'symbol.flags & ts.SymbolFlags.EnumMember;',
      errors: [
        {
          data: {
            flagType: 'SymbolFlags',
            method: 'isSymbolFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember);',
    },
    {
      code: '(symbol.flags & ts.SymbolFlags.Method) !== 0;',
      errors: [
        {
          data: {
            flagType: 'SymbolFlags',
            method: 'isSymbolFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Method);',
    },
    {
      code: 'type.objectFlags & ts.ObjectFlags.Interface;',
      errors: [
        {
          data: {
            flagType: 'ObjectFlags',
            method: 'isObjectFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isObjectFlagSet(type, ts.ObjectFlags.Interface);',
    },
    {
      code: '(type.objectFlags & ts.ObjectFlags.Class) === 0;',
      errors: [
        {
          data: {
            flagType: 'ObjectFlags',
            method: 'isObjectFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: '!tsutils.isObjectFlagSet(type, ts.ObjectFlags.Class);',
    },
    {
      code: 'type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null);',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output:
        'tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined | ts.TypeFlags.Null);',
    },
    {
      code: 'info.keyType.flags & ts.TypeFlags.StringLike;',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isTypeFlagSet(info.keyType, ts.TypeFlags.StringLike);',
    },
    {
      code: 'paramSymbol.flags & ts.SymbolFlags.Optional;',
      errors: [
        {
          data: {
            flagType: 'SymbolFlags',
            method: 'isSymbolFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isSymbolFlagSet(paramSymbol, ts.SymbolFlags.Optional);',
    },
    {
      code: 'ts.TypeFlags.Undefined & type.flags;',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined);',
    },
    {
      code: 'ts.SymbolFlags.Method & symbol.flags;',
      errors: [
        {
          data: {
            flagType: 'SymbolFlags',
            method: 'isSymbolFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output: 'tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Method);',
    },
    {
      code: 'type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void);',
      errors: [
        {
          data: {
            flagType: 'TypeFlags',
            method: 'isTypeFlagSet',
          },
          messageId: 'preferMethod',
        },
      ],
      output:
        'tsutils.isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void);',
    },
  ],
  valid: [
    'tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined);',
    'tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.EnumMember);',
    'tsutils.isObjectFlagSet(type, ts.ObjectFlags.Interface);',
    'a & b;',
    'flags & OTHER_FLAGS;',
    'type.flags & CUSTOM_FLAGS;',
    'ts.TypeFlags.Undefined;',
    'type.flags;',
  ],
});
