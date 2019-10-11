import chalk from 'chalk';
import { checkConfigRecommended } from './checkConfigRecommended';
import { checkConfigRecommendedRequiringTypeChecking } from './checkConfigRecommendedRequiringTypeChecking';
import { checkConfigAll } from './checkConfigAll';

let hasErrors = false;
console.log(chalk.underline('Checking config "recommended"'));
hasErrors = checkConfigRecommended() || hasErrors;

console.log(
  chalk.underline('Checking config "recommended-requiring-type-checking"'),
);
hasErrors = checkConfigRecommendedRequiringTypeChecking() || hasErrors;

console.log();
console.log(chalk.underline('Checking config "all"'));
hasErrors = checkConfigAll() || hasErrors;

if (hasErrors) {
  console.log('\n\n');
  console.error(
    chalk.bold.bgRed.white('There were errors found in the configs'),
  );
  console.error(`Please run ${chalk.inverse('yarn generate:configs')}`);
  console.log('\n\n');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
