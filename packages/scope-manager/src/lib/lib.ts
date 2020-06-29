// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// YOU CAN REGENERATE IT USING yarn generate:lib

import { ImplicitLibVariableOptions } from '../variable';
import { es5 } from './es5';
import { dom } from './dom';
import { webworker_importscripts } from './webworker.importscripts';
import { scripthost } from './scripthost';

export const lib = {
  ...es5,
  ...dom,
  ...webworker_importscripts,
  ...scripthost,
} as Record<string, ImplicitLibVariableOptions>;
