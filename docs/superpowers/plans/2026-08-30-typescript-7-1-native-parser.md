# TypeScript 7.1 Native Parser Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in TypeScript 7.1 native project-service backend that produces ESTree, exposes native parser services, and runs four representative typed rules without changing the default TypeScript 6 path.

**Architecture:** `parserOptions.projectService: { backend: 'native' }` selects a new backend in `typescript-estree`. A long-lived synchronous native API client maintains file overlays and snapshots, a scoped adapter presents native AST nodes to the existing converter, and separately discriminated native parser services keep native objects out of the classic `ts.Program` contract. Native-specific rule branches consume those services directly.

**Tech Stack:** TypeScript, TypeScript 7.1 `@typescript/native/unstable/sync`, ESLint parser services, Vitest, Nx, pnpm, API Extractor.

---

## File structure

New native-backend files belong under `packages/typescript-estree/src/native/`:

- `createNativeProjectService.ts`: owns the API process, file overlays, snapshots, project lookup, metrics, and disposal.
- `nativeNodeAdapter.ts`: translates native AST kinds and node operations for the existing converter and unwraps node maps.
- `createNativeParserServices.ts`: creates the discriminated services object and wraps native node maps.
- `parseAndGenerateNativeServices.ts`: coordinates project retrieval, conversion, diagnostics, and services.
- `types.ts`: internal context and public service aliases used by the preceding files.
- `index.ts`: exports only the native entrypoints needed by existing parser code.

Native rule code belongs under `packages/eslint-plugin/src/rules/native/`. Each existing rule keeps its classic implementation unchanged and dispatches to one native implementation:

- `no-unsafe-unary-minus.ts`
- `no-unsafe-argument.ts`
- `await-thenable.ts`
- `no-deprecated.ts`
- `nativeTypeUtils.ts`: only the native type predicates shared by at least two of those rules.
- `NativeFunctionSignature.ts`: parameter consumption for native call signatures.
- `isNativeUnsafeAssignment.ts`: recursive generic-argument comparison for `no-unsafe-argument`.

Do not add a generic classic/native compiler facade. The prototype is intended to expose incompatibilities, not conceal them.

### Task 1: Pin and validate the TypeScript 7.1 preview API

**Files:**

- Modify: `pnpm-workspace.yaml:28`
- Modify: `pnpm-lock.yaml`
- Create: `packages/typescript-estree/tests/lib/native-api.test.ts`

- [ ] **Step 1: Write the failing API smoke test**

```ts
import { API } from '@typescript/native/unstable/sync';
import { SyntaxKind } from '@typescript/native/unstable/ast';
import { describe, expect, it } from 'vitest';

describe('TypeScript native API', () => {
  it('exports the synchronous API and AST kinds', () => {
    expect(API).toBeTypeOf('function');
    expect(SyntaxKind.SourceFile).toBeTypeOf('number');
  });
});
```

- [ ] **Step 2: Run the smoke test against the current 7.0 alias**

Run: `pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-api.test.ts`

Expected: FAIL because `@typescript/native@7.0.2` does not export `./unstable/sync`.

- [ ] **Step 3: Pin the oldest preview used by this prototype**

Change the catalog entry to an exact, release-age-compliant build:

```yaml
'@typescript/native': 'npm:typescript@7.1.0-dev.20260822.1'
```

Run: `pnpm install`

Expected: lockfile resolves `@typescript/native` to `typescript@7.1.0-dev.20260822.1` while the `typescript` override remains `@typescript/typescript6@6.0.2`.

- [ ] **Step 4: Run API and package checks**

Run:

```bash
pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-api.test.ts
pnpm nx typecheck typescript-estree
pnpm nx attw-check typescript-estree
```

Expected: all PASS. The smoke test imports native types only from test code; Task 2 declares the dependency before exposing those types publicly.

- [ ] **Step 5: Commit the pinned API contract**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml packages/typescript-estree/tests/lib/native-api.test.ts
git commit -m "chore: pin TypeScript 7.1 native API preview"
```

### Task 2: Add the opt-in option and separate parser-services types

**Files:**

- Modify: `packages/types/src/parser-options.ts:34-65`
- Modify: `packages/typescript-estree/src/parser-options.ts:247-276`
- Modify: `packages/typescript-estree/src/index.ts:9-18`
- Modify: `packages/typescript-estree/package.json:54-79`
- Modify: `packages/utils/src/ts-estree.ts`
- Test: `packages/typescript-estree/tests/lib/createParseSettings.test.ts`
- Test: `packages/utils/tests/eslint-utils/getParserServices.test.ts`

- [ ] **Step 1: Add type tests for backend discrimination**

Add compile-time assertions alongside parser option tests:

```ts
const nativeOptions = {
  projectService: { backend: 'native' },
} satisfies ParserOptions;

expect(nativeOptions.projectService.backend).toBe('native');
```

Add a parser-services assertion:

```ts
declare const services: ParserServices;
if (services.backend === 'native') {
  expectTypeOf(services.native.project).toMatchTypeOf<NativeProject>();
} else if (services.program) {
  expectTypeOf(services.program).toMatchTypeOf<ts.Program>();
}
```

- [ ] **Step 2: Run typecheck to verify the types are absent**

Run: `pnpm nx typecheck typescript-estree utils`

Expected: FAIL because `backend`, `NativeParserServices`, and `services.native` do not exist.

- [ ] **Step 3: Define the option and discriminated services**

Extend `ProjectServiceOptions`:

```ts
export interface ProjectServiceOptions {
  backend?: 'native';
  allowDefaultProject?: string[];
  defaultProject?: string;
  loadTypeScriptPlugins?: boolean;
  maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING?: number;
}
```

In `typescript-estree/src/parser-options.ts`, import native types only as types and add:

```ts
import type {
  Checker as NativeChecker,
  Program as NativeProgram,
  Project as NativeProject,
  Signature as NativeSignature,
  Symbol as NativeSymbol,
  Type as NativeType,
} from '@typescript/native/unstable/sync';
import type { Node as NativeNode } from '@typescript/native/unstable/ast';

