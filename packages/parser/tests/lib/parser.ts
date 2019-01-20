import * as typescriptESTree from '@typescript-eslint/typescript-estree';
import { parse, parseForESLint, Syntax } from '../../src/parser';
import * as scope from '../../src/analyze-scope';

describe('parser', () => {
  it('parse() should return just the AST from parseForESLint()', () => {
    const code = 'const valid = true;';
    expect(parse(code)).toEqual(parseForESLint(code).ast);
  });

  it('parseForESLint() should work if options are `null`', () => {
    const code = 'const valid = true;';
    expect(() => parseForESLint(code, null)).not.toThrow();
  });

  it('parseForESLint() should set the sourceType to script, if an invalid one is provided', () => {
    const code = 'const valid = true;';
    const spy = jest.spyOn(typescriptESTree, 'parseAndGenerateServices');
    const spyScope = jest.spyOn(scope, 'analyzeScope');
    parseForESLint(code, { sourceType: 'foo' as any });
    expect(spy).toHaveBeenCalledWith(code, {
      comment: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      errorOnUnknownASTType: false,
      jsx: false,
      loc: true,
      range: true,
      tokens: true,
      useJSXTextNode: true
    });
    expect(spyScope).toHaveBeenCalledWith(jasmine.any(Object), {
      ecmaFeatures: {},
      sourceType: 'script'
    });
  });

  it('Syntax should contain a frozen object of typescriptESTree.AST_NODE_TYPES', () => {
    expect(Syntax).toEqual(typescriptESTree.AST_NODE_TYPES);
    expect(
      () => ((Syntax as any).ArrayExpression = 'foo')
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot assign to read only property 'ArrayExpression' of object '#<Object>'"`
    );
  });
});
