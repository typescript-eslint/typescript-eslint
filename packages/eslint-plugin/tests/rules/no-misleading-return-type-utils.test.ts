import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { RuleDependencies } from '../../src/rules/no-misleading-return-type-utils/shared';

import { createAnalysisState } from '../../src/rules/no-misleading-return-type-utils/analysis-state';
import { createPropertyKeyMatching } from '../../src/rules/no-misleading-return-type-utils/property-key-matching';

const fileName = '/no-misleading-return-type-property-keys.ts';
const sourceText = [
  'type AnyKey = any;',
  'type UnknownKey = unknown;',
  'type NeverKey = never;',
  'type StringKey = string;',
  'type NumberKey = number;',
  'type SymbolKey = symbol;',
  'type NullKey = null;',
  'type UndefinedKey = undefined;',
  "type StringOne = '1';",
  "type StringX = 'x';",
  'type NumberOne = 1;',
  "type Exact = 'exact';",
  'type NumericTemplate = `${number}`;',
  'type BigIntTemplate = `${bigint}`;',
  'type IntrinsicTemplate = `value-${boolean | null | undefined}-${string}`;',
  'type DelimitedTemplate = `pre-${string}-${number}-post`;',
  'type AdjacentTemplate = `${number}${bigint}`;',
  'type UppercaseKey = Uppercase<string>;',
  'type LowercaseKey = Lowercase<string>;',
  'type CapitalizeKey = Capitalize<string>;',
  'type UncapitalizeKey = Uncapitalize<string>;',
  'type NestedMapping = `data-${Capitalize<Uppercase<string>>}`;',
  "type KeyUnion = `data-${string}` | 'other';",
  'type KeyIntersection = Uppercase<string> & `A${string}`;',
  'type IntersectionTemplate = `key-${Uppercase<string> & `A${string}`}`;',
  'type GenericTemplate<T extends string> = `data-${Uppercase<T>}`;',
  "type DeferredKey<T> = T extends string ? 'yes' : 'no';",
  'declare const firstSymbol: unique symbol;',
  'declare const secondSymbol: unique symbol;',
  'type FirstSymbol = typeof firstSymbol;',
  'type SecondSymbol = typeof secondSymbol;',
].join('\n');

function createProgram(): ts.Program {
  const options: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.fileExists = path => path === fileName || ts.sys.fileExists(path);
  host.readFile = path =>
    path === fileName ? sourceText : ts.sys.readFile(path);
  host.getSourceFile = (
    path,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) =>
    path === fileName
      ? ts.createSourceFile(
          path,
          sourceText,
          languageVersion,
          true,
          ts.ScriptKind.TS,
        )
      : getSourceFile(
          path,
          languageVersion,
          onError,
          shouldCreateNewSourceFile,
        );
  return ts.createProgram([fileName], options, host);
}

function createMatching(checker: ts.TypeChecker) {
  return createPropertyKeyMatching({
    checker,
    isDeferredType(type): boolean {
      return (
        tsutils.isTypeFlagSet(
          type,
          ts.TypeFlags.Conditional |
            ts.TypeFlags.Index |
            ts.TypeFlags.IndexedAccess |
            ts.TypeFlags.Substitution,
        ) ||
        (tsutils.isObjectType(type) &&
          tsutils.isObjectFlagSet(type, ts.ObjectFlags.Mapped))
      );
    },
    isTypeAssignableTo: (source, target) =>
      checker.isTypeAssignableTo(source, target),
    isUncertain: type =>
      tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown) ||
      tsutils.isIntrinsicErrorType(type),
  });
}

const program = createProgram();
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(fileName)!;
const types = new Map<string, ts.Type>();
for (const statement of sourceFile.statements) {
  if (ts.isTypeAliasDeclaration(statement)) {
    types.set(statement.name.text, checker.getTypeFromTypeNode(statement.type));
  }
}

function getType(name: string): ts.Type {
  const type = types.get(name);
  if (type == null) {
    throw new Error(`Missing test type: ${name}`);
  }
  return type;
}

function createState() {
  return createAnalysisState({
    checker,
    program,
    services: {
      program,
    } as RuleDependencies['services'],
  } as RuleDependencies);
}

