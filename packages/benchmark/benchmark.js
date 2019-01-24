const Benchmark = require('benchmark');
const tslint = require('tslint');
const eslint = require('eslint');
const path = require('path');
const fs = require('fs');

function runTSLint(directory, files, useServices) {
  const program = useServices
    ? tslint.Linter.createProgram(`${directory}/tsconfig.json`)
    : undefined;
  const linter = new tslint.Linter({ fix: false }, program);
  const tslintConfig = tslint.Configuration.findConfiguration(
    `${directory}/tslint.json`,
    files[0]
  ).results;
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
}

function runESLint(directory, files, useServices) {
  const linter = new eslint.CLIEngine({
    configFile: `${directory}/.eslintrc.json`,
    extensions: ['.js', '.ts']
  });
  const result = linter.executeOnFiles(files);
  if (result.errorCount === 0) {
    throw new Error('something went wrong');
  }
}

function createBenchmark(name, directory, files, useServices) {
  return new Promise(resolve => {
    const suite = new Benchmark.Suite(name);
    let message = '```\n';
    suite
      .add('tslint', function() {
        runTSLint(directory, files, useServices);
      })
      .add('eslint', function() {
        runESLint(directory, files, useServices);
      })
      // add listeners
      .on('cycle', function(event) {
        console.log(String(event.target));
        message += String(event.target) + '\n';
      })
      .on('complete', function() {
        message += `Fastest is ${this.filter('fastest')
          .map(i => i.name)
          .join(', ')}\n`;
        message += '```\n';
        resolve(message);
      })
      .run({
        // async: true,
        minSamples: 1000,
        initCount: 1000
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
      scenario.files,
      scenario.useServices
    );
    messages.push(message);
  }
  fs.writeFileSync(
    'README.md',
    `# Benchmark TSLint - ESLint\n\n${messages.join('\n\n')}`
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
