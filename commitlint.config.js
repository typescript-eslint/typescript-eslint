const workspace = require('./workspace.json');

const packages = Object.keys(workspace.projects).map(name =>
  name.charAt(0) === '@' ? name.split('/')[1] : name,
);

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
