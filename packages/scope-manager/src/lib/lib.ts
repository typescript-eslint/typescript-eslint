// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib @typescript-eslint/scope-manager

import type { ImplicitLibVariableOptions } from '../variable';
import { dom } from './dom';
import { es5 } from './es5';
import { scripthost } from './scripthost';
import { webworker_importscripts } from './webworker.importscripts';

export const lib = {
  ...es5,
  ...dom,
  ...webworker_importscripts,
  ...scripthost,
} as Record<string, ImplicitLibVariableOptions>;
