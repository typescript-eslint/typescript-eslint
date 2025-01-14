// THIS CODE WAS AUTOMATICALLY GENERATED
// DO NOT EDIT THIS CODE BY HAND
// RUN THE FOLLOWING COMMAND FROM THE WORKSPACE ROOT TO REGENERATE:
// npx nx generate-lib repo

import type { LibDefinition } from '../variable';

import { dom } from './dom';
import { dom_asynciterable } from './dom.asynciterable';
import { dom_iterable } from './dom.iterable';
import { es2020 } from './es2020';
import { scripthost } from './scripthost';
import { webworker_importscripts } from './webworker.importscripts';

export const es2020_full: LibDefinition = {
  libs: [
    es2020,
    dom,
    webworker_importscripts,
    scripthost,
    dom_iterable,
    dom_asynciterable,
  ],
  variables: [],
};
