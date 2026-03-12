import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type { Node } from 'unist';

import type { RuleDocsPage } from '../RuleDocsPage';

import { nodeIsHeading, nodeIsMdxFlowExpression } from '../../utils/nodes';
import { findHeadingIndex } from '../../utils/rules';

const knownSkippedRules = new Set([
  'array-type',
  'ban-ts-comment',
  'member-ordering',
]);

const emptyOptionDefaults = new Map<unknown, unknown>([
  ['array', []],
  ['boolean', false],
]);

export function insertRuleOptions(page: RuleDocsPage): void {
  if (
    knownSkippedRules.has(page.file.stem) ||
    !Array.isArray(page.rule.meta.schema)
  ) {
    return;
  }

  const optionProperties = getOptionProperties(
    (page.rule.meta.schema as JSONSchema4[]).at(0),
  );

  if (!optionProperties) {
    return;
  }

  // Keep accepting deprecated defaultOptions for backward compatibility.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const defaultOptions = (page.rule.defaultOptions?.[0] ?? {}) as Record<
    string,
    unknown
  >;

  for (const [optionName, option] of Object.entries(optionProperties)) {
    if (!option.description) {
      if (!page.rule.meta.docs.extendsBaseRule) {
        throw new Error(`Missing description for option ${optionName}.`);
      }
      return;
    }

    const existingHeadingIndex = findHeadingIndex(
      page.children,
      3,
      node => node.type === 'inlineCode' && node.value === optionName,
    );
    if (existingHeadingIndex === -1) {
      if (!page.rule.meta.docs.extendsBaseRule) {
        throw new Error(`Couldn't find h3 for option ${optionName}.`);
      }
      continue;
    }

    const commentInsertionIndex = findCommentIndexForOption(
      page.children,
      existingHeadingIndex,
    );
    if (commentInsertionIndex === -1) {
      throw new Error(
        `[${page.file.stem}] Could not find ${OPTION_COMMENT} under option heading ${optionName}.`,
      );
    }

    const defaultValue =
      defaultOptions[optionName] ?? emptyOptionDefaults.get(option.type);

    page.spliceChildren(
      commentInsertionIndex,
      0,
      // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish -- I don't know whether this is safe to fix
      defaultValue !== undefined
        ? `${option.description} Default: \`${JSON.stringify(defaultValue)}\`.`
        : option.description,
    );
  }
}

const OPTION_COMMENT = `/* insert option description */`;

function findCommentIndexForOption(
  children: readonly Node[],
  headingIndex: number,
): number {
  for (let i = headingIndex + 1; i < children.length; i += 1) {
    const child = children[i];
    if (nodeIsMdxFlowExpression(child) && child.value === OPTION_COMMENT) {
      return i;
    }

    if (nodeIsHeading(child)) {
      break;
    }
  }

  return -1;
}

function getOptionProperties(
  options: JSONSchema4 | undefined,
): Record<string, JSONSchema4> | undefined {
  if (!options) {
    return undefined;
  }

  if (options.type === 'object') {
    return options.properties;
  }

  if (options.oneOf) {
    return options.oneOf.reduce<Record<string, JSONSchema4>>(
      (previous, next) => ({
        ...previous,
        ...getOptionProperties(next),
      }),
      {},
    );
  }

  return undefined;
}
