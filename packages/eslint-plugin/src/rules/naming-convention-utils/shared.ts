import type {
  IndividualAndMetaSelectorsString,
  MetaSelectorsString,
  Selectors,
  SelectorsString,
} from './enums';

import { MetaSelectors } from './enums';

export function selectorTypeToMessageString(
  selectorType: SelectorsString,
): string {
  const notCamelCase = selectorType.replaceAll(/([A-Z])/g, ' $1');
  return notCamelCase.charAt(0).toUpperCase() + notCamelCase.slice(1);
}

export function isMetaSelector(
  selector: IndividualAndMetaSelectorsString | MetaSelectors | Selectors,
): selector is MetaSelectorsString {
  return selector in MetaSelectors;
}

export function isMethodOrPropertySelector(
  selector: IndividualAndMetaSelectorsString | MetaSelectors | Selectors,
): boolean {
  return (
    selector === MetaSelectors.method || selector === MetaSelectors.property
  );
}
