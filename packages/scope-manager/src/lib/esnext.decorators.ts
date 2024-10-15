// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { ImplicitLibVariableOptions } from '../variable';

import { TYPE } from './base-config';
import { decorators } from './decorators';
import { es2015_symbol } from './es2015.symbol';

export const esnext_decorators = {
  ...es2015_symbol,
  ...decorators,
  Function: TYPE,
  SymbolConstructor: TYPE,
} as Record<string, ImplicitLibVariableOptions>;
