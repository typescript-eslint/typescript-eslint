import fs from 'node:fs';

// Even when technically we only need to test one combination of each case,
// we still test all cases just to be sure
const knownErrors = [
  /^(const|using).*no-init/,
  /declare-using/,
  /declare-(let|var).*(?<!no-)init/,
  /declare-const.*type-init/,
  /declare.*definite/,
  /(const|using).*definite/,
  /definite.*(?<!no-)init/,
  /definite(?!-type)/,
  /using-destructure/,
  /^(?!declare).*destructure.*no-init/,
];

for (const keyword of ['const', 'let', 'var', 'using']) {
  for (const declare of [true, false]) {
    for (const id of ['id', 'destructure']) {
      // ! cannot coexist with destructuring
      for (const definite of id === 'id' ? [true, false] : [false]) {
        for (const type of [true, false]) {
          for (const init of [true, false]) {
            const fixtureName = `${declare ? 'declare-' : ''}${keyword}-${id}${definite ? '-definite' : ''}${type ? '-type' : ''}-${init ? 'init' : 'no-init'}`;
            const isError = knownErrors.some(re => re.test(fixtureName));
            fs.mkdirSync(`./${isError ? '_error_/' : ''}${fixtureName}`, {
              recursive: true,
            });
            fs.rmSync(`./${isError ? '' : '_error_/'}${fixtureName}`, {
              recursive: true,
              force: true,
            });
            fs.writeFileSync(
              `./${isError ? '_error_/' : ''}${fixtureName}/fixture.ts`,
              `${declare ? 'declare ' : ''}${keyword} ${id === 'id' ? 'foo' : '{ foo }'}${definite ? '!' : ''}${type ? ': any' : ''}${init ? ' = 1' : ''};\n`,
            );
          }
        }
      }
    }
  }
}
