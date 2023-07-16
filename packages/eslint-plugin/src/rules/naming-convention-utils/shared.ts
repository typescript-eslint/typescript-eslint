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
  selector: IndividualAndMetaSelectorsString | MetaSelectors | Selectors,
): selector is MetaSelectorsString {
  return selector in MetaSelectors;
}

function isMethodOrPropertySelector(
  selector: IndividualAndMetaSelectorsString | MetaSelectors | Selectors,
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