export interface NativeParserServices {
  backend: 'native';
  emitDecoratorMetadata: boolean;
  experimentalDecorators: boolean;
  isolatedDeclarations: boolean;
  native: {
    checker: NativeChecker;
    program: NativeProgram;
    project: NativeProject;
  };
  esTreeNodeToTSNodeMap: ParserWeakMap<TSESTree.Node, NativeNode>;
  tsNodeToESTreeNodeMap: ParserWeakMap<NativeNode, TSESTree.Node>;
  getContextualType(node: TSESTree.Expression): NativeType | undefined;
  getResolvedSignature(
    node: TSESTree.CallExpression | TSESTree.NewExpression,
  ): NativeSignature;
  getSymbolAtLocation(node: TSESTree.Node): NativeSymbol | undefined;
  getTypeAtLocation(node: TSESTree.Node): NativeType;
  getTypesAtLocations(nodes: readonly TSESTree.Node[]): NativeType[];
}

export type ParserServices =
  | NativeParserServices
  | ParserServicesWithoutTypeInformation
  | ParserServicesWithTypeInformation;
```

Add `backend: 'typescript'` to both classic service variants. This makes all three branches explicit and avoids detecting a backend from object shape.

- [ ] **Step 4: Declare the optional native type dependency**

Move `@typescript/native` from `devDependencies` to both `devDependencies` and an optional peer so emitted declarations are valid without forcing normal users to install it:

```json
"peerDependencies": {
  "@typescript/native": "npm:typescript@>=7.1.0-0",
  "typescript": ">=4.8.4 <6.1.0"
},
"peerDependenciesMeta": {
  "@typescript/native": {
    "optional": true
  }
}
```

Keep the dev dependency for monorepo builds. Validate that pnpm and package publication accept an aliased optional peer; do not replace it with a normal dependency.

- [ ] **Step 5: Export the native types through existing type barrels**

Export `NativeParserServices` from `typescript-estree/src/index.ts` and let `packages/utils/src/ts-estree.ts` re-export it through the existing wildcard/type export path. Do not export `API`, `Snapshot`, or lifecycle functions.

- [ ] **Step 6: Run type and packaging checks**

Run:

```bash
pnpm nx typecheck typescript-estree utils parser
pnpm nx build typescript-estree
pnpm nx attw-check typescript-estree
```

Expected: all PASS and generated declarations reference the optional `@typescript/native` peer, not the classic `typescript` package.

- [ ] **Step 7: Commit the public opt-in types**

```bash
git add packages/types/src/parser-options.ts packages/typescript-estree/src/parser-options.ts packages/typescript-estree/src/index.ts packages/typescript-estree/package.json packages/utils/src/ts-estree.ts packages/typescript-estree/tests/lib/createParseSettings.test.ts packages/utils/tests/eslint-utils/getParserServices.test.ts pnpm-lock.yaml
git commit -m "feat(parser): define native project service contracts"
```

### Task 3: Validate native configuration before process startup

**Files:**

- Modify: `packages/typescript-estree/src/parseSettings/index.ts`
- Modify: `packages/typescript-estree/src/parseSettings/createParseSettings.ts:140-225`
- Test: `packages/typescript-estree/tests/lib/createParseSettings.test.ts`

- [ ] **Step 1: Add failing configuration tests**

Test these exact invalid combinations:

```ts
it.each([
  [{ project: './tsconfig.json' }, 'parserOptions.project'],
  [{ programs: [{} as ts.Program] }, 'parserOptions.programs'],
  [
    { projectService: { backend: 'native', allowDefaultProject: ['*.ts'] } },
    'allowDefaultProject',
  ],
  [
    {
      projectService: {
        backend: 'native',
        defaultProject: 'tsconfig.eslint.json',
      },
    },
    'defaultProject',
  ],
  [
    { projectService: { backend: 'native', loadTypeScriptPlugins: true } },
    'loadTypeScriptPlugins',
  ],
  [{ extraFileExtensions: ['.vue'] }, 'extraFileExtensions'],
])('rejects unsupported native options', (extra, expected) => {
  expect(() =>
    createParseSettings('const value = 1;', {
      filePath: '/project/file.ts',
      projectService: { backend: 'native' },
      ...extra,
    }),
  ).toThrow(expected);
});
```

Also spy on the native service factory and assert it has not run when validation throws.

Add a mocked Node.js 20 case that expects `The experimental native project service requires Node.js 22 or newer.` and a control case proving the classic backend still initializes under the same mocked version.

- [ ] **Step 2: Run tests to verify validation is missing**

Run: `pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/createParseSettings.test.ts`

Expected: FAIL because native options currently enter the classic project-service path.

- [ ] **Step 3: Separate native and classic settings**

Add `nativeProjectService` to `ParseSettings`, initially containing the validated options marker. Determine native selection only from:

```ts
const nativeProjectServiceOptions =
  typeof tsestreeOptions.projectService === 'object' &&
  tsestreeOptions.projectService.backend === 'native'
    ? tsestreeOptions.projectService
    : undefined;
