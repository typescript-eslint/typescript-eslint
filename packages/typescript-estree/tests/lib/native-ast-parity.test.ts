import fs from 'node:fs';

import { parseAndGenerateServices } from '../../src/index.js';
import {
  isolateNativeBackend,
  nativeFilePath as filePath,
  nativeFixtures,
  nativePath,
} from './nativeTestUtils';

const tsxFilePath = nativePath(nativeFixtures, 'component.tsx');
const jsFilePath = nativePath(nativeFixtures, 'jsdoc.js');

isolateNativeBackend();

function convert(
  code: string,
  native: boolean,
  convertedFilePath = filePath,
): unknown {
  const { ast } = parseAndGenerateServices(code, {
    comment: true,
    filePath: convertedFilePath,
    jsx: convertedFilePath.endsWith('.tsx'),
    loc: true,
    range: true,
    tokens: true,
    ...(native
      ? { projectService: { EXPERIMENTAL_backend: 'native' as const } }
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
    'nested namespaces',
    'namespace A.B.C { export type Z = 1; }\nnamespace A.B { export const b = 1; }',
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
    'operators and keyword tokens',
    'declare let v: number;\n+v;\n-v;\n!v;\n~v;\n++v;\n--v;\nv++;\nv--;\ntype K = keyof object;\nimport.meta;',
  ],
  [
    // An interface's `extends` is left out: native models it as a
    // `TypeReference` where classic uses an `ExpressionWithTypeArguments`.
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

    expect(convert(code, true, tsxFilePath)).toStrictEqual(
      convert(code, false, tsxFilePath),
    );
  });
});

describe('JavaScript with JSDoc types', () => {
  it('converts identically on both backends', () => {
    const code = fs.readFileSync(jsFilePath, 'utf8');

    expect(convert(code, true, jsFilePath)).toStrictEqual(
      convert(code, false, jsFilePath),
    );
  });
});
