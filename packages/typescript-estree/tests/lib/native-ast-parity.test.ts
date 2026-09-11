import path from 'node:path';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'file.ts');
const tsxFilePath = path.join(fixtures, 'component.tsx');

beforeEach(() => {
  // These tests select a backend per call, so the blanket environment switch
  // has to stay out of the way.
  vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_BACKEND', 'false');
});

afterEach(clearCaches);

/**
 * The ESTree conversion reads the TypeScript AST through property names, node
 * kinds, and node flags — all three of which the native compiler numbers or
 * spells differently. Converting the same source with both backends and
 * comparing the result is what keeps those translations honest.
 */
function convert(code: string, native: boolean, tsx = false): unknown {
  const { ast } = parseAndGenerateServices(code, {
    comment: true,
    filePath: tsx ? tsxFilePath : filePath,
    jsx: tsx,
    loc: true,
    range: true,
    tokens: true,
    ...(native
      ? { projectService: { backend: 'native' as const } }
      : { project: false }),
  });
  return structuredClone(ast);
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
  [
    // Unary, update, and keyword tokens are read as raw `SyntaxKind` numbers,
    // which the two compilers number differently.
    'operators and keyword tokens',
    'declare let v: number;\n+v;\n-v;\n!v;\n~v;\n++v;\n--v;\nv++;\nv--;\ntype K = keyof object;\nimport.meta;',
  ],
  [
    // An interface's `extends` is left out: the native compiler models it as a
    // `TypeReference` with a `typeName`, where classic uses an
    // `ExpressionWithTypeArguments` with an `expression`. Translating that
    // needs a node kind change, not just a property rename.
    'classes with heritage clauses',
    'declare class Base {}\nclass Derived extends Base {}',
  ],
])('%s', ([, code]) => {
  it('converts identically on both backends', () => {
    expect(convert(code, true)).toStrictEqual(convert(code, false));
  });
});

describe('TSX', () => {
  it('converts identically on both backends', () => {
    const code =
      'declare const Component: (props: { a: number }) => null;\nconst element = <Component a={1} />;\nconst fragment = <><Component a={2} /></>;';

    expect(convert(code, true, true)).toStrictEqual(convert(code, false, true));
  });
});