const checkerWithoutLiteralFactories = new Proxy(checker, {
  get(target, property, receiver) {
    if (
      property === 'getNumberLiteralType' ||
      property === 'getStringLiteralType'
    ) {
      return undefined;
    }
    return Reflect.get(target, property, receiver);
  },
});
const officialMatching = createMatching(checker);
const legacyMatching = createMatching(checkerWithoutLiteralFactories);

describe('no-misleading-return-type property key matching', () => {
  it('uses syntactically valid test types', () => {
    expect(ts.getPreEmitDiagnostics(program)).toEqual([]);
  });

  it('matches keys against template and intrinsic mapping index types', () => {
    const cases: [string, string, boolean][] = [
      ['ABC', 'UppercaseKey', true],
      ['Abc', 'UppercaseKey', false],
      ['abc', 'LowercaseKey', true],
      ['Abc', 'CapitalizeKey', true],
      ['abc', 'CapitalizeKey', false],
      ['data-ABC', 'NestedMapping', true],
      ['data-Abc', 'NestedMapping', false],
      ['1e3', 'NumericTemplate', true],
      ['NaN', 'NumericTemplate', false],
      ['1_0', 'NumericTemplate', false],
      ['11', 'BigIntTemplate', true],
      ['1.5', 'BigIntTemplate', false],
      ['pre-x-1-post', 'DelimitedTemplate', true],
      ['pre-x-y-post', 'DelimitedTemplate', false],
      ['other', 'KeyUnion', true],
      ['data-anything', 'KeyUnion', true],
      ['unrelated', 'KeyUnion', false],
      ['0', 'NumberKey', true],
      ['-0', 'NumberKey', false],
      ['01', 'NumberKey', false],
    ];
    for (const [value, keyType, expected] of cases) {
      expect(
        officialMatching.stringPropertyMatchesIndexKey(value, getType(keyType)),
        `${JSON.stringify(value)} against ${keyType}`,
      ).toBe(expected);
    }
  });

  it('treats keys as covered when literal type factories are unavailable', () => {
    // TypeScript before 5.1 cannot construct literal key types; the matcher
    // must degrade toward reporting nothing rather than reimplementing the
    // checker's relation.
    expect(
      legacyMatching.stringPropertyMatchesIndexKey('other', getType('Exact')),
    ).toBe(true);
    expect(
      legacyMatching.stringPropertyMatchesIndexKey(
        'abc',
        getType('UppercaseKey'),
      ),
    ).toBe(true);
  });

  it.each([
    ['StringOne', 'NumberKey', true],
    ['StringX', 'NumberKey', false],
    ['StringKey', 'NumberKey', true],
    ['NumberKey', 'StringOne', true],
    ['FirstSymbol', 'FirstSymbol', true],
    ['FirstSymbol', 'SecondSymbol', false],
    ['FirstSymbol', 'StringKey', false],
    ['UnknownKey', 'StringKey', true],
    ['KeyUnion', 'StringKey', true],
    ['StringKey', 'KeyUnion', true],
  ] as const)(
    'detects overlap between %s and %s as %s',
    (left, right, expected) => {
      expect(
        officialMatching.propertyKeyTypesMayOverlap(
          getType(left),
          getType(right),
        ),
      ).toBe(expected);
    },
  );
});

describe('no-misleading-return-type analysis state', () => {
  it('expands a recursive synthetic union without looping', () => {
    const state = createState();
    const recursiveUnion = {
      flags: ts.TypeFlags.Union,
      isIntersection: () => false,
      isUnion: () => true,
      types: [] as ts.Type[],
    } as unknown as ts.UnionType;
    recursiveUnion.types.push(recursiveUnion);

    expect(
      state.expandObservations([{ node: sourceFile, type: recursiveUnion }]),
    ).toEqual([]);
  });

  it('recognizes only call-stack RangeErrors as stack overflows', () => {
    const state = createState();

    expect(
      state.isStackOverflowError(new RangeError('Maximum call stack')),
    ).toBe(true);
    expect(state.isStackOverflowError(new RangeError('Out of range'))).toBe(
      false,
    );
    expect(state.isStackOverflowError(new Error('Maximum call stack'))).toBe(
      false,
    );
  });
});