```

Validate all unsupported combinations before calling either project-service factory. Set classic `projectService` only when `nativeProjectServiceOptions` is absent. Exclude `backend` before forwarding classic options.

When native mode is selected, check `process.versions.node` before loading the ESM native package. Require Node.js 22 or newer and report `The experimental native project service requires Node.js 22 or newer.` Keep the package's normal engine range unchanged because the default TypeScript 6 backend does not load native modules.

- [ ] **Step 4: Run parse-settings tests**

Run: `pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/createParseSettings.test.ts`

Expected: PASS, including existing classic `projectService` cases.

- [ ] **Step 5: Commit configuration routing**

```bash
git add packages/typescript-estree/src/parseSettings packages/typescript-estree/tests/lib/createParseSettings.test.ts
git commit -m "feat(typescript-estree): route native project service options"
```

### Task 4: Implement native process and snapshot lifecycle

**Files:**

- Create: `packages/typescript-estree/src/native/types.ts`
- Create: `packages/typescript-estree/src/native/createNativeProjectService.ts`
- Create: `packages/typescript-estree/src/native/index.ts`
- Modify: `packages/typescript-estree/src/clear-caches.ts`
- Create: `packages/typescript-estree/tests/lib/native-project-service.test.ts`
- Create: `packages/typescript-estree/tests/fixtures/nativeProject/file.ts`
- Create: `packages/typescript-estree/tests/fixtures/nativeProject/dependency.ts`
- Create: `packages/typescript-estree/tests/fixtures/nativeProject/tsconfig.json`

- [ ] **Step 1: Add lifecycle tests**

Test one process owner through public test-only methods:

```ts
it('reuses projects and updates unsaved text', () => {
  const service = createNativeProjectService({ collectTiming: true });
  const first = service.openFile(filePath, 'export const value = 1;');
  const second = service.openFile(filePath, 'export const value = "updated";');

  expect(second.project.configFileName).toBe(first.project.configFileName);
  expect(second.sourceFile.text).toContain('"updated"');
  expect(first.snapshot.isDisposed()).toBe(true);

  service.close();
  expect(second.snapshot.isDisposed()).toBe(true);
});
```

Add cases for a dependency file change, a created file, a deleted file notification, two files belonging to different TSConfigs, a missing TSConfig/default project, a TSConfig with project references, a TSConfig with plugins, invalid native process startup, and use after `close()`. Project references and plugins must produce explicit unsupported-feature errors after project loading.

- [ ] **Step 2: Run lifecycle tests to verify the factory is absent**

Run: `pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-project-service.test.ts`

Expected: FAIL because `createNativeProjectService` does not exist.

- [ ] **Step 3: Implement the process owner**

Use one mutable overlay map and TypeScript's filesystem fallback behavior:

```ts
const overlays = new Map<string, string>();
const api = new API({
  collectTiming,
  cwd: process.cwd(),
  fs: {
    fileExists: fileName => (overlays.has(fileName) ? true : undefined),
    readFile: fileName => overlays.get(fileName),
  },
});
```

Wrap API construction errors with `Failed to start the TypeScript native project service:` while preserving the original error as the cause. Add an internal `updateFiles({ changed, created, deleted })` operation that disposes the previous snapshot and forwards normalized absolute paths through `fileChanges`; use it for the lifecycle tests and future watcher integration.

`openFile(filePath, code)` must:

1. Reject calls after `close()`.
2. Resolve and normalize `filePath`, then store the current text in `overlays` under that absolute path.
3. Dispose the previous snapshot.
4. Call `api.updateSnapshot()` with `openFiles: [filePath]` on first open and `fileChanges.changed: [filePath]` thereafter.
5. Retrieve `snapshot.getDefaultProjectForFile(filePath)`.
6. Retrieve `project.program.getSourceFile(filePath)`.
7. Throw a located configuration error if either lookup fails.
8. Reject `project.parsedCommandLine.projectReferences` and `project.program.getCompilerOptions().plugins` when non-empty, with errors naming the unsupported TSConfig feature.
9. Return `{ checker, program, project, snapshot, sourceFile }`.

Track opened files so `close()` can close them, dispose the last snapshot, call `api.close()`, clear overlays, and become idempotent.

- [ ] **Step 4: Integrate cache clearing**

Expose `clearNativeProjectService()` from the native index. It closes and drops the singleton. Call it from `clearCaches()` after clearing the classic project service.

- [ ] **Step 5: Run lifecycle and cache tests**

Run:

```bash
pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-project-service.test.ts
pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/semanticInfo.test.ts
```

Expected: PASS; no native compiler subprocess remains after each test.

- [ ] **Step 6: Commit lifecycle management**

```bash
git add packages/typescript-estree/src/native packages/typescript-estree/src/clear-caches.ts packages/typescript-estree/tests/lib/native-project-service.test.ts packages/typescript-estree/tests/fixtures/nativeProject
git commit -m "feat(typescript-estree): manage native project snapshots"
```

### Task 5: Adapt native AST nodes to the existing converter

**Files:**

- Create: `packages/typescript-estree/src/native/nativeNodeAdapter.ts`
- Create: `packages/typescript-estree/tests/lib/native-node-adapter.test.ts`
- Modify: `packages/typescript-estree/tests/fixtures/nativeProject/file.ts`

- [ ] **Step 1: Add AST parity tests**

Parse the same project file through classic TypeScript and the native service. Convert each source file with `astConverter`, then compare a normalized result that omits parser-service object identity:

```ts
expect(nativeResult.estree).toEqual(classicResult.estree);
expect(nativeResult.estree.tokens).toEqual(classicResult.estree.tokens);
expect(nativeResult.estree.comments).toEqual(classicResult.estree.comments);
```

Cover imports, JSX, decorators, `satisfies`, generic arrows, optional chains, comments, regex literals, template literals, and one syntax error. Assert every visited ESTree node maps back to the original native node rather than the adapter proxy.

- [ ] **Step 2: Run parity tests to verify raw native nodes are incompatible**

Run: `pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-node-adapter.test.ts`

Expected: FAIL on differing `SyntaxKind` values or a missing classic node operation.

- [ ] **Step 3: Implement stable kind translation**

Create maps by enum name, never by numeric value:

```ts
const nativeToClassicKind = new Map<NativeSyntaxKind, ts.SyntaxKind>();

