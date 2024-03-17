// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/repo-tools

import type { ImplicitLibVariableOptions } from '../variable';
import { dom } from './dom';
import { dom_asynciterable } from './dom.asynciterable';
import { dom_iterable } from './dom.iterable';
import { es2021 } from './es2021';
import { scripthost } from './scripthost';
import { webworker_importscripts } from './webworker.importscripts';

export const es2021_full = {
  ...es2021,
  ...dom,
  ...webworker_importscripts,
  ...scripthost,
  ...dom_iterable,
  ...dom_asynciterable,
} as Record<string, ImplicitLibVariableOptions>;
