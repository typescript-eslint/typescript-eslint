import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
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
import { MessageIds, Options } from '../naming-convention';

interface MatchRegex {
  regex: string;
  match: boolean;
}

interface Selector {
  // format options
  format: PredefinedFormatsString[] | null;
  custom?: MatchRegex;
  leadingUnderscore?: UnderscoreOptionsString;
  trailingUnderscore?: UnderscoreOptionsString;
  prefix?: string[];
  suffix?: string[];
  // selector options
  selector:
    | IndividualAndMetaSelectorsString
    | IndividualAndMetaSelectorsString[];
  modifiers?: ModifiersString[];
  types?: TypeModifiersString[];
  filter?: string | MatchRegex;
}

interface NormalizedMatchRegex {
  regex: RegExp;
  match: boolean;
}

interface NormalizedSelector {
  // format options
  format: PredefinedFormats[] | null;
  custom: NormalizedMatchRegex | null;
  leadingUnderscore: UnderscoreOptions | null;
  trailingUnderscore: UnderscoreOptions | null;
  prefix: string[] | null;
  suffix: string[] | null;
  // selector options
  selector: Selectors | MetaSelectors;
  modifiers: Modifiers[] | null;
  types: TypeModifiers[] | null;
  filter: NormalizedMatchRegex | null;
  // calculated ordering weight based on modifiers
  modifierWeight: number;
}

type ValidatorFunction = (
  node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.Literal,
  modifiers?: Set<Modifiers>,
) => void;
type ParsedOptions = Record<SelectorsString, null | ValidatorFunction>;
type Context = Readonly<TSESLint.RuleContext<MessageIds, Options>>;

export type {
  Context,
  NormalizedSelector,
  ParsedOptions,
  Selector,
  ValidatorFunction,
};
