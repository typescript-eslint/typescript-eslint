/**
 * @fileoverview TypeScript plugin for ESLint
 * @author Nicholas C. Zakas
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import requireIndex from 'requireindex';
import path from 'path';

import recommended from './configs/recommended.json';

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
export = {
  rules: requireIndex(path.join(__dirname, 'lib/rules')),
  configs: {
    recommended
  }
};
