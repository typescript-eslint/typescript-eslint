import nativePackage from '@typescript/native/package.json';
import { SyntaxKind } from '@typescript/native/unstable/ast';
import { API } from '@typescript/native/unstable/sync';
import { describe, expect, it } from 'vitest';

describe('TypeScript native API', () => {
  it('provides the supported startup API', () => {
    expect(nativePackage.version).toBe('7.1.0-dev.20260822.1');
    expect(API).toBeTypeOf('function');
    expect(API.prototype.updateSnapshot).toBeTypeOf('function');
    expect(API.prototype.close).toBeTypeOf('function');
    expect(API.prototype.getTimingInfo).toBeTypeOf('function');
    expect(SyntaxKind.SourceFile).toBeTypeOf('number');
  });
});
