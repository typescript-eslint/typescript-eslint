const Benchmark = require('benchmark');
const tslint = require('tslint');
const eslint = require('eslint');
const path = require('path');
const fs = require('fs');

const files = [
  'fixtures2/src/test1.ts',
  'fixtures2/src/test2.ts',
  'fixtures2/src/test3.ts'
];

const suite = new Benchmark.Suite('eslint - tslint');
suite
  .add('tslint', function() {
    const linter = new tslint.Linter({ fix: false });
    const tslintConfig = tslint.Configuration.findConfiguration(
      'fixtures2/tslint.json',
      files[0]
    ).results;
    for (const file of files) {
      linter.lint(file, fs.readFileSync(path.join(__dirname, file), 'utf8'), tslintConfig);
    }
    const result = linter.getResult();
  })
  .add('eslint', function() {
    const linter = new eslint.CLIEngine({
      configFile: 'fixtures2/.eslintrc.json',
      extensions: ['.js', '.ts']
    });
    const result = linter.executeOnFiles(files);
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
