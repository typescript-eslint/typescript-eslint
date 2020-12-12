import {
  IndividualAndMetaSelectorsString,
  MetaSelectors,
  MetaSelectorsString,
  Selectors,
  SelectorsString,
} from './enums';

function selectorTypeToMessageString(selectorType: SelectorsString): string {
  const notCamelCase = selectorType.replace(/([A-Z])/g, ' $1');
  return notCamelCase.charAt(0).toUpperCase() + notCamelCase.slice(1);
}

function isMetaSelector(
  selector: IndividualAndMetaSelectorsString | Selectors | MetaSelectors,
): selector is MetaSelectorsString {
  return selector in MetaSelectors;
}

export { selectorTypeToMessageString, isMetaSelector };