for (const [name, value] of Object.entries(NativeSyntaxKind)) {
  if (typeof value === 'number') {
    const classic = ts.SyntaxKind[name as keyof typeof ts.SyntaxKind];
    if (typeof classic === 'number') {
      nativeToClassicKind.set(value, classic);
    }
  }
}
```

Throw `Unsupported native SyntaxKind: <name> (<value>)` if the converter encounters an unmapped kind.

- [ ] **Step 4: Implement cached node and array adapters**

Use `WeakMap<NativeNode, ts.Node>` and `WeakMap<ts.Node, NativeNode>`. The proxy must:

- translate `kind`;
- recursively adapt node-valued properties, `parent`, and node arrays;
- preserve `pos`, `end`, and `flags`; use `ts.TransformFlags.None` and `ts.ModifierFlags.None` when the native node does not provide the corresponding converter cache;
- delegate `getStart`, `getFullStart`, `getEnd`, `getWidth`, `getFullWidth`, `getText`, `getFullText`, and `getSourceFile`;
- adapt callbacks passed to `forEachChild`;
- preserve `NodeArray.pos`, `NodeArray.end`, `hasTrailingComma`, and `transformFlags`;
- synthesize token children from the source text with classic TypeScript's scanner when `getChildren()` requests tokens absent from the native tree.

Expose:

```ts
export interface NativeNodeAdapter {
  adaptSourceFile(sourceFile: NativeSourceFile): ts.SourceFile;
  unwrapNode(node: ts.Node): NativeNode;
  wrapNode(node: NativeNode): ts.Node;
}
```

- [ ] **Step 5: Run parity tests incrementally**

Run the single fixture after each missing operation is added:

`pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-node-adapter.test.ts`

Expected final result: PASS without changing snapshots produced by the classic converter.

- [ ] **Step 6: Commit the AST adapter**

```bash
git add packages/typescript-estree/src/native/nativeNodeAdapter.ts packages/typescript-estree/tests/lib/native-node-adapter.test.ts packages/typescript-estree/tests/fixtures/nativeProject/file.ts
git commit -m "feat(typescript-estree): adapt native AST for ESTree conversion"
```

### Task 6: Return native parser services end to end

**Files:**

- Create: `packages/typescript-estree/src/native/createNativeParserServices.ts`
- Create: `packages/typescript-estree/src/native/parseAndGenerateNativeServices.ts`
- Modify: `packages/typescript-estree/src/native/index.ts`
- Modify: `packages/typescript-estree/src/parser.ts:155-270`
- Modify: `packages/typescript-estree/src/createParserServices.ts`
- Modify: `packages/typescript-estree/src/semantic-or-syntactic-errors.ts`
- Test: `packages/typescript-estree/tests/lib/semanticInfo.test.ts`
- Test: `packages/typescript-estree/tests/lib/native-project-service.test.ts`

- [ ] **Step 1: Add failing end-to-end parser tests**

```ts
const result = parseAndGenerateServices('const value: string = 1;', {
  filePath,
  projectService: { backend: 'native' },
});

expect(result.services.backend).toBe('native');
if (result.services.backend === 'native') {
  expect(result.services.native.project.configFileName).toMatch(
    /tsconfig\.json$/,
  );
  expect(
    result.services.getTypeAtLocation(result.ast.body[0]).flags,
  ).toBeTypeOf('number');
  expect(
    result.services.esTreeNodeToTSNodeMap.get(result.ast.body[0]).kind,
  ).toBeTypeOf('number');
}
```

Add a second parse of the same file with changed text and assert the returned native node and type come from the new snapshot. Add `errorOnTypeScriptSyntacticAndSemanticIssues` coverage using native syntactic and semantic diagnostics.

- [ ] **Step 2: Run tests to verify native parsing is not routed**

Run: `pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/semanticInfo.test.ts`

Expected: FAIL because `parseAndGenerateServices` does not call the native backend.

- [ ] **Step 3: Implement native service node maps**

Wrap converter maps instead of copying non-iterable `WeakMap`s:

```ts
const esTreeNodeToTSNodeMap = {
  get: (node: TSESTree.Node) =>
    adapter.unwrapNode(astMaps.esTreeNodeToTSNodeMap.get(node)),
  has: (node: unknown) => astMaps.esTreeNodeToTSNodeMap.has(node),
};

const tsNodeToESTreeNodeMap = {
  get: (node: NativeNode) =>
    astMaps.tsNodeToESTreeNodeMap.get(adapter.wrapNode(node)),
  has: (node: unknown) =>
    isNativeNode(node) &&
    astMaps.tsNodeToESTreeNodeMap.has(adapter.wrapNode(node)),
};
```

Create convenience methods from `project.checker`. Set compiler-option booleans from `project.program.getCompilerOptions()`.

Implement `getTypesAtLocations(nodes)` by mapping the ESTree nodes to native nodes and calling the checker's array overload once:

```ts
getTypesAtLocations: nodes =>
  checker.getTypeAtLocation(
    nodes.map(node => esTreeNodeToTSNodeMap.get(node)),
  ),
