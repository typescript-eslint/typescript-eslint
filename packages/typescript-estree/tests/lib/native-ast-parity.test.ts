import path from 'node:path';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'file.ts');

afterEach(clearCaches);

/**
 * The ESTree conversion reads the TypeScript AST through property names, node
 * kinds, and node flags — all three of which the native compiler numbers or
 * spells differently. Converting the same source with both backends and
 * comparing the result is what keeps those translations honest.
 */
function convert(code: string, native: boolean): unknown {
  const { ast } = parseAndGenerateServices(code, {
    comment: true,
    filePath,
    loc: true,
    range: true,
    tokens: true,
    ...(native
      ? { projectService: { backend: 'native' as const } }
      : { project: false }),
  });
  return JSON.parse(JSON.stringify(ast));
}

describe.for([
  [
    'module declarations',
    'declare namespace N { const a: number; }\ndeclare module "m" { const a: number; }\ndeclare global { const a: number; }',
  ],
  [
    'type parameter defaults',
    'declare function f<T = number, U extends string = "a">(v: T, u: U): T;',
  ],
  [
    'conditional and mapped types',
    'type C<T> = T extends string ? number : boolean;\ntype M<T> = { readonly [K in keyof T]?: T[K] };',
  ],
  [
    'classes and decorators',
    'declare const d: any;\n@d\nclass C { @d accessor x = 1; #p = 2; static s?: string; constructor(private readonly a: number) {} }',
  ],
  ['enums', 'const enum A { X = 1 }\nenum B { Y = "y" }\ndeclare enum C { Z }'],
  [
    'optional chains and assertions',
    'declare const o: { a?: { b(): number } };\no?.a?.b?.();\nconst n = o!.a as { b(): number } satisfies object;',
  ],
  [
    'generics and overloads',
    'function g(a: string): string;\nfunction g(a: number): number;\nfunction g(a: unknown) { return a; }',
  ],
  [
    'template literal types',
    'type T = `a${string}b`;\ntype U = Uppercase<"x">;\ntype V = keyof { a: 1 };\ntype W = { a: 1 }["a"];',
  ],
  [
    'imports and exports',
    'import type { A } from "./dependency";\nimport * as ns from "./dependency";\nexport type { A };\nexport * from "./dependency";',
  ],
  [
    'abstract and index signatures',
    'abstract class D { abstract m(): void; [key: string]: unknown; }\ninterface I { readonly [k: number]: string; new (): I; (): void }',
  ],
])('%s', ([, code]) => {
  it('converts identically on both backends', () => {
    expect(convert(code, true)).toStrictEqual(convert(code, false));
  });
});
