import chalk from 'chalk';

function logRule(
  success: boolean,
  ruleName: string,
  ...messages: string[]
): void {
  if (success) {
    console.log(chalk.bold.green('✔'), chalk.dim(ruleName));
  } else {
    logError(chalk.bold(ruleName));
    messages.forEach(m => console.error(chalk.bold.red('    -'), m));
  }
}

function logError(...messages: string[]): void {
  console.error(chalk.bold.red('✗'), ...messages);
}

export { logError, logRule };
