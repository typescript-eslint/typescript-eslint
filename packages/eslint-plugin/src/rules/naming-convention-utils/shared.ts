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
): selector is MetaSelectors | MetaSelectorsString {
  // `MetaSelectors` is a numeric enum, so its reverse mapping makes this true
  // for the enum's values as well as for its keys.
  return selector in MetaSelectors;
}

export function isMethodOrPropertySelector(
  selector: IndividualAndMetaSelectorsString | MetaSelectors | Selectors,
): boolean {
  return (
    selector === MetaSelectors.method || selector === MetaSelectors.property
  );
}