```

- [ ] **Step 4: Implement the native parse coordinator**

`parseAndGenerateNativeServices` must open/update the file, adapt its source file, run the existing converter, translate native diagnostics through `convertError`, and return native services. Ensure the snapshot remains alive after parsing so rules can use remote objects; Task 4's next parse or `clearCaches()` disposes it.

- [ ] **Step 5: Route only the explicit native option**

Immediately after `createParseSettings`, branch:

```ts
if (parseSettings.nativeProjectService) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { parseAndGenerateNativeServices } =
    require('./native') as typeof import('./native');
  return parseAndGenerateNativeServices(parseSettings);
}
```

This lazy load is required: the native package is ESM and optional, while the default parser remains CommonJS-compatible on the repository's existing Node.js range. Add `backend: 'typescript'` in `createParserServices` for both classic branches. Do not modify classic program selection or AST conversion.

- [ ] **Step 6: Run parser regression tests**

Run:

```bash
pnpm vitest run --project typescript-estree packages/typescript-estree/tests/lib/native-project-service.test.ts packages/typescript-estree/tests/lib/semanticInfo.test.ts
pnpm nx test typescript-estree
pnpm nx typecheck typescript-estree parser
```

Expected: all PASS.

- [ ] **Step 7: Commit end-to-end parser services**

```bash
git add packages/typescript-estree/src packages/typescript-estree/tests/lib
git commit -m "feat(typescript-estree): return native parser services"
```

### Task 7: Add native service retrieval for rules

**Files:**

- Create: `packages/utils/src/eslint-utils/getNativeParserServices.ts`
- Modify: `packages/utils/src/eslint-utils/getParserServices.ts`
- Modify: `packages/utils/src/eslint-utils/index.ts`
- Modify: `packages/eslint-plugin/src/util/index.ts`
- Create: `packages/utils/tests/eslint-utils/getNativeParserServices.test.ts`
- Modify: `packages/utils/tests/eslint-utils/getParserServices.test.ts`

- [ ] **Step 1: Add service retrieval tests**

Assert these outcomes:

```ts
expect(() => getParserServices(nativeContext)).toThrow(
  'This rule requires classic TypeScript parser services, but the experimental native backend is enabled.',
);
expect(getNativeParserServices(nativeContext)).toBe(nativeServices);
expect(() => getNativeParserServices(classicContext)).toThrow(
  'This rule requires experimental native parser services.',
);
```

- [ ] **Step 2: Run tests to verify the native getter is absent**

Run: `pnpm vitest run --project utils packages/utils/tests/eslint-utils/getParserServices.test.ts packages/utils/tests/eslint-utils/getNativeParserServices.test.ts`

Expected: FAIL because `getNativeParserServices` is not exported.

- [ ] **Step 3: Implement strict backend getters**

`getNativeParserServices` performs the same parser identity and node-map validation as `getParserServices`, then requires `backend === 'native'`. Update `getParserServices` to reject `backend === 'native'` before testing `program`. Export the new getter through utils and the eslint-plugin utility barrel.

- [ ] **Step 4: Run utility tests and typechecks**

Run:

```bash
pnpm vitest run --project utils packages/utils/tests/eslint-utils/getParserServices.test.ts packages/utils/tests/eslint-utils/getNativeParserServices.test.ts
pnpm nx typecheck utils eslint-plugin
```

Expected: PASS.

- [ ] **Step 5: Commit native service retrieval**

```bash
git add packages/utils packages/eslint-plugin/src/util/index.ts
git commit -m "feat(utils): retrieve native parser services"
```

### Task 8: Port `no-unsafe-unary-minus`

**Files:**

- Create: `packages/eslint-plugin/src/rules/native/nativeTypeUtils.ts`
- Create: `packages/eslint-plugin/src/rules/native/no-unsafe-unary-minus.ts`
- Modify: `packages/eslint-plugin/src/rules/no-unsafe-unary-minus.ts`
- Modify: `packages/eslint-plugin/tests/rules/no-unsafe-unary-minus.test.ts`
- Modify: `packages/eslint-plugin/tests/RuleTester.ts`
- Modify: `packages/eslint-plugin/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add a native RuleTester helper and parity cases**

Create `createRuleTesterWithNativeTypes()` by cloning the existing typed tester config and changing only:

```ts
languageOptions: {
  parserOptions: {
    projectService: { backend: 'native' },
    tsconfigRootDir: rootDir,
  },
}
```

Run the existing valid and invalid `no-unsafe-unary-minus` cases through both testers. Keep one logical assertion per case and preserve existing expected message IDs.

- [ ] **Step 2: Run the native rule cases to verify classic service rejection**

Run: `pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/no-unsafe-unary-minus.test.ts`

Expected: FAIL with the classic-services/native-backend error from Task 7.

- [ ] **Step 3: Implement shared native type primitives**

In `nativeTypeUtils.ts`, add only:

```ts
export const isTypeFlagSet = (type: NativeType, flags: TypeFlags): boolean =>
  (type.flags & flags) !== 0;

export const unionConstituents = (type: NativeType): readonly NativeType[] =>
  type.isUnionType() ? (type.getTypes() ?? [type]) : [type];

export const getConstrainedTypeAtLocation = (
  services: NativeParserServices,
  node: TSESTree.Node,
): NativeType => {
  const type = services.getTypeAtLocation(node);
  return services.native.checker.getBaseConstraintOfType(type) ?? type;
};
```

- [ ] **Step 4: Implement the native rule branch**

Move no classic logic. At rule creation, inspect `context.sourceCode.parserServices.backend`; lazily require and dispatch to the native listener factory only for `'native'`. Do not statically import a native rule module from a classic rule module. The native implementation mirrors the existing unary-expression guard and uses native `TypeFlags`, `unionConstituents`, `getConstrainedTypeAtLocation`, and `checker.typeToString`.

- [ ] **Step 5: Declare the eslint-plugin native runtime peer**

Add the same optional `@typescript/native: npm:typescript@>=7.1.0-0` peer and peer metadata used by `typescript-estree`. Keep the catalog dev dependency for tests. This declaration is required because native rule modules import runtime enums from the alias.

- [ ] **Step 6: Run parity and classic regression tests**

Run:

```bash
pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/no-unsafe-unary-minus.test.ts
pnpm nx typecheck eslint-plugin
```

Expected: both backends PASS the same cases.

- [ ] **Step 7: Commit the first native rule**

