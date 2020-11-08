// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es2019 } from './es2019';
import { es2020_bigint } from './es2020.bigint';
import { es2020_promise } from './es2020.promise';
import { es2020_sharedmemory } from './es2020.sharedmemory';
import { es2020_string } from './es2020.string';
import { es2020_symbol_wellknown } from './es2020.symbol.wellknown';
import { es2020_intl } from './es2020.intl';

export const es2020 = {
  ...es2019,
  ...es2020_bigint,
  ...es2020_promise,
  ...es2020_sharedmemory,
  ...es2020_string,
  ...es2020_symbol_wellknown,
  ...es2020_intl,
} as Record<string, ImplicitLibVariableOptions>;
