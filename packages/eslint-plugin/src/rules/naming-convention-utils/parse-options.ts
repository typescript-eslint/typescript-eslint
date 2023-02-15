import * as util from '../../util';
import {
  MetaSelectors,
  Modifiers,
  PredefinedFormats,
  Selectors,
  TypeModifiers,
  UnderscoreOptions,
} from './enums';
import { isMetaSelector } from './shared';
import type {
  Context,
  NormalizedSelector,
  ParsedOptions,
  Selector,
} from './types';
import { createValidator } from './validator';

function normalizeOption(option: Selector): NormalizedSelector[] {
  let weight = 0;
  option.modifiers?.forEach(mod => {
    weight |= Modifiers[mod];
  });
  option.types?.forEach(mod => {
    weight |= TypeModifiers[mod];
  });

  // give selectors with a filter the _highest_ priority
  if (option.filter) {
    weight |= 1 << 30;
  }

  const normalizedOption = {
    // format options
    format: option.format ? option.format.map(f => PredefinedFormats[f]) : null,
    custom: option.custom
      ? {
          regex: new RegExp(option.custom.regex, 'u'),
          match: option.custom.match,
        }
      : null,
    leadingUnderscore:
      option.leadingUnderscore !== undefined
        ? UnderscoreOptions[option.leadingUnderscore]
        : null,
    trailingUnderscore:
      option.trailingUnderscore !== undefined
        ? UnderscoreOptions[option.trailingUnderscore]
        : null,
    prefix: option.prefix && option.prefix.length > 0 ? option.prefix : null,
    suffix: option.suffix && option.suffix.length > 0 ? option.suffix : null,
    modifiers: option.modifiers?.map(m => Modifiers[m]) ?? null,
    types: option.types?.map(m => TypeModifiers[m]) ?? null,
    filter:
      option.filter !== undefined
        ? typeof option.filter === 'string'
          ? {
              regex: new RegExp(option.filter, 'u'),
              match: true,
            }
          : {
              regex: new RegExp(option.filter.regex, 'u'),
              match: option.filter.match,
            }
        : null,
    // calculated ordering weight based on modifiers
    modifierWeight: weight,
  };

  const selectors = Array.isArray(option.selector)
    ? option.selector
    : [option.selector];

  return selectors.map(selector => ({
    selector: isMetaSelector(selector)
      ? MetaSelectors[selector]
      : Selectors[selector],
    ...normalizedOption,
  }));
}

function parseOptions(context: Context): ParsedOptions {
  const normalizedOptions = context.options
    .map(opt => normalizeOption(opt))
    .reduce((acc, val) => acc.concat(val), []);

  const result = util.getEnumNames(Selectors).reduce((acc, k) => {
    acc[k] = createValidator(k, context, normalizedOptions);
    return acc;
  }, {} as ParsedOptions);

  return result;
}

export { parseOptions };
