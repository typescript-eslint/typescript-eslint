const Benchmark = require('benchmark');
const fs = require('fs');

function createBenchmark(name, directory, files, useServices) {
  return new Promise(resolve => {
    const suite = new Benchmark.Suite(name, {
      async: true
    });
    let message = '```\n';
    suite
      .add('tslint', function() {
        const result = require('./tslint').runTSLint(directory, files, useServices);
        if (typeof result !== 'string') {
          throw new Error('something went wrong');
        }
      })
      .add('eslint', function() {
        const result = require('./eslint').runESLint(directory, files, useServices);
        if (typeof result !== 'string') {
          throw new Error('something went wrong');
        }
      })
      // add listeners
      .on('cycle', function(event) {
        console.log(String(event.target));
        message += String(event.target) + '\n';
      })
      .on('error', function(e) {
        console.log(e);
      })
      .on('complete', function() {
        message += `Fastest is ${this.filter('fastest')
          .map(i => i.name)
          .join(', ')}\n`;
        message += '```\n';
        resolve(message);
      })
      .run();
  });
}

async function runAllBenchmarks(scenarios) {
  const messages = [];
  for (const scenario of scenarios) {
    console.log(`${scenario.name}`);
    let message = `## ${scenario.name}\n\n`;
    message += await createBenchmark(
      scenario.name,
      scenario.directory,
      scenario.files,
      scenario.useServices
    );
    messages.push(message);
  }
  fs.writeFileSync(
    'RULES.md',
    `# Benchmark TSLint - ESLint\n\n${messages.join('\n')}`
  );
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
