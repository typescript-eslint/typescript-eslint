const tslint = require('tslint');
const path = require('path');
const fs = require('fs');

exports.runTSLint = function(directory, files, useServices) {
  const program = useServices
    ? tslint.Linter.createProgram(`${directory}tsconfig.json`)
    : undefined;
  const linter = new tslint.Linter(
    {
      fix: false,
      formatter: 'json'
    },
    program
  );
  const tslintConfig = tslint.Configuration.loadConfigurationFromPath(
    `./${directory}tslint.json`
  );
  for (const file of files) {
    linter.lint(
      file,
      fs.readFileSync(path.join(__dirname, file), 'utf8'),
      tslintConfig
    );
  }
  const result = linter.getResult();
  if (result.errorCount === 0) {
    throw new Error('something went wrong');
  }
  return result.failures[0].failure;
};
