const Benchmark = require('benchmark');
const fs = require('fs');
const tsEstree = require('@typescript-eslint/typescript-estree');
const tsParser = require('@typescript-eslint/parser');

function runTSESTree(directory, files) {
  for (const file of files) {
    const result = tsEstree.parse(file, {
      comment: true,
      tokens: true
    });
    if (result.type !== 'Program') {
      throw new Error('something went wrong');
    }
  }
}

function runTSParser(directory, files) {
  for (const file of files) {
    const result = tsParser.parse(file, {
      comment: true,
      tokens: true
    });
    if (result.type !== 'Program') {
      throw new Error('something went wrong');
    }
  }
}

function createBenchmark(name, directory, files) {
  return new Promise(resolve => {
    const suite = new Benchmark.Suite(name);
    let message = '```\n';
    suite
      .add('ts-estree', function() {
        runTSESTree(directory, files);
      })
      .add('ts-parser', function tsParser() {
        runTSParser(directory, files);
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
      .run({
        async: true,
        minSamples: 100000,
        initCount: 100000
      });
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
      scenario.files
    );
    messages.push(message);
  }
  fs.writeFileSync(
    'PARSERS.md',
    `# Benchmark TSEstree - Parser\n\n${messages.join('\n')}`
  );
}

runAllBenchmarks([
  {
    name: 'Single File',
    directory: 'fixtures/restrict-plus-operands/',
    files: ['fixtures/restrict-plus-operands/test1.ts']
  }
]).catch(e => {
  console.log(e);
});
