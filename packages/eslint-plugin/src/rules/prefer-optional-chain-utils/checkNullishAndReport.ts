import { isTypeFlagSet } from '@typescript-eslint/type-utils';
import type {
  ReportDescriptor,
  RuleContext,
} from '@typescript-eslint/utils/ts-eslint';
import { unionTypeParts } from 'ts-api-utils';
import * as ts from 'typescript';

import type {
  PreferOptionalChainMessageIds,
  PreferOptionalChainOptions,
} from './PreferOptionalChainOptions';
import {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/typescript-estree';

export function checkNullishAndReport(
  context: RuleContext<
    PreferOptionalChainMessageIds,
    [PreferOptionalChainOptions]
  >,
  parserServices: ParserServicesWithTypeInformation,
  { requireNullish }: PreferOptionalChainOptions,
  maybeNullishNodes: TSESTree.Expression[],
  descriptor: ReportDescriptor<PreferOptionalChainMessageIds>,
): void {
  if (
    !requireNullish ||
    maybeNullishNodes.some(node =>
      unionTypeParts(parserServices.getTypeAtLocation(node)).some(t =>
        isTypeFlagSet(t, ts.TypeFlags.Null | ts.TypeFlags.Undefined),
      ),
    )
  ) {
    context.report(descriptor);
  }
}
