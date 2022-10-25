// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { dom } from './dom';
import { dom_iterable } from './dom.iterable';
import { es2019 } from './es2019';
import { scripthost } from './scripthost';
import { webworker_importscripts } from './webworker.importscripts';

export const es2019_full = {
  ...es2019,
  ...dom,
  ...webworker_importscripts,
  ...scripthost,
  ...dom_iterable,
} as Record<string, ImplicitLibVariableOptions>;
