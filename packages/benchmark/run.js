const Benchmark = require('benchmark');
const tslint = require('tslint');
const eslint = require('eslint');
const path = require('path');
const fs = require('fs');

const file = 'fixtures/src/test-file.ts';

const suite = new Benchmark.Suite('eslint - tslint');
suite
  .add('tslint', function() {
    const fileContents = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const program = tslint.Linter.createProgram('fixtures/tsconfig.json');
    const linter = new tslint.Linter({ fix: false }, program);
    const tslintConfig = tslint.Configuration.findConfiguration(
      'fixtures/tslint.json',
      file
    ).results;
    linter.lint(file, fileContents, tslintConfig);
    const result = linter.getResult();
    if (result.errorCount === 0) {
      throw new Error('something went wrong')
    }
  })
  .add('eslint', function() {
    const linter = new eslint.CLIEngine({
      configFile: 'fixtures/.eslintrc.json',
      extensions: ['.js', '.ts']
    });
    const result = linter.executeOnFiles([file]);
    if (result.errorCount === 0) {
      throw new Error('something went wrong')
    }
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ', this.filter('fastest').map(i => i.name));
  })
  // run async
  .run({
    minSamples: 10000,
    initCount: 10000
  });
