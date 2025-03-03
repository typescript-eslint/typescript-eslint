// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { dom } from './dom';
import { es5 } from './es5';
import { scripthost } from './scripthost';
import { webworker_importscripts } from './webworker.importscripts';

export const lib: LibDefinition = {
  libs: [es5, dom, webworker_importscripts, scripthost],
  variables: [],
};
