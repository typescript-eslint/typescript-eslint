import type {
  IndividualAndMetaSelectorsString,
  MetaSelectorsString,
  Selectors,
  SelectorsString,
} from './enums';
import { MetaSelectors } from './enums';

function selectorTypeToMessageString(selectorType: SelectorsString): string {
  const notCamelCase = selectorType.replace(/([A-Z])/g, ' $1');
  return notCamelCase.charAt(0).toUpperCase() + notCamelCase.slice(1);
}

function isMetaSelector(
  selector: IndividualAndMetaSelectorsString | Selectors | MetaSelectors,
): selector is MetaSelectorsString {
  return selector in MetaSelectors;
}

function isMethodOrPropertySelector(
  selector: IndividualAndMetaSelectorsString | Selectors | MetaSelectors,
): boolean {
  return (
    selector === MetaSelectors.method || selector === MetaSelectors.property
  );
}

export {
  selectorTypeToMessageString,
  isMetaSelector,
  isMethodOrPropertySelector,
};
