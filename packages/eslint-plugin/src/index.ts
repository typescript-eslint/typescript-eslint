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

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
export default {
  rules: requireIndex(path.join(__dirname, 'rules')),
  configs: {
    // eslint-disable-next-line node/no-unpublished-require
    recommended: require('./configs/recommended')
  }
};
