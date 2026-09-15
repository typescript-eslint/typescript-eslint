# TypeScript 7.1 Native Parser Prototype

## Objective

Create an experimental TypeScript 7.1 parser backend that proves end-to-end typed linting through TypeScript's synchronous native API. The prototype must preserve the existing TypeScript 6 backend when disabled and must not imply compatibility between the classic and native compiler object models.

The prototype succeeds when it can lint TSConfig-backed projects with representative typed rules, reuse native project state across files, process unsaved file contents, and avoid pathological per-node IPC overhead. Full parser-option and rule parity are outside this prototype.

## Context

TypeScript 7.0 does not include a programmatic API. TypeScript 7.1 is expected to include a new API whose current preview uses synchronous IPC, snapshots, projects, and remote compiler objects. It is not structurally compatible with the classic `typescript` API.

The repository already uses TypeScript 7 for its own typechecking while aliasing the TypeScript 6 compatibility package to `typescript` for parser and rule behavior. The existing backend exposes classic `ts.Program`, `ts.Type`, `ts.Symbol`, `ts.Signature`, and TypeScript AST nodes through parser services. The experimental backend will not attempt to make native objects satisfy those classic contracts.

## Approach

Add a thin native vertical slice alongside the existing backend. An explicit parser option selects it. The slice includes native project loading, unsaved-file updates, ESTree conversion, native parser services, selected typed rules, diagnostics, lifecycle management, and performance instrumentation.

This approach proves the riskiest complete path before broadening compatibility. A parser-only port would not establish that typed rules can use the IPC API efficiently. Running rules directly in Go would be a separate linter architecture rather than an ESLint parser backend.

## Architecture

```text
ESLint
  |
  v
@typescript-eslint/parser
  | experimental opt-in
  v
Native parser backend
  |- Long-lived synchronous TypeScript 7.1 API client
  |- Snapshot and project lifecycle manager
  |- Native SourceFile to ESTree conversion
  `- Native parser services and node maps
             |
             v
