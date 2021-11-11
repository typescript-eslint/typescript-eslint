const path = require('path');
const config = require('./package.json');
const globby = require('globby');

const workspaces = config.workspaces.packages.map(ws =>
  path.posix.join(ws, 'package.json'),
);

const packages = globby
  .sync(workspaces, {
    cwd: __dirname,
  })
  .map(pJson => require(path.join(__dirname, pJson)).name)
  .map(name => (name.charAt(0) === '@' ? name.split('/')[1] : name));

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-length': [0],
    'body-max-line-length': [0],
    'footer-max-length': [0],
    'footer-max-line-length': [0],
    'header-max-length': [0],
    'scope-enum': [2, 'always', packages],
  },
};
