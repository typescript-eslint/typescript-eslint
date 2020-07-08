// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es5 } from './es5';
import { es2015_core } from './es2015.core';
import { es2015_collection } from './es2015.collection';
import { es2015_iterable } from './es2015.iterable';
import { es2015_generator } from './es2015.generator';
import { es2015_promise } from './es2015.promise';
import { es2015_proxy } from './es2015.proxy';
import { es2015_reflect } from './es2015.reflect';
import { es2015_symbol } from './es2015.symbol';
import { es2015_symbol_wellknown } from './es2015.symbol.wellknown';

export const es2015 = {
  ...es5,
  ...es2015_core,
  ...es2015_collection,
  ...es2015_iterable,
  ...es2015_generator,
  ...es2015_promise,
  ...es2015_proxy,
  ...es2015_reflect,
  ...es2015_symbol,
  ...es2015_symbol_wellknown,
} as Record<string, ImplicitLibVariableOptions>;
