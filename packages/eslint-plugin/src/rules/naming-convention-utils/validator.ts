import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import * as util from '../../util';
import type { SelectorsString } from './enums';
import {
  MetaSelectors,
  Modifiers,
  PredefinedFormats,
  Selectors,
  TypeModifiers,
  UnderscoreOptions,
} from './enums';
import { PredefinedFormatToCheckFunction } from './format';
import {
  isMetaSelector,
  isMethodOrPropertySelector,
  selectorTypeToMessageString,
} from './shared';
import type { Context, NormalizedSelector } from './types';

function createValidator(
  type: SelectorsString,
  context: Context,
  allConfigs: NormalizedSelector[],
): (
  node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
) => void {
  // make sure the "highest priority" configs are checked first
  const selectorType = Selectors[type];
  const configs = allConfigs
    // gather all of the applicable selectors
    .filter(
      c =>
        (c.selector & selectorType) !== 0 ||
        c.selector === MetaSelectors.default,
    )
    .sort((a, b) => {
      if (a.selector === b.selector) {
        // in the event of the same selector, order by modifier weight
        // sort descending - the type modifiers are "more important"
        return b.modifierWeight - a.modifierWeight;
      }

      const aIsMeta = isMetaSelector(a.selector);
      const bIsMeta = isMetaSelector(b.selector);

      // non-meta selectors should go ahead of meta selectors
      if (aIsMeta && !bIsMeta) {
        return 1;
      }
      if (!aIsMeta && bIsMeta) {
        return -1;
      }

      const aIsMethodOrProperty = isMethodOrPropertySelector(a.selector);
      const bIsMethodOrProperty = isMethodOrPropertySelector(b.selector);

      // for backward compatibility, method and property have higher precedence than other meta selectors
      if (aIsMethodOrProperty && !bIsMethodOrProperty) {
        return -1;
      }
      if (!aIsMethodOrProperty && bIsMethodOrProperty) {
        return 1;
      }

      // both aren't meta selectors
      // sort descending - the meta selectors are "least important"
      return b.selector - a.selector;
    });

  return (
    node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
    modifiers: Set<Modifiers> = new Set<Modifiers>(),
  ): void => {
    const originalName =
      node.type === AST_NODE_TYPES.Identifier ||
      node.type === AST_NODE_TYPES.PrivateIdentifier
        ? node.name
        : `${node.value}`;

    // return will break the loop and stop checking configs
    // it is only used when the name is known to have failed or succeeded a config.
    for (const config of configs) {
      if (config.filter?.regex.test(originalName) !== config.filter?.match) {
        // name does not match the filter
        continue;
      }

      if (config.modifiers?.some(modifier => !modifiers.has(modifier))) {
        // does not have the required modifiers
        continue;
      }

      if (!isCorrectType(node, config, context, selectorType)) {
        // is not the correct type
        continue;
      }

      let name: string | null = originalName;

      name = validateUnderscore('leading', config, name, node, originalName);
      if (name == null) {
        // fail
        return;
      }

      name = validateUnderscore('trailing', config, name, node, originalName);
      if (name == null) {
        // fail
        return;
      }

      name = validateAffix('prefix', config, name, node, originalName);
      if (name == null) {
        // fail
        return;
      }

      name = validateAffix('suffix', config, name, node, originalName);
      if (name == null) {
        // fail
        return;
      }

      if (!validateCustom(config, name, node, originalName)) {
        // fail
        return;
      }

      if (
        !validatePredefinedFormat(config, name, node, originalName, modifiers)
      ) {
        // fail
        return;
      }

      // it's valid for this config, so we don't need to check any more configs
      return;
    }
  };

  // centralizes the logic for formatting the report data
  function formatReportData({
    affixes,
    formats,
    originalName,
    processedName,
    position,
    custom,
    count,
  }: {
    affixes?: string[];
    formats?: PredefinedFormats[];
    originalName: string;
    processedName?: string;
    position?: 'leading' | 'trailing' | 'prefix' | 'suffix';
    custom?: NonNullable<NormalizedSelector['custom']>;
    count?: 'one' | 'two';
  }): Record<string, unknown> {
    return {
      type: selectorTypeToMessageString(type),
      name: originalName,
      processedName,
      position,
      count,
      affixes: affixes?.join(', '),
      formats: formats?.map(f => PredefinedFormats[f]).join(', '),
      regex: custom?.regex?.toString(),
      regexMatch:
        custom?.match === true
          ? 'match'
          : custom?.match === false
          ? 'not match'
          : null,
    };
  }

  /**
   * @returns the name with the underscore removed, if it is valid according to the specified underscore option, null otherwise
   */
  function validateUnderscore(
    position: 'leading' | 'trailing',
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
    originalName: string,
  ): string | null {
    const option =
      position === 'leading'
        ? config.leadingUnderscore
        : config.trailingUnderscore;
    if (!option) {
      return name;
    }

    const hasSingleUnderscore =
      position === 'leading'
        ? (): boolean => name.startsWith('_')
        : (): boolean => name.endsWith('_');
    const trimSingleUnderscore =
      position === 'leading'
        ? (): string => name.slice(1)
        : (): string => name.slice(0, -1);

    const hasDoubleUnderscore =
      position === 'leading'
        ? (): boolean => name.startsWith('__')
        : (): boolean => name.endsWith('__');
    const trimDoubleUnderscore =
      position === 'leading'
        ? (): string => name.slice(2)
        : (): string => name.slice(0, -2);

    switch (option) {
      // ALLOW - no conditions as the user doesn't care if it's there or not
      case UnderscoreOptions.allow: {
        if (hasSingleUnderscore()) {
          return trimSingleUnderscore();
        }

        return name;
      }

      case UnderscoreOptions.allowDouble: {
        if (hasDoubleUnderscore()) {
          return trimDoubleUnderscore();
        }

        return name;
      }

      case UnderscoreOptions.allowSingleOrDouble: {
        if (hasDoubleUnderscore()) {
          return trimDoubleUnderscore();
        }

        if (hasSingleUnderscore()) {
          return trimSingleUnderscore();
        }

        return name;
      }

      // FORBID
      case UnderscoreOptions.forbid: {
        if (hasSingleUnderscore()) {
          context.report({
            node,
            messageId: 'unexpectedUnderscore',
            data: formatReportData({
              originalName,
              position,
              count: 'one',
            }),
          });
          return null;
        }

        return name;
      }

      // REQUIRE
      case UnderscoreOptions.require: {
        if (!hasSingleUnderscore()) {
          context.report({
            node,
            messageId: 'missingUnderscore',
            data: formatReportData({
              originalName,
              position,
              count: 'one',
            }),
          });
          return null;
        }

        return trimSingleUnderscore();
      }

      case UnderscoreOptions.requireDouble: {
        if (!hasDoubleUnderscore()) {
          context.report({
            node,
            messageId: 'missingUnderscore',
            data: formatReportData({
              originalName,
              position,
              count: 'two',
            }),
          });
          return null;
        }

        return trimDoubleUnderscore();
      }
    }
  }

  /**
   * @returns the name with the affix removed, if it is valid according to the specified affix option, null otherwise
   */
  function validateAffix(
    position: 'prefix' | 'suffix',
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
    originalName: string,
  ): string | null {
    const affixes = config[position];
    if (!affixes || affixes.length === 0) {
      return name;
    }

    for (const affix of affixes) {
      const hasAffix =
        position === 'prefix' ? name.startsWith(affix) : name.endsWith(affix);
      const trimAffix =
        position === 'prefix'
          ? (): string => name.slice(affix.length)
          : (): string => name.slice(0, -affix.length);

      if (hasAffix) {
        // matches, so trim it and return
        return trimAffix();
      }
    }

    context.report({
      node,
      messageId: 'missingAffix',
      data: formatReportData({
        originalName,
        position,
        affixes,
      }),
    });
    return null;
  }

  /**
   * @returns true if the name is valid according to the `regex` option, false otherwise
   */
  function validateCustom(
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
    originalName: string,
  ): boolean {
    const custom = config.custom;
    if (!custom) {
      return true;
    }

    const result = custom.regex.test(name);
    if (custom.match && result) {
      return true;
    }
    if (!custom.match && !result) {
      return true;
    }

    context.report({
      node,
      messageId: 'satisfyCustom',
      data: formatReportData({
        originalName,
        custom,
      }),
    });
    return false;
  }

  /**
   * @returns true if the name is valid according to the `format` option, false otherwise
   */
  function validatePredefinedFormat(
    config: NormalizedSelector,
    name: string,
    node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
    originalName: string,
    modifiers: Set<Modifiers>,
  ): boolean {
    const formats = config.format;
    if (!formats?.length) {
      return true;
    }

    if (!modifiers.has(Modifiers.requiresQuotes)) {
      for (const format of formats) {
        const checker = PredefinedFormatToCheckFunction[format];
        if (checker(name)) {
          return true;
        }
      }
    }

    context.report({
      node,
      messageId:
        originalName === name
          ? 'doesNotMatchFormat'
          : 'doesNotMatchFormatTrimmed',
      data: formatReportData({
        originalName,
        processedName: name,
        formats,
      }),
    });
    return false;
  }
}

