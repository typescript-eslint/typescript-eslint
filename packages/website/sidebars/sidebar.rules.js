const globby = require('globby');
const path = require('path');

const paths = globby.sync('*.md', {
  cwd: path.join(__dirname, '../../eslint-plugin/docs/rules'),
});

module.exports = {
  someSidebar: {
    Rules: paths.map(item => {
      const name = path.basename(item, '.md');
      return {
        type: 'doc',
        id: name,
        label: name,
      };
    }),
  },
};
