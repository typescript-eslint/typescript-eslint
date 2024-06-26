import type { ESLintPluginRuleModule } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import type * as unist from 'unist';

import type { VFileWithStem } from '../utils/rules';
import { findH2Index } from '../utils/rules';

export interface RequiredHeadingIndices {
  howToUse: number;
  options: number;
  whenNotToUseIt: number;
}

// The first two may be autogenerated.
// Inserting one heading requires shifting all following ones.
export const requiredHeadingNames = [
  'How to Use',
  'Options',
  'When Not To Use It',
  'Related To',
] as const;

export type HeadingName = (typeof requiredHeadingNames)[number];

export class RuleDocsPage {
  #children: unist.Node[];
  #file: Readonly<VFileWithStem>;
  #headingIndices: RequiredHeadingIndices;
  #rule: Readonly<ESLintPluginRuleModule>;

  get children(): Readonly<unist.Node[]> {
    return this.#children;
  }

  get file(): Readonly<VFileWithStem> {
    return this.#file;
  }

  get headingIndices(): Readonly<RequiredHeadingIndices> {
    return this.#headingIndices;
  }

  get rule(): Readonly<ESLintPluginRuleModule> {
    return this.#rule;
  }

  constructor(
    children: unist.Node[],
    file: Readonly<VFileWithStem>,
    rule: Readonly<ESLintPluginRuleModule>,
  ) {
    this.#children = children;
    this.#file = file;
    this.#headingIndices = this.#recreateHeadingIndices();
    this.#rule = rule;
  }

  spliceChildren(
    start: number,
    deleteCount: number,
    ...items: unist.Node[]
  ): void {
    this.#children.splice(start, deleteCount, ...items);
    this.#headingIndices = this.#recreateHeadingIndices();
  }

  #recreateHeadingIndices(): RequiredHeadingIndices {
    return {
      howToUse: findH2Index(this.#children, requiredHeadingNames[0]),
      options: findH2Index(this.#children, requiredHeadingNames[1]),
      whenNotToUseIt: findH2Index(this.#children, requiredHeadingNames[2]),
    };
  }
}
