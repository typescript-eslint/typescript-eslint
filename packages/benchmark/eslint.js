const eslint = require('eslint');
const path = require('path');
const fs = require('fs');

// exports.runESLint = function(directory, files, useServices) {
//   const linter = new eslint.CLIEngine({
//     files: files,
//     configFile: `${directory}.eslintrc.json`,
//     extensions: ['.js', '.ts']
//   });
//   const results = [];
//   for (const file of files) {
//     results.push(
//       linter.executeOnText(
//         fs.readFileSync(path.join(__dirname, file), 'utf8'),
//         file,
//         true
//       )
//     );
//   }
//
//   if (results[0].errorCount === 0) {
//     throw new Error('something went wrong');
//   }
//   if (
//     results[0].results[0].messages[0].message !==
//     'An empty interface is equivalent to `{}`.'
//   ) {
//     throw new Error('something went wrong');
//   }
// };

exports.runESLint = function(directory, files, useServices) {
  const linter = new eslint.Linter();
  linter.defineRule(
    '@typescript-eslint/no-empty-interface',
    require('@typescript-eslint/eslint-plugin/lib/rules/no-empty-interface')
  );
  linter.defineRule(
    '@typescript-eslint/restrict-plus-operands',
    require('@typescript-eslint/eslint-plugin/lib/rules/restrict-plus-operands')
  );
  let result;
  for (const file of files) {
    result = linter.verify(
      fs.readFileSync(path.join(__dirname, file), 'utf8'),
      require(`./${directory}.eslintrc.json`),
      file
    )
  }
  if (result.length === 0) {
    throw new Error('something went wrong');
  }

  return result[0].message;
};