```bash
git add packages/eslint-plugin/src/rules/native packages/eslint-plugin/src/rules/no-unsafe-unary-minus.ts packages/eslint-plugin/tests/rules/no-unsafe-unary-minus.test.ts packages/eslint-plugin/tests/RuleTester.ts packages/eslint-plugin/package.json pnpm-lock.yaml
git commit -m "feat(eslint-plugin): run no-unsafe-unary-minus natively"
```

### Task 9: Port `no-unsafe-argument`

**Files:**

- Create: `packages/eslint-plugin/src/rules/native/NativeFunctionSignature.ts`
- Create: `packages/eslint-plugin/src/rules/native/isNativeUnsafeAssignment.ts`
- Create: `packages/eslint-plugin/src/rules/native/no-unsafe-argument.ts`
- Modify: `packages/eslint-plugin/src/rules/no-unsafe-argument.ts`
- Modify: `packages/eslint-plugin/tests/rules/no-unsafe-argument.test.ts`

- [ ] **Step 1: Add representative native parity cases**

Add native runs for plain `any`, `any[]` spread, tuple spread, safe `unknown`, generic `Set<any>` to `Set<string>`, and the empty `new Map()` exemption. Reuse the existing code and expected message IDs rather than creating snapshots.

- [ ] **Step 2: Run the native cases to verify the branch is absent**

Run: `pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/no-unsafe-argument.test.ts`

Expected: FAIL with the classic-services/native-backend error.

- [ ] **Step 3: Port function-signature consumption**

Implement `NativeFunctionSignature` with native APIs:

- `checker.getResolvedSignature(callNode)` and `checker.isUnknownSignature(signature)`;
- `signature.getParameters()`;
- `checker.getTypeOfSymbolAtLocation(parameter, callNode)`;
- `parameter.declarations[0]?.resolve(project)` for rest-parameter detection;
- `checker.isTupleType`, `checker.getTypeArguments`, and `type.getNumberIndexType()` for rest types.

Keep the existing `getNextParameterType()` and `consumeRemainingArguments()` behavior exactly.

- [ ] **Step 4: Port recursive unsafe assignment**

Use native type methods rather than classic fields:

```ts
if (isTypeFlagSet(sender, TypeFlags.Any)) {
  if (!isTypeFlagSet(receiver, TypeFlags.Any | TypeFlags.Unknown)) {
    return { receiver, sender };
  }
}

if (sender.isTypeReference() && receiver.isTypeReference()) {
  if (sender.getTarget().id !== receiver.getTarget().id) {
    return false;
  }
  const senderArgs = checker.getTypeArguments(sender);
  const receiverArgs = checker.getTypeArguments(receiver);
  for (let index = 0; index < senderArgs.length; index += 1) {
    if (
      isNativeUnsafeAssignmentWorker(
        senderArgs[index],
        receiverArgs[index],
        checker,
        senderNode,
        visited,
      )
    ) {
      return { receiver, sender };
    }
  }
}
```

Preserve the empty `new Map()` exemption using the ESTree sender node.

- [ ] **Step 5: Implement and dispatch the native rule**

Mirror the existing listener and reporting logic with `NativeFunctionSignature`, native tuple/array predicates, `ElementFlags.Variable`, and native type formatting. Keep classic imports and helpers out of the native module. Lazily require the native listener from the classic rule only after detecting the native backend.

- [ ] **Step 6: Run focused and utility regression tests**

Run:

```bash
pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/no-unsafe-argument.test.ts
pnpm vitest run --project type-utils packages/type-utils/tests/isUnsafeAssignment.test.ts
pnpm nx typecheck eslint-plugin
```

Expected: PASS for both backends; classic `isUnsafeAssignment` remains unchanged.

- [ ] **Step 7: Commit unsafe-argument support**

```bash
git add packages/eslint-plugin/src/rules/native packages/eslint-plugin/src/rules/no-unsafe-argument.ts packages/eslint-plugin/tests/rules/no-unsafe-argument.test.ts
git commit -m "feat(eslint-plugin): run no-unsafe-argument natively"
```

### Task 10: Port `await-thenable`

**Files:**

- Create: `packages/eslint-plugin/src/rules/native/await-thenable.ts`
- Modify: `packages/eslint-plugin/src/rules/native/nativeTypeUtils.ts`
- Modify: `packages/eslint-plugin/src/rules/await-thenable.ts`
- Modify: `packages/eslint-plugin/tests/rules/await-thenable.test.ts`

- [ ] **Step 1: Add representative native parity cases**

Cover awaiting a number, awaiting a Promise, unconstrained generic input, `for await` over sync and async iterables, Promise aggregator arrays, and `await using`. Preserve suggestion outputs that remove `await`.

- [ ] **Step 2: Run cases to verify the native implementation is absent**

Run: `pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/await-thenable.test.ts`

Expected: FAIL with the native-backend compatibility error.

- [ ] **Step 3: Add native `await` helpers**

Implement native equivalents for only the operations this rule uses:

- constraint lookup through `getBaseConstraintOfType`;
- `Any`, `Unknown`, and `TypeParameter` flag checks;
- Promise-like behavior via `checker.getPropertyOfType(type, 'then')` and callable signatures of that property's type;
- well-known iterator properties via `checker.getPropertyOfType(type, '__@iterator')`, `checker.getPropertyOfType(type, '__@asyncIterator')`, and `checker.getPropertyOfType(type, '__@asyncDispose')`;
- tuple, array-like, number-index, and reference type arguments through native methods.

Do not port `ts-api-utils` or add a generic compatibility wrapper.

- [ ] **Step 4: Implement the native listeners and dispatch**

Reuse ESTree-only helpers such as token removal and source locations. For Promise aggregator array literals, call `services.getTypesAtLocations(elements)` once and zip the resulting types to elements instead of issuing one IPC request per element. Keep native type operations in the native module. Lazily require the native listener from the classic rule only after detecting the native backend. Match existing message IDs, ranges, and suggestions.

