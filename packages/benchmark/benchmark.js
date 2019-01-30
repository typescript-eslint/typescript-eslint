const Benchmark = require('benchmark');

function createBenchmark(name, directory, files, useServices) {
  return new Promise((resolve, reject) => {
    const suite = new Benchmark.Suite(name, {
      async: true
    });
    suite
      .add('tslint', function() {
        const result = require('./tslint-runner').runTSLint(
          directory,
          files,
          useServices
        );
        if (typeof result !== 'string') {
          throw new Error('something went wrong');
        }
      })
      .add('eslint', function() {
        const result = require('./eslint-runner').runESLint(
          directory,
          files,
          useServices
        );
        if (typeof result !== 'string') {
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

async function runAllBenchmarks(scenarios) {
  for (const scenario of scenarios) {
    console.log(scenario.name);
    await createBenchmark(
      scenario.name,
      scenario.directory,
      scenario.files,
      scenario.useServices
    );
  }
}

runAllBenchmarks([
  {
    name: 'Single File: restrict-plus-operands',
    directory: 'fixtures/restrict-plus-operands/',
    useServices: true,
    files: ['fixtures/restrict-plus-operands/test1.ts']
  },
  {
    name: 'Multi File: restrict-plus-operands',
    directory: 'fixtures/restrict-plus-operands/',
    useServices: true,
    files: [
      'fixtures/restrict-plus-operands/test1.ts',
      'fixtures/restrict-plus-operands/test2.ts',
      'fixtures/restrict-plus-operands/test3.ts'
    ]
  },
  {
    name: 'Single File: no-empty-interface',
    directory: 'fixtures/no-empty-interface/',
    useServices: false,
    files: ['fixtures/no-empty-interface/test1.ts']
  },
  {
    name: 'Multi File: no-empty-interface',
    directory: 'fixtures/no-empty-interface/',
    useServices: false,
    files: [
      'fixtures/no-empty-interface/test1.ts',
      'fixtures/no-empty-interface/test2.ts',
      'fixtures/no-empty-interface/test3.ts'
    ]
  }
]).catch(e => {
  console.log(e);
});
