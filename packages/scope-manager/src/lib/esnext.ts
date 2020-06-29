// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es2020 } from './es2020';
import { esnext_intl } from './esnext.intl';
import { esnext_string } from './esnext.string';
import { esnext_promise } from './esnext.promise';

export const esnext = {
  ...es2020,
  ...esnext_intl,
  ...esnext_string,
  ...esnext_promise,
} as Record<string, ImplicitLibVariableOptions>;
