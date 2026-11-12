import * as ts from 'typescript';

import { createIsolatedProgram } from '../../src/create-program/createIsolatedProgram';
import { createParseSettings } from '../../src/parseSettings/createParseSettings';

describe(createIsolatedProgram, () => {
  it('sets the jsx compiler option when jsx is enabled', () => {
    const parseSettings = createParseSettings('const element = <div />;', {
      filePath: 'file.tsx',
      jsx: true,
    });

    const { ast, program } = createIsolatedProgram(parseSettings);

    expect(program.getCompilerOptions().jsx).toBe(ts.JsxEmit.Preserve);
    expect(ast.languageVariant).toBe(ts.LanguageVariant.JSX);
  });

  it('does not set the jsx compiler option when jsx is not enabled', () => {
    const parseSettings = createParseSettings('const value = 1;', {
      filePath: 'file.ts',
    });

    const { ast, program } = createIsolatedProgram(parseSettings);

    expect(program.getCompilerOptions().jsx).toBeUndefined();
    expect(ast.languageVariant).toBe(ts.LanguageVariant.Standard);
  });
});