- [ ] **Step 5: Run parity tests**

Run:

```bash
pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/await-thenable.test.ts
pnpm nx typecheck eslint-plugin
```

Expected: PASS for native representative cases and the complete classic suite.

- [ ] **Step 6: Commit await support**

```bash
git add packages/eslint-plugin/src/rules/native packages/eslint-plugin/src/rules/await-thenable.ts packages/eslint-plugin/tests/rules/await-thenable.test.ts
git commit -m "feat(eslint-plugin): run await-thenable natively"
```

### Task 11: Port `no-deprecated`

**Files:**

- Create: `packages/eslint-plugin/src/rules/native/no-deprecated.ts`
- Modify: `packages/eslint-plugin/src/rules/no-deprecated.ts`
- Modify: `packages/eslint-plugin/tests/rules/no-deprecated.test.ts`

- [ ] **Step 1: Add representative native parity cases**

Cover a deprecated variable, aliased import, overloaded deprecated signature, deprecated object property, computed property, shorthand property, and JSX attribute. For the prototype, reject non-empty `allow` options with `The native no-deprecated prototype does not support allow specifiers.` rather than evaluating them incorrectly.

- [ ] **Step 2: Run cases to verify the implementation is absent**

Run: `pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/no-deprecated.test.ts`

Expected: FAIL with the classic-services/native-backend error.

- [ ] **Step 3: Implement native JSDoc and alias traversal**

Use native methods for symbols and native AST helpers for signatures:

```ts
const getSymbolDeprecation = (
  symbol: NativeSymbol | undefined,
): string | undefined => {
  const tag = symbol
    ?.getJsDocTags(checker)
    .find(tag => tag.name === 'deprecated');
  return tag?.text ?? (tag ? '' : undefined);
};

const getSignatureDeprecation = (
  signature: NativeSignature,
): string | undefined => {
  const declaration = signature.declaration?.resolve(project);
  const tag =
    declaration &&
    getJSDocTags(declaration).find(
      tag => tag.kind === SyntaxKind.JSDocDeprecatedTag,
    );
  return tag ? (getTextOfJSDocComment(tag.comment) ?? '') : undefined;
};
```

Traverse aliases with `checker.getAliasedSymbol`, `checker.getImmediateAliasedSymbol`, and symbol IDs. Resolve declaration handles with `handle.resolve(project)` before testing native `SyntaxKind`. Use `checker.getShorthandAssignmentValueSymbol` for shorthand properties, `checker.getResolvedSignature` for calls and constructors, `services.getContextualType` for JSX attributes, and native `Type.getProperty()` for object properties.

- [ ] **Step 4: Implement the native listener and dispatch**

Share only ESTree declaration/import classification and reported-name helpers with the classic file. Keep native symbols and node handles confined to the native module. Lazily require the native listener from the classic rule only after detecting the native backend. Preserve existing message IDs and deprecation reasons.

- [ ] **Step 5: Run parity and JSDoc tests**

Run:

```bash
pnpm vitest run --project eslint-plugin packages/eslint-plugin/tests/rules/no-deprecated.test.ts
pnpm nx typecheck eslint-plugin
```

Expected: native representative cases PASS, the explicit `allow` rejection PASSes, and all classic cases remain green.

- [ ] **Step 6: Commit deprecation support**

```bash
git add packages/eslint-plugin/src/rules/native/no-deprecated.ts packages/eslint-plugin/src/rules/no-deprecated.ts packages/eslint-plugin/tests/rules/no-deprecated.test.ts
git commit -m "feat(eslint-plugin): run no-deprecated natively"
```

### Task 12: Add integration, lifecycle, and cross-platform coverage

**Files:**

- Create: `packages/integration-tests/fixtures/native-project-service/package.json`
- Create: `packages/integration-tests/fixtures/native-project-service/eslint.config.mjs`
- Create: `packages/integration-tests/fixtures/native-project-service/tsconfig.json`
- Create: `packages/integration-tests/fixtures/native-project-service/src/index.ts`
- Create: `packages/integration-tests/fixtures/native-project-service/src/dependency.ts`
- Create: `packages/integration-tests/tests/native-project-service.test.ts`
- Modify: `packages/integration-tests/tools/pack-packages.ts`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add an end-to-end fixture**

