import { SyntaxKind } from '@typescript/native/unstable/ast';
import { API } from '@typescript/native/unstable/sync';
import { describe, expect, it } from 'vitest';

describe('TypeScript native API', () => {
  it('exports the synchronous API and AST kinds', () => {
    expect(API).toBeTypeOf('function');
    expect(SyntaxKind.SourceFile).toBeTypeOf('number');
  });
});
