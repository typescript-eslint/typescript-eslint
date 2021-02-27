const globby = require('globby');
const path = require('path');

const paths = globby.sync('*.md', {
  cwd: path.join(__dirname, '../../packages/eslint-plugin/docs/rules'),
});

module.exports = {
  someSidebar: {
    Rules: paths.map(item => path.basename(item, '.md')),
  },
};
