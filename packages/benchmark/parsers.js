const Benchmark = require('benchmark');
const fs = require('fs');
const path = require('path');
const tsEstree = require('@typescript-eslint/typescript-estree');
const tsParser = require('@typescript-eslint/parser');

function runTSESTree(directory, files) {
  for (const file of files) {
    const result = tsEstree.parse(
      fs.readFileSync(path.join(__dirname, file), 'utf8'),
      {
        comment: true,
        tokens: true
      }
    );
    if (result.type !== 'Program') {
      throw new Error('something went wrong');
    }
  }
}

function runTSParser(directory, files) {
  for (const file of files) {
    const result = tsParser.parse(
      fs.readFileSync(path.join(__dirname, file), 'utf8'),
      {
        comment: true,
        tokens: true
      }
    );
    if (result.type !== 'Program') {
      throw new Error('something went wrong');
    }
  }
}

function createBenchmark(name, directory, files) {
  return new Promise((resolve, reject) => {
    const suite = new Benchmark.Suite(name);
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
      .run({
        async: true,
        minSamples: 100000,
        initCount: 100000
      });
  });
}

async function runAllBenchmarks(scenarios) {
  for (const scenario of scenarios) {
    console.log(scenario.name);
    await createBenchmark(scenario.name, scenario.directory, scenario.files);
  }
}

runAllBenchmarks([
  {
    name: 'Complex File',
    directory: 'fixtures/complex/',
    files: ['fixtures/complex/test.ts']
  },
  {
    name: 'Simple File',
    directory: 'fixtures/restrict-plus-operands/',
    files: ['fixtures/restrict-plus-operands/test1.ts']
  }
]).catch(e => {
  console.log(e);
});
