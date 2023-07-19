import all from './all';
import base from './base';
import disableTypeChecked from './disable-type-checked';
import eslintRecommended from './eslint-recommended';
import recommended from './recommended';
import recommendedTypeChecked from './recommended-type-checked';
import strict from './strict';
import strictTypeChecked from './strict-type-checked';
import stylistic from './stylistic';
import stylisticTypeChecked from './stylistic-type-checked';

export const configs = {
  all,
  base,
  'disable-type-checked': disableTypeChecked,
  'eslint-recommended': eslintRecommended,
  recommended,
  /** @deprecated - please use "recommended-type-checked" instead. */
  'recommended-requiring-type-checking': recommendedTypeChecked,
  'recommended-type-checked': recommendedTypeChecked,
  strict,
  'strict-type-checked': strictTypeChecked,
  stylistic,
  'stylistic-type-checked': stylisticTypeChecked,
};
