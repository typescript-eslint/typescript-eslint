'use strict';

require('ts-node').register({
  scope: true,
  scopeDir: __dirname,
  transpileOnly: true,
});

module.exports = require('./docusaurusConfig');
