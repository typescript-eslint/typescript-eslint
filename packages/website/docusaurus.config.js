'use strict';

require('ts-node').register({
  scope: true,
  scopeDir: __dirname,
  swc: true,
  transpileOnly: true,
});

module.exports = require('./docusaurusConfig');
