// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { es2019 } from './es2019';
import { es2020_bigint } from './es2020.bigint';
import { es2020_date } from './es2020.date';
import { es2020_intl } from './es2020.intl';
import { es2020_number } from './es2020.number';
import { es2020_promise } from './es2020.promise';
import { es2020_sharedmemory } from './es2020.sharedmemory';
import { es2020_string } from './es2020.string';
import { es2020_symbol_wellknown } from './es2020.symbol.wellknown';

export const es2020 = {
  ...es2019,
  ...es2020_bigint,
  ...es2020_date,
  ...es2020_number,
  ...es2020_promise,
  ...es2020_sharedmemory,
  ...es2020_string,
  ...es2020_symbol_wellknown,
  ...es2020_intl,
} as Record<string, ImplicitLibVariableOptions>;
