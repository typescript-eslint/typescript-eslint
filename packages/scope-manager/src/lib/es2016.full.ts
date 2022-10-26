// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { dom } from './dom';
import { dom_iterable } from './dom.iterable';
import { es2016 } from './es2016';
import { scripthost } from './scripthost';
import { webworker_importscripts } from './webworker.importscripts';

export const es2016_full = {
  ...es2016,
  ...dom,
  ...webworker_importscripts,
  ...scripthost,
  ...dom_iterable,
} as Record<string, ImplicitLibVariableOptions>;
