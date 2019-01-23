import Benchmark from 'benchmark';
import { Linter, Configuration } from 'tslint';
import eslint from 'eslint';
import { join } from 'path';
import { readFileSync } from 'fs';

const file = 'fixtures/src/test-file.ts';
const fileContents = readFileSync(join(__dirname, file), 'utf8');

const suite = new Benchmark.Suite('eslint - tslint');
suite
  .add('tslint', function() {
    const program = Linter.createProgram('fixtures/tsconfig.json');
    const linter = new Linter({ fix: false }, program);
    const tslintConfig = Configuration.findConfiguration(
      'fixtures/tslint.json',
      file
    ).results;
    linter.lint(file, fileContents, tslintConfig);
    linter.getResult();
  })
  .add('eslint', function() {
    const linter = new eslint.CLIEngine({
      configFile: 'fixtures/.eslintrc.json',
      extensions: ['.js', '.ts']
    });
    linter.executeOnFiles([file]);
  })
  // add listeners
  .on('cycle', function(event: Benchmark.Event) {
    console.log(String(event.target));
  })
  .on('complete', function(this: Benchmark.Suite) {
    console.log('Fastest is ', this.filter('fastest').map((i: any) => i.name));
  })
  // run async
  .run({
    async: true,
    minSamples: 10000,
    initCount: 10000
  });
