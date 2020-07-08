// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es2016 } from './es2016';
import { es2017_object } from './es2017.object';
import { es2017_sharedmemory } from './es2017.sharedmemory';
import { es2017_string } from './es2017.string';
import { es2017_intl } from './es2017.intl';
import { es2017_typedarrays } from './es2017.typedarrays';

export const es2017 = {
  ...es2016,
  ...es2017_object,
  ...es2017_sharedmemory,
  ...es2017_string,
  ...es2017_intl,
  ...es2017_typedarrays,
} as Record<string, ImplicitLibVariableOptions>;