Install classic and native TypeScript side by side:

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@7.1.0-dev.20260822.1",
    "typescript": "npm:@typescript/typescript6@6.0.2"
  }
}
```

Configure `projectService: { backend: 'native' }` and enable the four native-compatible rules. The fixture must produce one diagnostic from each rule and include a second imported source file.

- [ ] **Step 2: Add the failing integration test**

Use `nodeIntegrationTest` and assert exact rule IDs and source locations in stderr. Add a script that invokes ESLint twice in one process with changed in-memory text to cover snapshot reuse and unsaved updates.

- [ ] **Step 3: Run the integration test**

Run: `pnpm vitest run --project integration-tests packages/integration-tests/tests/native-project-service.test.ts`

Expected before fixture packaging changes: FAIL because the fixture cannot resolve the native alias or packed parser changes.

- [ ] **Step 4: Package the native dependency and run on all operating systems**

Update fixture packing to preserve its explicit `@typescript/native` alias instead of replacing it with the classic TypeScript catalog entry. Ensure the integration-test job containing this fixture runs on Linux, macOS, and Windows; do not enable all rule tests on Windows.

- [ ] **Step 5: Run integration and existing TS7 rejection tests**

Run:

```bash
pnpm vitest run --project integration-tests packages/integration-tests/tests/native-project-service.test.ts packages/integration-tests/tests/ts7.test.ts
```

Expected: native opt-in PASSes while importing the parser with TypeScript 7.0 installed under its normal package name still emits the existing unsupported-version error.

- [ ] **Step 6: Commit cross-platform integration coverage**

```bash
git add packages/integration-tests .github/workflows/ci.yml
git commit -m "test: cover native project service integration"
```

### Task 13: Add IPC instrumentation and the acceptance benchmark

**Files:**

- Modify: `packages/typescript-estree/src/native/createNativeProjectService.ts`
- Create: `packages/typescript-estree/src/use-at-your-own-risk/nativeMetrics.ts`
- Modify: `packages/typescript-estree/src/use-at-your-own-risk.ts`
- Create: `packages/integration-tests/tools/benchmark-native-project-service.mts`
- Modify: `packages/integration-tests/package.json`
- Create: `packages/integration-tests/tests/native-project-service-metrics.test.ts`

- [ ] **Step 1: Add deterministic metrics tests**

Reset native timing, parse two files, run all four rules, then assert:

```ts
const metrics = getNativeMetrics();
expect(metrics.timing.enabled).toBe(true);
expect(metrics.timing.totals.requestCount).toBeGreaterThan(0);
expect(metrics.parserServiceCalls.getTypeAtLocation).toBeGreaterThan(0);
expect(metrics.parserServiceCalls.getTypesAtLocations).toBeGreaterThan(0);
expect(metrics.snapshots.created).toBe(2);
expect(metrics.snapshots.disposed).toBe(1);
```

Assert that metrics are absent from normal ESLint output.

- [ ] **Step 2: Run metrics tests to verify instrumentation is private**

Run: `pnpm vitest run --project integration-tests packages/integration-tests/tests/native-project-service-metrics.test.ts`

Expected: FAIL because no test-only metrics accessor exists.

- [ ] **Step 3: Expose test/benchmark metrics**

Construct the API with `collectTiming: true` only when `TYPESCRIPT_ESLINT_NATIVE_TIMING=true`. Return `api.getTimingInfo()` unchanged under `timing`, and add local counters for process starts, snapshots, project hits, file overlays, disposal, and each parser-service convenience method. Export reset/read functions only from `use-at-your-own-risk`.

- [ ] **Step 4: Add the benchmark script**

The script must run the fixed integration fixture once cold and five times warm for each backend in separate child processes. Print JSON containing median wall time, peak RSS, TypeScript's native request and transfer totals, recent native method samples, and local parser-service method counts. Exit nonzero when native warm median exceeds the TypeScript 6 warm median.

Add:

```json
"benchmark:native": "tsx tools/benchmark-native-project-service.mts"
```

- [ ] **Step 5: Run deterministic tests and the benchmark**

Run:

```bash
pnpm vitest run --project integration-tests packages/integration-tests/tests/native-project-service-metrics.test.ts
pnpm --dir packages/integration-tests benchmark:native
```

Expected: metrics test PASS; benchmark exits 0, reports five warm samples per backend, and reports the native median no slower than classic TypeScript 6. If it fails, inspect the per-method IPC counts and optimize repeated queries before proceeding; do not weaken the threshold.

- [ ] **Step 6: Commit instrumentation**

```bash
git add packages/typescript-estree/src/native packages/typescript-estree/src/use-at-your-own-risk.ts packages/typescript-estree/src/use-at-your-own-risk packages/integration-tests
git commit -m "perf: measure native typed linting IPC"
```

### Task 14: Document the experimental backend and verify the complete slice

**Files:**

- Modify: `docs/packages/Parser.mdx`
- Modify: `packages/parser/src/index.ts:5-19`
- Modify: `packages/integration-tests/tests/ts7.test.ts`

- [ ] **Step 1: Add parser documentation**

Document this exact opt-in:

```js
parserOptions: {
  projectService: {
    backend: 'native',
  },
}
```

State that it requires Node.js 22 or newer and the `@typescript/native` alias at `>=7.1.0-0`, supports only the four named rules, rejects legacy project/program inputs and non-empty `no-deprecated.allow`, and remains experimental. Keep side-by-side TS6/TS7 installation instructions because the default backend still imports classic TypeScript.

- [ ] **Step 2: Narrow the top-level TS7 rejection**

Keep rejecting TypeScript 7 installed under its normal package name at the parser root because the classic backend cannot load it. Update the message to state that the experimental backend requires the documented side-by-side aliases; do not remove the guard or widen the normal peer range.

- [ ] **Step 3: Run focused package verification**

Run:

```bash
pnpm nx test typescript-estree utils eslint-plugin integration-tests
pnpm nx typecheck types typescript-estree parser utils type-utils eslint-plugin integration-tests
pnpm nx build typescript-estree parser utils eslint-plugin
pnpm nx attw-check typescript-estree parser utils eslint-plugin
pnpm --dir packages/integration-tests benchmark:native
```

Expected: all commands PASS and the benchmark acceptance threshold holds.

- [ ] **Step 4: Run repository documentation and formatting checks**

Run:

```bash
pnpm check-format
pnpm lint-markdown
pnpm check-spelling
pnpm lint
```

Expected: all PASS.

- [ ] **Step 5: Inspect lifecycle cleanup**

After tests finish, verify no TypeScript native child process remains and `git status --short` contains only intended source, test, lockfile, workflow, and documentation changes.

- [ ] **Step 6: Commit documentation and final compatibility messaging**

```bash
git add docs/packages/Parser.mdx packages/parser/src/index.ts packages/integration-tests/tests/ts7.test.ts
git commit -m "docs: describe native parser prototype"
```

- [ ] **Step 7: Review the complete diff against the design**

Verify each requirement in `docs/superpowers/specs/2026-08-30-typescript-7-1-native-parser-design.md` has test evidence. Specifically confirm that the default TS6 path did not gain native imports at runtime, native handles remain valid through rule execution, unsupported rules fail clearly, and no peer range claims ordinary TypeScript 7 compatibility.
