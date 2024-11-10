import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import type { MessageIds, Options } from '../naming-convention';
import type {
  IndividualAndMetaSelectorsString,
  MetaSelectors,
  Modifiers,
  ModifiersString,
  PredefinedFormats,
  PredefinedFormatsString,
  Selectors,
  SelectorsString,
  TypeModifiers,
  TypeModifiersString,
  UnderscoreOptions,
  UnderscoreOptionsString,
} from './enums';

interface MatchRegex {
  match: boolean;
  regex: string;
}

interface Selector {
  custom?: MatchRegex;
  filter?: string | MatchRegex;
  // format options
  format: PredefinedFormatsString[] | null;
  leadingUnderscore?: UnderscoreOptionsString;
  modifiers?: ModifiersString[];
  prefix?: string[];
  // selector options
  selector:
    | IndividualAndMetaSelectorsString
    | IndividualAndMetaSelectorsString[];
  suffix?: string[];
  trailingUnderscore?: UnderscoreOptionsString;
  types?: TypeModifiersString[];
}

interface NormalizedMatchRegex {
  match: boolean;
  regex: RegExp;
}

interface NormalizedSelector {
  custom: NormalizedMatchRegex | null;
  filter: NormalizedMatchRegex | null;
  // format options
  format: PredefinedFormats[] | null;
  leadingUnderscore: UnderscoreOptions | null;
  modifiers: Modifiers[] | null;
  // calculated ordering weight based on modifiers
  modifierWeight: number;
  prefix: string[] | null;
  // selector options
  selector: MetaSelectors | Selectors;
  suffix: string[] | null;
  trailingUnderscore: UnderscoreOptions | null;
  types: TypeModifiers[] | null;
}

type ValidatorFunction = (
  node: TSESTree.Identifier | TSESTree.Literal | TSESTree.PrivateIdentifier,
  modifiers?: Set<Modifiers>,
) => void;
type ParsedOptions = Record<SelectorsString, ValidatorFunction>;
type Context = Readonly<TSESLint.RuleContext<MessageIds, Options>>;

export type {
  Context,
  NormalizedSelector,
  ParsedOptions,
  Selector,
  ValidatorFunction,
};