Representative native-compatible typed rules
```

The existing TypeScript 6 path remains the default. Selecting the native backend requires the `@typescript/native` package alias to expose the native API entrypoint. The implementation may initially use `@typescript/native/unstable/sync`, but the opt-in must detect incompatible API versions rather than assuming that preview protocols are cross-version compatible.

## Components

### Backend selection

`parserOptions.projectService: { backend: 'native' }` selects the experimental native backend. Omitting `backend` continues to select the TypeScript 6 project service, so existing configurations retain their behavior and types.

The native option is incompatible with legacy `parserOptions.project`, `parserOptions.programs`, custom TypeScript plugins, and other unsupported hooks. Configuration validation reports these combinations before starting the native compiler process.

### Native API client

A process-wide owner lazily starts TypeScript's synchronous native API client. It verifies the available API surface, owns subprocess shutdown, and prevents use of objects after disposal. The client is reused across parser calls in one ESLint process because native process startup is not a per-file operation.

The client owner does not hide protocol failures or silently switch to TypeScript 6. Startup failures, protocol mismatches, compiler crashes, and unsupported APIs produce distinct actionable errors.

### Snapshot and project lifecycle

The lifecycle manager maps TSConfig projects and current file contents to native snapshots. It opens the relevant TSConfig, overlays the text supplied by ESLint, and retrieves the project's `SourceFile`, `Program`, and `Checker`.

Unchanged projects are reused between files. Changed, created, and deleted files invalidate the appropriate snapshot state. Replacing a snapshot disposes its remote handles. Temporary unsaved-file updates are scoped to the parser call unless the native API provides a safe reusable updated snapshot.

The prototype initially supports the project-service use case only. It does not recreate classic watch programs, compiler hosts, supplied programs, or isolated programs.

### ESTree conversion

The existing converter remains the source of ESTree shape, tokens, comments, ranges, locations, and parser errors. A scoped native-node adapter presents the node operations the converter uses without claiming compatibility with classic TypeScript nodes.

The conversion must not assume that classic and native `SyntaxKind` numeric values are equal. Node kinds are translated through stable names or an explicit mapping. Native and ESTree nodes are retained in bidirectional maps for the lifetime of their snapshot.

Standalone syntax-only parsing remains on the TypeScript 6 backend during the prototype unless TypeScript 7.1 provides a stable project-less source parser. Creating a temporary native project for every untyped file would test scaffolding rather than the intended production path.

### Native parser services

The opt-in returns parser services discriminated by `backend: 'native'`. It exposes native node maps, project/program/checker handles, and convenience operations for:

- type and symbol lookup;
- contextual types;
- resolved signatures;
- types from type nodes;
- types of symbols at locations;
- compiler options needed by scope analysis and rules.

These services return native API objects. They neither claim to be classic TypeScript objects nor populate the existing classic `program` contract with an incompatible value. Existing `getParserServices` calls report that classic services were requested from the native backend. Native-compatible rule branches use a separate `getNativeParserServices` utility.

### Representative rules

A native-specific branch will be added to these four existing rules:

- `no-unsafe-unary-minus`, for primitive flags and type formatting;
- `no-unsafe-argument`, for unions, arrays, tuples, generics, and unsafe-assignment analysis;
- `await-thenable`, for signatures, well-known symbols, node maps, and suggestions;
- `no-deprecated`, for symbols, aliases, declarations, node handles, contextual types, and signatures.

Together, these rules exercise:

- primitive and union type flags;
- type and symbol lookup;
- signatures and return types;
- unsafe generic assignment analysis;
- declarations and node handles;
- type formatting;
- diagnostics and fixes.

Rules outside that set receive an experimental-backend compatibility error from `getParserServices` when they request classic services. They do not silently run with incomplete type information.

### IPC batching and instrumentation

Native AST transfer occurs once per file and is traversed locally. Checker operations use native bulk or batch APIs where the rule access pattern allows it. The prototype records cold startup, project loading, AST transfer, checker request count, batch count, warm reuse, total lint time, and memory.

Instrumentation is available to tests and benchmarks without changing normal lint output. On the fixed warm-run benchmark, the median of five native runs must be no slower than the median of five TypeScript 6 runs. The result must also report checker IPC and batch counts so aggregate speed does not hide an avoidable one-request-per-node access pattern.

## Error handling

Native syntax and project diagnostics are translated into existing parser errors when their semantics and source ranges match. Native-only failures retain enough information to distinguish configuration errors, unsupported features, protocol failures, disposed handles, and compiler crashes.

The backend rejects unsupported behavior instead of silently degrading. It does not fall back to TypeScript 6 after native state has been selected because that could produce different AST, project, and type identities during one lint run.

## Verification

### AST parity

Compare TypeScript 6 and native ESTree output over representative TypeScript and TSX fixtures. Assert tokens, comments, ranges, locations, syntax errors, and bidirectional node-map correspondence. Include syntax whose native AST representation or token children differ from the classic AST.

### Project behavior

Test TSConfig discovery, included and excluded files, unsaved edits, repeated parses, snapshot invalidation, multiple projects, project disposal, and compiler-process shutdown. Include file creation, deletion, and configuration changes where the preview API supports them.

### Typed-rule parity

Run each selected rule's representative valid and invalid cases against both backends. Compare diagnostic message IDs, ranges, suggestions, and fixes. Differences require an explicit native expectation and justification rather than broad snapshot replacement.

### Cross-platform behavior

Run the native integration suite on Linux, macOS, and Windows. Cover path separators, path casing, absolute paths, virtual files, and compiler subprocess lifecycle.

### Performance

Measure cold and warm runs on a fixed TSConfig-backed fixture. Record startup time, project load time, total lint time, peak memory, IPC calls, batching, and project reuse. Compare with the TypeScript 6 backend, but do not require TypeScript 7 compiler headline speedups because JavaScript-to-native IPC changes the workload.

### Existing-backend isolation

Run the existing parser, typescript-estree, project-service, type-utils, and eslint-plugin suites with the native option disabled. Their TypeScript peer range, classic parser-services types, parser behavior, and supported configurations remain unchanged.

## Explicit non-goals

- Supporting every typed rule.
- Supporting legacy `parserOptions.project` or `parserOptions.programs`.
- Emulating a classic `ts.Program`, `ts.TypeChecker`, `ts.Type`, or `ts.Symbol` around native objects.
- Migrating `ts-api-utils` wholesale.
- Supporting TypeScript plugins, custom module resolvers, content mappers, solution builders, or project-reference emit.
- Replacing syntax-only TypeScript 6 parsing before a stable isolated native parser exists.
- Making the native backend the default.
- Raising the published TypeScript peer range based only on the prototype.

## Follow-up decisions

Evidence from the prototype will inform whether to expand native rule coverage, coordinate a native-compatible `ts-api-utils` API, preserve both backends in a future release, or make native support part of a breaking major. Those decisions are not prerequisites for the vertical slice.
