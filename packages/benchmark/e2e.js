const Benchmark = require('benchmark');
const child_process = require('child_process');
const path = require('path');

function normalizeCommand(command) {
  return path.normalize(command);
}

function createBenchmark(name, directory, files, useServices) {
  return new Promise((resolve, reject) => {
    const suite = new Benchmark.Suite(name, {
      async: true
    });
    suite
      .add('tslint', function() {
        let hasError = false;
        try {
          child_process.execSync(
            normalizeCommand('./node_modules/.bin/tslint') +
              ' -p fixtures/restrict-plus-operands/tsconfig.json "fixtures/restrict-plus-operands/*.ts"'
          );
        } catch (e) {
          // console.error(e.output ? e.output.toString() : e);
          hasError = true;
        }
        if (!hasError) {
          throw new Error('something went wrong');
        }
      })
      .add('eslint', function() {
        let hasError = false;
        try {
          child_process.execSync(
            normalizeCommand('./node_modules/.bin/eslint') +
              ' --ext .ts "fixtures/restrict-plus-operands/*.ts"'
          );
        } catch (e) {
          // console.error(e.output ? e.output.toString() : e);
          hasError = true;
        }
        if (!hasError) {
          throw new Error('something went wrong');
        }
      })
      // add listeners
      .on('cycle', function(event) {
        console.log(String(event.target));
      })
      .on('error', function(e) {
        reject(e);
      })
      .on('complete', function() {
        console.log(
          `Fastest is ${this.filter('fastest')
            .map(i => i.name)
            .join(', ')}`
        );
        resolve();
      })
      .run();
  });
}

createBenchmark().catch(e => {
  console.log(e);
});