const SelectorsAllowedToHaveTypes =
  Selectors.variable |
  Selectors.parameter |
  Selectors.classProperty |
  Selectors.objectLiteralProperty |
  Selectors.typeProperty |
  Selectors.parameterProperty |
  Selectors.accessor;

function isCorrectType(
  node: TSESTree.Node,
  config: NormalizedSelector,
  context: Context,
  selector: Selectors,
): boolean {
  if (config.types == null) {
    return true;
  }

  if ((SelectorsAllowedToHaveTypes & selector) === 0) {
    return true;
  }

  const services = util.getParserServices(context);
  const checker = services.program.getTypeChecker();
  const type = services
    .getTypeAtLocation(node)
    // remove null and undefined from the type, as we don't care about it here
    .getNonNullableType();

  for (const allowedType of config.types) {
    switch (allowedType) {
      case TypeModifiers.array:
        if (
          isAllTypesMatch(
            type,
            t => checker.isArrayType(t) || checker.isTupleType(t),
          )
        ) {
          return true;
        }
        break;

      case TypeModifiers.function:
        if (isAllTypesMatch(type, t => t.getCallSignatures().length > 0)) {
          return true;
        }
        break;

      case TypeModifiers.boolean:
      case TypeModifiers.number:
      case TypeModifiers.string: {
        const typeString = checker.typeToString(
          // this will resolve things like true => boolean, 'a' => string and 1 => number
          checker.getWidenedType(checker.getBaseTypeOfLiteralType(type)),
        );
        const allowedTypeString = TypeModifiers[allowedType];
        if (typeString === allowedTypeString) {
          return true;
        }
        break;
      }
    }
  }

  return false;
}

/**
 * @returns `true` if the type (or all union types) in the given type return true for the callback
 */
function isAllTypesMatch(
  type: ts.Type,
  cb: (type: ts.Type) => boolean,
): boolean {
  if (type.isUnion()) {
    return type.types.every(t => cb(t));
  }

  return cb(type);
}

export { createValidator };
