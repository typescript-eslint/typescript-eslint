// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';
import { es2015_symbol } from './es2015.symbol';
import { decorators } from './decorators';
import { TYPE } from './base-config';

export const esnext_decorators = {
  ...es2015_symbol,
  ...decorators,
  SymbolConstructor: TYPE,
  Function: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
