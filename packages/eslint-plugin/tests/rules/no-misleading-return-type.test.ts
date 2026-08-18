import { noFormat } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import rule from '../../src/rules/no-misleading-return-type';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-misleading-return-type', rule, {
  valid: [
    // Only explicitly written union positions are analyzed. A primitive
    // annotation deliberately abstracts any number of returned literals.
    `
function noAnnotation() {
  return 'loading';
}
    `,
    `
function primitiveCoversLiterals(flag: boolean): string {
  return flag ? 'loading' : 'idle';
}
    `,
    `
function primitiveCoversConstLiteral(): string {
  return 'loading' as const;
}
    `,
    `
function primitiveBooleanCoversLiteral(): boolean {
  return true;
}
    `,
    `
function allConstituents(flag: boolean): 'loading' | 'idle' {
  return flag ? 'loading' : 'idle';
}
    `,
    `
function allKinds(flag: 0 | 1 | 2): string | number | null {
  if (flag === 0) return 'ready';
  if (flag === 1) return 1;
  return null;
}
    `,
    // Escape hatches cannot prove that a constituent is unused.
    `
declare const dynamic: any;
function anyReturn(): string | null {
  return dynamic;
}
    `,
    `
function unknownReturn(value: unknown): unknown {
  return value;
}
    `,
    `
declare function invokeMutatingCallback(callback: () => void): void;
function callbackMutatedReturn(): string | null {
  let value: string | null = 'ready';
  invokeMutatingCallback(() => {
    value = null;
  });
  return value;
}
    `,
    `
declare function runCapturedMutation(callback: () => void): void;
function capturedArrayDestructuring(): 'ready' | null {
  let value: 'ready' | null = 'ready';
  runCapturedMutation(() => {
    [value] = [null];
  });
  return value;
}
function capturedObjectDestructuring(): 'ready' | null {
  let value: 'ready' | null = 'ready';
  runCapturedMutation(() => {
    ({ value } = { value: null });
  });
  return value;
}
enum CapturedCount {
  Zero,
  One,
}
function capturedUpdate(): CapturedCount.Zero | CapturedCount.One {
  let value: CapturedCount.Zero | CapturedCount.One = CapturedCount.Zero;
  runCapturedMutation(() => {
    value++;
  });
  return value;
}
function capturedForOfTarget(): 'ready' | null {
  let value: 'ready' | null = 'ready';
  runCapturedMutation(() => {
    for (value of [null]) {
      // The loop assignment itself mutates the captured binding.
    }
  });
  return value;
}
function capturedNestedObjectTarget(): 'ready' | null {
  let value: 'ready' | null = 'ready';
  runCapturedMutation(() => {
    ({
      nested: { value },
    } = { nested: { value: null } });
  });
  return value;
}
type CapturedObjectRestState =
  { readonly kind: 'ready' } | { readonly kind: null };
function capturedObjectRestTarget(): CapturedObjectRestState {
  let state: CapturedObjectRestState = { kind: 'ready' };
  runCapturedMutation(() => {
    ({ ...state } = { kind: null });
  });
  return state;
}
    `,
    `
interface CapturedPropertyState {
  nested: { value: string | null };
}
declare function runCapturedMutation(callback: () => void): void;
function capturedPropertyMutation(state: CapturedPropertyState): string | null {
  if (state.nested.value === null) {
    throw new Error('missing');
  }
  runCapturedMutation(() => {
    state.nested.value = null;
  });
  return state.nested.value;
}
function capturedElementMutation(state: [string | null]): string | null {
  const alias = state;
  if (state[0] === null) {
    throw new Error('missing');
  }
  runCapturedMutation(() => {
    alias[0] = null;
  });
  return state[0];
}
    `,
    `
interface ExternallyMutableState {
  value: string | null;
}
declare function mutateState(state: ExternallyMutableState): void;
function externallyMutatedProperty(
  state: ExternallyMutableState,
): string | null {
  if (state.value === null) {
    throw new Error('missing');
  }
  mutateState(state);
  return state.value;
}
declare const sharedMutableState: ExternallyMutableState;
declare function mutateSharedState(): void;
function globallyMutatedProperty(): string | null {
  if (sharedMutableState.value === null) {
    throw new Error('missing');
  }
  mutateSharedState();
  return sharedMutableState.value;
}
    `,
    `
let sharedMutableValue: string | null = 'ready';
declare function mutateSharedValue(): void;
function externallyMutatedBinding(): string | null {
  if (sharedMutableValue === null) {
    throw new Error('missing');
  }
  mutateSharedValue();
  return sharedMutableValue;
}
    `,
    `
function createClosureMutatedReader() {
  let value: string | null = 'ready';
  const mutate = () => {
    value = null;
  };
  return function closureMutatedReader(): string | null {
    if (value === null) {
      throw new Error('missing');
    }
    mutate();
    return value;
  };
}
    `,
    `
import {
  importedMutableValue,
  mutateImportedValue,
} from './no-misleading-return-type';
function externallyMutatedImport(): string | null {
  if (importedMutableValue === null) {
    throw new Error('missing');
  }
  mutateImportedValue();
  return importedMutableValue;
}
    `,
    `
function classInitializerMutatedReturn(): string | null {
  let value: string | null = 'ready';
  class SideEffect {
    static field = (value = null);
  }
  void SideEffect;
  return value;
}
    `,
    `
function directlyEvaluatedMutation(): string | null {
  let value: string | null = 'ready';
  eval('value = null');
  return value;
}
    `,
    // Explicit assertions and generic arguments pin the expression type. The
    // rule compares that type rather than trying to disprove the assertion.
    `
function pinnedAssertion(): string | null {
  return 'ready' as string | null;
}
function pinnedCollection(): Set<string | null> {
  return new Set<string | null>(['ready']);
}
    `,
    `
function erasedNarrowing(value: string | null): string | null {
  return value as string;
}
function erasedNonNull(value: string | null): string | null {
  return value!;
}
function erasedUnknown(value: unknown): string | null {
  return value as string;
}
function erasedNarrowingAlias(value: string | null): string | null {
  const narrowed = value as string;
  return narrowed;
}
function pinnedWideningAlias(): string | null {
  const widened = 'ready' as string | null;
  return widened;
}
    `,
    // Unwrapping a const initializer must not discard control-flow narrowing
    // established at the identifier use site.
    `
function narrowedConstCollection(
  values: readonly (string | undefined)[],
): readonly string[] | undefined {
  const strings = values.map(value => value);
  return strings.every((value): value is string => value !== undefined)
    ? strings
    : undefined;
}
    `,
    {
      code: `
function narrowedConstNode(node: Node): Element | undefined {
  const parent = node.parentNode;
  return parent instanceof Element ? parent : undefined;
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.lib-dom.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    `
function neverReturns(): string | null {
  throw new Error('unreachable');
}
    `,
    `
declare const textBeforeNeverValue: string;
const assertedNeverValue = null as never;
function readingNeverTypedValue(flag: boolean): string | null {
  if (flag) return textBeforeNeverValue;
  assertedNeverValue;
  return null;
}
    `,
    // Referenced aliases are analyzed when every constituent is observable.
    // Keeping this valid case prevents alias expansion from treating the alias
    // itself as one opaque unused type.
    `
type Result = string | null;
function completeAlias(flag: boolean): Result {
  return flag ? 'ready' : null;
}
    `,
    `
interface CompleteObjectAlias {
  value: string | null;
}
function completeObjectAlias(flag: boolean): CompleteObjectAlias {
  return { value: flag ? 'ready' : null };
}
    `,
    // An unresolved computed write can replace the explicit property at
    // runtime, so both annotated constituents remain observable.
    `
declare const dynamicPropertyKey: string;
function dynamicComputedProperty(): {
  readonly value: 'ready' | 'idle';
} {
  return { value: 'ready', [dynamicPropertyKey]: 'idle' };
}
    `,
    `
enum DynamicPropertyKey {
  Other = 'other',
  Value = 'value',
}
declare const dynamicEnumPropertyKey: DynamicPropertyKey;
function dynamicEnumComputedProperty(): {
  readonly value: 'idle' | 'ready';
} {
  return { value: 'ready', [dynamicEnumPropertyKey]: 'idle' };
}
    `,
    // Void-like constituents remain exempt when the configured TypeScript
    // program does not model unchecked indexed access.
    `
function uncheckedIndex(values: string[]): string | undefined {
  return values[0];
}
    `,
    `
function uncheckedIndexFallback(values: string[]): string | null {
  return values[values.length - 1] ?? null;
}
    `,
    // `??` only strips nullish constituents; a falsy `0` still flows through.
    `
declare const zeroSource: 0 | null;
function coalescedZero(): 0 | 'fallback' {
  return zeroSource ?? 'fallback';
}
    `,
    `
function optionalReturn(flag: boolean): string | void {
  if (flag) return 'ready';
}
    `,
    // Once indexed access includes undefined, real undefined-producing paths
    // remain observable, including after conservative flow narrowing.
    {
      code: `
function checkedIndex(values: string[]): string | undefined {
  return values[0];
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
function narrowedCheckedIndex(values: string[]): string | undefined {
  if (values[0] === undefined) {
    throw new Error('missing');
  }
  return values[0];
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
function checkedFallthrough(flag: boolean): string | void {
  if (flag) return 'ready';
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    // Contextual and inherited annotations are contracts, not claims local to
    // one implementation.
    `
type Callback = () => string | null;
const contextualArrow: Callback = (): string | null => 'ready';
    `,
    `
declare function register(callback: () => string | null): void;
register(function contextualArgument(): string | null {
  return 'ready';
});
    `,
    `
interface ObjectContract {
  read(): string | null;
}
const contextualObject: ObjectContract = {
  read(): string | null {
    return 'ready';
  },
};
    `,
    `
interface GetterContract {
  readonly value: string | null;
}
const contextualGetter: GetterContract = {
  get value(): string | null {
    return 'ready';
  },
};
    `,
    `
class Base {
  read(): string | null {
    return Math.random() > 0.5 ? 'ready' : null;
  }
}
class Derived extends Base {
  override read(): string | null {
    return 'ready';
  }
}
    `,
    `
class StaticBase {
  static read(flag: boolean): string | null {
    return flag ? 'ready' : null;
  }
}
class StaticDerived extends StaticBase {
  static override read(): string | null {
    return 'ready';
  }
}
    `,
    `
interface Reader {
  read(): string | null;
}
class ReaderImpl implements Reader {
  read(): string | null {
    return 'ready';
  }
}
    `,
    `
function replaceDecoratedMethod(
  _target: object,
  _key: string | symbol,
  descriptor: TypedPropertyDescriptor<() => string | null>,
): void {
  descriptor.value = () => null;
}
class DecoratedImplementation {
  @replaceDecoratedMethod
  read(): string | null {
    return 'ready';
  }
}
    `,
    `
function replaceFieldClass<T extends new (...args: any[]) => object>(Base: T) {
  return class extends Base {
    read = () => null;
  };
}
@replaceFieldClass
class DecoratedWrappedField {
  read = [(): string | null => 'ready'][0];
}
    `,
    `
function replaceDecoratedClass(target: {
  prototype: { read(): string | null };
}): void {
  target.prototype.read = () => null;
}
@replaceDecoratedClass
class DecoratedClassImplementation {
  read(): string | null {
    return 'ready';
  }
}
    `,
    `
function replaceDecoratedField(target: object, key: string | symbol): void {
  Object.defineProperty(target, key, {
    configurable: true,
    get: () => () => null,
    set: () => {},
  });
}
class DecoratedFieldImplementation {
  @replaceDecoratedField
  read = (): string | null => 'ready';
}
    `,
    `
function replaceSibling(target: { read(): string | null }, _key: string): void {
  target.read = () => null;
}
class SiblingDecoratedImplementation {
  read(): string | null {
    return 'ready';
  }
  @replaceSibling
  other(): void {}
}
    `,
    // Overload implementations carry declarations shared with other
    // signatures.
    `
function overloaded(value: 'a'): 'a';
function overloaded(value: 'b'): 'b' | null;
function overloaded(value: 'a' | 'b'): 'a' | 'b' | null {
  return value;
}
    `,
    `
class OverloadedReader {
  read(value: 'a'): 'a';
  read(value: 'b'): 'b' | null;
  read(value: 'a' | 'b'): 'a' | 'b' | null {
    return value;
  }
}
    `,
    // A variadic tuple's required suffix is matched from the right. Treating
    // it as part of the fixed prefix can discard a reachable overload.
    `
interface VariadicSuffixResult {
  (...args: [...string[], number]): 'A' | 'B';
}
function variadicSuffix(...args: [string, ...never[], number]): 'B';
function variadicSuffix(...args: [...string[], number]): 'A';
function variadicSuffix(...args: (string | number)[]): 'A' | 'B' {
  return args.length === 2 ? 'B' : 'A';
}
function preservesVariadicSuffixOverload(): VariadicSuffixResult {
  return variadicSuffix;
}
    `,
    `
const accessorKey = 'value' as const;
class AccessorPair {
  get [accessorKey](): string | null {
    return Math.random() > 0.5 ? 'ready' : null;
  }
  set [accessorKey](value: string | null) {}
}
    `,
    `
const objectAccessorPair = {
  get value(): string | null {
    return Math.random() > 0.5 ? 'ready' : null;
  },
  set value(value: string | null) {},
};
    `,
    // Empty mutable containers do not provide evidence about their future
    // element types and are therefore left alone.
    `
function emptyArray(): Array<string | null> {
  return [];
}
    `,
    `
function emptyMap(): Map<string, number | null> {
  return new Map();
}
    `,
    // A syntactically written constituent that is already subsumed by another
    // constituent does not widen the caller-visible type.
    `
function subsumedStringLiteral(): string | 'ready' {
  return 'idle';
}
function returnedSubsumedStringLiteral(): 'ready' | string {
  return 'ready';
}
function returnedSubsumedNumberLiteral(): 1 | 2 | number {
  return 1;
}
function returnedSubsumedBigintLiteral(): 1n | bigint {
  return BigInt(1) as 1n;
}
    `,
    `
function subsumedBooleanLiteral(): boolean | true {
  return true;
}
    `,
    `
enum WholeState {
  Loading,
  Ready,
}
function wholeEnum(): WholeState {
  return WholeState.Loading;
}
type WholeStateAlias = WholeState;
function aliasedWholeEnum(): WholeStateAlias {
  return WholeState.Loading;
}
    `,
    // Function-valued class fields can carry the same inherited contract as
    // methods do.
    `
class FieldBase {
  read: () => string | null = () => null;
}
class FieldDerived extends FieldBase {
  override read = (): string | null => 'ready';
}
    `,
    // A constrained type parameter is subsumed by its wider sibling and does
    // not add a caller-visible possibility of its own.
    `
function constrainedSubsumption<T extends string>(value: T): T | string {
  return value;
}
    `,
    `
function constrainedGenericUnion<T extends 'ready' | 'idle'>(
  value: T,
): 'ready' | 'idle' {
  return value;
}
function constrainedGenericArray<T extends string | null>(
  value: T,
): Array<string | null> {
  return [value];
}
    `,
    `
declare function wrapCompleteCall<T>(value: T): { readonly value: T };
declare const completeCallValue: 'idle' | 'ready';
function completeResolvedGenericCall(): {
  readonly value: 'idle' | 'ready';
} {
  return wrapCompleteCall(completeCallValue);
}
    `,
    `
declare function selectCompleteCall(value: 'ready'): {
  readonly state: 'ready';
};
declare function selectCompleteCall(value: 'idle'): {
  readonly state: 'idle';
};
declare function selectCompleteCall(value: 'idle' | 'ready'): {
  readonly state: 'idle' | 'ready';
};
declare const completeCallState: 'idle' | 'ready';
function completeResolvedOverloadCall(): {
  readonly state: 'idle' | 'ready';
} {
  return selectCompleteCall(completeCallState);
}
    `,
    `
function completePromiseExecutor(flag: boolean): Promise<string | null> {
  return new Promise(resolve => {
    resolve(flag ? 'ready' : null);
  });
}
    `,
    `
function branchedPromiseSettlement(flag: boolean): Promise<string | null> {
  return new Promise(resolve => {
    if (flag) resolve('ready');
    else resolve(null);
    resolve('ignored');
  });
}
    `,
    `
function referencedPromiseResolverClosure(
  flag: boolean,
): Promise<string | null> {
  return new Promise(resolve => {
    function resolveNull() {
      resolve(null);
    }
    if (flag) resolveNull();
    else resolve('ready');
  });
}
    `,
    `
function referencedPromiseResolverArrow(flag: boolean): Promise<string | null> {
  return new Promise(resolve => {
    const resolveNull = () => resolve(null);
    if (flag) resolveNull();
    else resolve('ready');
  });
}
    `,
    `
function unreferencedRecursivePromiseResolvers(): Promise<string | null> {
  return new Promise(resolve => {
    function first(): void {
      second();
    }
    function second(): void {
      first();
      resolve('ready');
    }
  });
}
function referencedRecursivePromiseResolvers(
  flag: boolean,
): Promise<string | null> {
  return new Promise(resolve => {
    function first(depth: number): void {
      second(depth);
    }
    function second(depth: number): void {
      if (depth > 0) first(depth - 1);
      else resolve(null);
    }
    if (flag) first(1);
    else resolve('ready');
  });
}
function typeOnlyPromiseResolverReference(): Promise<string | null> {
  return new Promise(resolve => {
    function neverInvoked(): void {
      resolve('ready');
    }
    const typeOnly: typeof neverInvoked | undefined = undefined;
    void typeOnly;
  });
}
    `,
    `
function uninvokedPromiseMethod(): Promise<string | null> {
  return new Promise(resolve => {
    const holder = {
      settle(): void {
        function settleLater(): void {
          resolve('ready');
        }
        settleLater();
      },
    };
    void holder;
  });
}
    `,
    `
function uninstantiatedPromiseField(): Promise<string | null> {
  return new Promise(resolve => {
    class Holder {
      value = resolve('ready');
    }
    void Holder;
  });
}
function uninstantiatedPromiseFieldThroughLocalFunction(): Promise<
  string | null
> {
  return new Promise(resolve => {
    function settle(): void {
      resolve('ready');
    }
    class Holder {
      value = settle();
    }
    void Holder;
  });
}
    `,
    `
function explicitlyPinnedPromiseExecutor(): Promise<string | null> {
  return new Promise<string | null>(resolve => {
    resolve('ready');
  });
}
    `,
    `
declare function resolveLater(resolver: (value: string | null) => void): void;
function escapedPromiseResolver(): Promise<string | null> {
  return new Promise(resolve => {
    resolveLater(resolve);
  });
}
    `,
    // Resolved mapped types and default-library members remain safe when every
    // observable union constituent is represented by the implementation.
    `
type CompleteSource = { value: string | null; count: number };
function completePick(flag: boolean): Pick<CompleteSource, 'value'> {
  return { value: flag ? 'ready' : null };
}
    `,
    `
interface DatedResult {
  createdAt: Date;
  value: string | null;
}
function completeDatedResult(flag: boolean): DatedResult {
  return { createdAt: new Date(), value: flag ? 'ready' : null };
}
    `,
    `
class ProtectedResult {
  protected state: 'ready' | 'idle' = 'ready';
}
class ReadyProtectedResult extends ProtectedResult {
  declare protected state: 'ready';
}
function protectedImplementationDetail(): ProtectedResult {
  return new ReadyProtectedResult();
}
    `,
    `
import type { ImportedResult } from './no-misleading-return-type';
function completeImportedAlias(flag: boolean): ImportedResult {
  return flag ? 'ready' : null;
}
    `,
    // When a finally block can complete normally, the preceding return still
    // contributes to the function's observable completions.
    `
function conditionalFinally(flag: boolean): string | null {
  try {
    return null;
  } finally {
    if (flag) return 'ready';
  }
}
    `,
    `
function labeledBreakLetsFinallyComplete(flag: boolean): string | null {
  if (flag) return 'ready';
  try {
    return null;
  } finally {
    escape: {
      break escape;
    }
  }
}
    `,
    `
function reachableSwitchFallthrough(flag: boolean): 'ready' | 'fallthrough' {
  switch ('ready' as 'ready' | 'unmatched') {
    case 'ready':
      if (flag) return 'ready';
    case 'unmatched':
      return 'fallthrough';
  }
}
    `,
    `
enum DynamicSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
function dynamicEnumSwitch(
  state: DynamicSwitchState,
): DynamicSwitchState.Idle | DynamicSwitchState.Ready {
  switch (state) {
    case DynamicSwitchState.Idle:
      return DynamicSwitchState.Idle;
    case DynamicSwitchState.Ready:
      return DynamicSwitchState.Ready;
  }
}
    `,
    `
enum DynamicElementSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
function dynamicElementEnumSwitch(
  key: keyof typeof DynamicElementSwitchState,
): DynamicElementSwitchState.Idle | DynamicElementSwitchState.Ready {
  switch (DynamicElementSwitchState[key]) {
    case DynamicElementSwitchState.Idle:
      return DynamicElementSwitchState.Idle;
    default:
      return DynamicElementSwitchState.Ready;
  }
}
    `,
    `
enum MutableSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
let mutableSwitchState: MutableSwitchState = MutableSwitchState.Ready;
function mutableEnumSwitch():
  MutableSwitchState.Idle | MutableSwitchState.Ready {
  switch (mutableSwitchState as MutableSwitchState) {
    case MutableSwitchState.Idle:
      return MutableSwitchState.Idle;
    default:
      return MutableSwitchState.Ready;
  }
}
    `,
    `
function nestedLoopBreakDoesNotExitSwitch(
  loop: boolean,
  returnReady: boolean,
): 'ready' | 'fallthrough' {
  switch ('ready' as 'ready' | 'unmatched') {
    case 'ready':
      if (returnReady) return 'ready';
      while (loop) {
        break;
      }
    case 'unmatched':
      return 'fallthrough';
  }
}
    `,
    `
declare function haltAfterLabeledSwitchBreak(): never;
function labeledSwitchLetsFinallyComplete(
  mode: boolean,
  text: boolean,
): string | null {
  if (text) return 'ready';
  try {
    return null;
  } finally {
    done: switch (mode) {
      case true:
        break done;
      default:
        haltAfterLabeledSwitchBreak();
    }
  }
}
    `,
    // A labeled break that targets the switch's containing label reaches the
    // statement after the switch.
    `
function labeledSwitchCanExit(flag: boolean): string | null {
  done: switch (flag) {
    case true:
      return 'ready';
    default:
      break done;
  }
  return null;
}
    `,
    `
declare const runtimeCaseValue: string;
function unknownSwitchCaseMustRemainReachable(): string | null {
  switch ('ready') {
    case runtimeCaseValue:
      return null;
    default:
      return 'ready';
  }
}
    `,
    `
declare function haltInFinally(): never;
function neverCompletingFinally(): string | null {
  try {
    return null;
  } finally {
    haltInFinally();
  }
}
    `,
    `
function throwingFinally(): string | null {
  try {
    return null;
  } finally {
    throw new Error('halt');
  }
}
    `,
    `
declare function haltInFinallyBranch(): never;
function branchingNeverFinally(flag: boolean): string | null {
  try {
    return null;
  } finally {
    if (flag) haltInFinallyBranch();
    else haltInFinallyBranch();
  }
}
    `,
    `
declare function haltInFinallySwitch(): never;
function switchingNeverFinally(flag: boolean): string | null {
  try {
    return null;
  } finally {
    switch (flag) {
      case true:
        haltInFinallySwitch();
      default:
        haltInFinallySwitch();
    }
  }
}
    `,
    `
declare function haltInFinallyLoop(): never;
function doWhileNeverFinally(): string | null {
  try {
    return null;
  } finally {
    do {
      haltInFinallyLoop();
    } while (false);
  }
}
    `,
    // Unresolved conditional members cannot be compared soundly and must not
    // contaminate otherwise structural generic aliases.
    `
type ConditionalBox<T> = {
  value: T extends string ? string | null : number | null;
};
function preserveConditionalBox<T>(
  value: ConditionalBox<T>,
): ConditionalBox<T> {
  return value;
}
    `,
    `
type DeferredConditionalBox<T> = {
  value: T extends true ? string : number;
};
type DeferredIndexedBox<
  T extends { first: string; second: number },
  K extends 'first' | 'second',
> = { value: T[K] };
type DeferredMappedBox<T> = {
  [K in keyof T]: T[K] extends string ? string : number;
};
function preserveDeferredConditional<T extends boolean>(
  value: DeferredConditionalBox<T>,
): { value: string | number } {
  return value;
}
function preserveDeferredIndexed<
  T extends { first: string; second: number },
  K extends 'first' | 'second',
>(value: DeferredIndexedBox<T, K>): { value: string | number } {
  return value;
}
function preserveDeferredMapped<T extends { value: string | number }>(
  value: DeferredMappedBox<T>,
): { value: string | number } {
  return value;
}
function preserveDeferredArray<T extends boolean>(
  value: Array<T extends true ? string : number>,
): Array<string | number> {
  return value;
}
    `,
    `
type DeferredNullableValue<T extends boolean> = T extends true ? string : null;
function preserveDeferredNullable<T extends boolean>(
  value: DeferredNullableValue<T>,
): string | null {
  return value;
}
    `,
    // Both members are deferred over an open `T`; with `T = ''` the same
    // value inhabits both, so neither can be proven unused.
    `
type RecursiveA<T extends string> = T extends \`\${infer F}\${infer R}\`
  ? \`\${F}a\${RecursiveA<R>}\`
  : '';
type RecursiveB<T extends string> = T extends \`\${infer F}\${infer R}\`
  ? \`\${F}b\${RecursiveB<R>}\`
  : '';
function recursiveGenericSubset<T extends string>(
  value: RecursiveA<T>,
): RecursiveA<T> | RecursiveB<T> {
  return value;
}
    `,
    // TypeScript can overflow while comparing structurally equivalent
    // recursive template-literal aliases. The rule must not crash.
    `
type RecursiveA<T extends string> = T extends \`\${infer F}\${infer R}\`
  ? \`\${F}a\${RecursiveA<R>}\`
  : '';
type RecursiveB<T extends string> = T extends \`\${infer F}\${infer R}\`
  ? \`\${F}a\${RecursiveB<R>}\`
  : '';
function recursiveRelation<T extends string>(
  value: RecursiveA<T>,
): RecursiveA<T> | RecursiveB<T> {
  return value;
}
    `,
    `
type CompleteIntersection = { value: string | null } & { tag: 'result' };
function completeIntersection(flag: boolean): CompleteIntersection {
  return { value: flag ? 'ready' : null, tag: 'result' };
}
    `,
    `
type ReducedIntersection = { value: string | null } & { value: string };
function effectiveIntersection(): ReducedIntersection {
  return { value: 'ready' };
}
    `,
    `
enum DefinitionKind {
  First,
  Second,
}
type Definition =
  | { first: string; kind: DefinitionKind.First }
  | { kind: DefinitionKind.Second; second: number };
type WrappedDefinition =
  | {
      definition: Definition & { kind: DefinitionKind.First };
      kind: DefinitionKind.First;
    }
  | {
      definition: Definition & { kind: DefinitionKind.Second };
      kind: DefinitionKind.Second;
    };
function wrapDefinition(definition: Definition): WrappedDefinition {
  switch (definition.kind) {
    case DefinitionKind.First:
      return { definition, kind: DefinitionKind.First };
    case DefinitionKind.Second:
      return { definition, kind: DefinitionKind.Second };
  }
}
    `,
    `
type Wide0 = { value: string | null };
type Complete0 = { value: string | null };
type Wide1 = { left: Wide0; right: Wide0 };
type Complete1 = { left: Complete0; right: Complete0 };
type Wide2 = { left: Wide1; right: Wide1 };
type Complete2 = { left: Complete1; right: Complete1 };
type Wide3 = { left: Wide2; right: Wide2 };
type Complete3 = { left: Complete2; right: Complete2 };
type Wide4 = { left: Wide3; right: Wide3 };
type Complete4 = { left: Complete3; right: Complete3 };
type Wide5 = { left: Wide4; right: Wide4 };
type Complete5 = { left: Complete4; right: Complete4 };
type Wide6 = { left: Wide5; right: Wide5 };
type Complete6 = { left: Complete5; right: Complete5 };
type Wide7 = { left: Wide6; right: Wide6 };
type Complete7 = { left: Complete6; right: Complete6 };
type Wide8 = { left: Wide7; right: Wide7 };
type Complete8 = { left: Complete7; right: Complete7 };
type Wide9 = { left: Wide8; right: Wide8 };
type Complete9 = { left: Complete8; right: Complete8 };
type Wide10 = { left: Wide9; right: Wide9 };
type Complete10 = { left: Complete9; right: Complete9 };
type Wide11 = { left: Wide10; right: Wide10 };
type Complete11 = { left: Complete10; right: Complete10 };
type Wide12 = { left: Wide11; right: Wide11 };
type Complete12 = { left: Complete11; right: Complete11 };
type Wide13 = { left: Wide12; right: Wide12 };
type Complete13 = { left: Complete12; right: Complete12 };
type Wide14 = { left: Wide13; right: Wide13 };
type Complete14 = { left: Complete13; right: Complete13 };
type Wide15 = { left: Wide14; right: Wide14 };
type Complete15 = { left: Complete14; right: Complete14 };
type Wide16 = { left: Wide15; right: Wide15 };
type Complete16 = { left: Complete15; right: Complete15 };
type Wide17 = { left: Wide16; right: Wide16 };
type Complete17 = { left: Complete16; right: Complete16 };
declare const completeSharedDAG: Complete17;
function preserveSharedDAG(): Wide17 {
  return completeSharedDAG;
}
    `,
    // A wide generic tree can expose more unique structural states than a lint
    // rule should exhaustively traverse. Reaching the analysis budget must
    // abandon the whole function without emitting a partial diagnostic.
    `
type WideTree<T, Depth extends unknown[]> = Depth extends [
  unknown,
  ...infer Rest,
]
  ? {
      left: WideTree<[T, 0], Rest>;
      right: WideTree<[T, 1], Rest>;
    }
  : { value: string | null };
type CompleteTree<T, Depth extends unknown[]> = Depth extends [
  unknown,
  ...infer Rest,
]
  ? {
      left: CompleteTree<[T, 0], Rest>;
      right: CompleteTree<[T, 1], Rest>;
    }
  : { value: string | null };
type TreeDepth = [
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
];
declare const completeWideTree: CompleteTree<string, TreeDepth>;
function analysisBudgetBailout(): WideTree<string, TreeDepth> {
  return completeWideTree;
}
    `,
    // Pathological syntax depth must conservatively bail out instead of
    // overflowing either the rule's recursive projections or the TS checker.
    {
      code: noFormat`
function deeplyNestedPromiseDoesNotOverflow(): Promise<string | null> {
  return Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve(Promise.resolve('ready'))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))));
}
      `,
    },
    `
type ComparisonBit = '0' | '1';
type ComparisonKey =
  \`\${ComparisonBit}\${ComparisonBit}\${ComparisonBit}\${ComparisonBit}\${ComparisonBit}\${ComparisonBit}\${ComparisonBit}\`;
type ComparisonMember<Key extends string, Value> = Key extends unknown
  ? { kind: Key; value: Value }
  : never;
type WideComparisonBudget = ComparisonMember<ComparisonKey, string | null>;
type NarrowComparisonBudget = ComparisonMember<ComparisonKey, string>;
declare const narrowComparisonBudget: NarrowComparisonBudget;
function comparisonBudgetBailout(): WideComparisonBudget {
  return narrowComparisonBudget;
}
    `,
    // An unresolved indexed-access member is decided by the caller's
    // instantiation, and the generic call's result must cover it.
    `
interface RuleMap {
  alpha: { readonly kind: 'alpha' };
  beta: { readonly kind: 'beta' };
}
declare function getRule<Id extends keyof RuleMap>(id: Id): RuleMap[Id];
function maybeGetRule<Id extends keyof RuleMap>(id: Id): RuleMap[Id] | null {
  try {
    return getRule(id);
  } catch {
    return null;
  }
}
    `,
    // A type-parameter member can be instantiated as the returned value
    // (\`T\` may be \`null\`), so its absence in the body proves nothing.
    `
function alwaysEmpty<T>(seed: T): T | null {
  void seed;
  return null;
}
    `,
    // A trailing never-returning call ends the function without an
    // implicit undefined, so nested positions gain no phantom observation.
    `
declare function fail(): never;
function alwaysThrowsViaHelper(): { value: string | null } {
  fail();
}
    `,
    // An incomparable cast pins a contract the operand cannot express;
    // the asserted type is what callers observe.
    `
interface BuiltNode {
  readonly kind: string;
  readonly parent: object;
}
function buildNode(flag: boolean): BuiltNode | undefined {
  if (!flag) {
    return undefined;
  }
  return { kind: 'built' } as BuiltNode;
}
    `,
    // A contextual contract behind a literal-or-callable union property
    // still supplies the return contract the annotation mirrors.
    `
type Level = 0 | 1 | 2 | 'error' | 'off' | 'warn';
interface PropertySchema {
  merge: string | ((first: Level, second: Level) => Level);
}
const levelSchema: PropertySchema = {
  merge(first: Level, second: Level): Level {
    void second;
    return first === 'error' ? 2 : first;
  },
};
void levelSchema;
    `,
    // A possibly-falsy test type keeps both branches reachable.
    `
declare const label: string;
function possiblyFalsyKeepsBranches(): 'ready' | 'fallback' {
  if (label) return 'ready';
  return 'fallback';
}
    `,
    // Beyond the structural depth budget the analysis stops quietly instead
    // of spending unbounded checker time on pathologically deep types.
    `
type Depth1 = [unknown];
type Depth2 = [...Depth1, ...Depth1];
type Depth4 = [...Depth2, ...Depth2];
type Depth8 = [...Depth4, ...Depth4];
type Depth16 = [...Depth8, ...Depth8];
type Depth32 = [...Depth16, ...Depth16];
type Depth64 = [...Depth32, ...Depth32];
type Depth128 = [...Depth64, ...Depth64];
type Depth256 = [...Depth128, ...Depth128];
type Depth512 = [...Depth256, ...Depth256];
type Depth1024 = [...Depth512, ...Depth512];
type Depth1088 = [...Depth1024, ...Depth64];
type DeepValue<T, Depth extends unknown[]> = Depth extends [
  unknown,
  ...infer Rest,
]
  ? { readonly next: DeepValue<T, Rest> }
  : { readonly value: T };
declare const veryDeepText: DeepValue<string, Depth1088>;
function veryDeepAcyclicType(): DeepValue<string | null, Depth1088> {
  return veryDeepText;
}
    `,
    // Index projections only inspect keys covered by the declared signature.
    `
declare const completeSymbolKey: unique symbol;
function completeSymbolIndex(flag: boolean): { [key: symbol]: string | null } {
  const result = {
    [completeSymbolKey]: flag ? 'ready' : null,
    unrelated: 1,
  };
  return result;
}
    `,
    `
const unrelatedTemplateIndexSource = { abc: 1 };
function unrelatedTemplateIndexProperty(): {
  [key: \`\${number}\`]: number | null;
} {
  return unrelatedTemplateIndexSource;
}
    `,
    `
function numberTemplateAcceptsFiniteNumericStrings(): {
  [key: \`\${number}\`]: string | null;
  Infinity: string;
} {
  return { '01': null, '1e3': 'ready', Infinity: 'unrelated' };
}
    `,
    `
function bigintTemplateAcceptsNegativeHex(): {
  [key: \`\${bigint}\`]: string | null;
} {
  return { '-0x10': null, '1': 'ready' };
}
    `,
    `
type MappedTemplateKey = \`data-\${Uppercase<string>}\`;
const dynamicMappedTemplateKey: MappedTemplateKey =
  Math.random() > 0.5 ? 'data-B' : 'data-C';
function stringMappingTemplateIndex(): {
  [key: MappedTemplateKey]: string | null;
} {
  return { [dynamicMappedTemplateKey]: 'ready', 'data-A': null };
}
    `,
    `
const specialNumericIndexSource = {
  0: 'ready',
  '-Infinity': false,
  Infinity: 1,
  NaN: null,
};
function specialNumericIndexKeys(): {
  [key: number]: boolean | number | string | null;
} {
  return specialNumericIndexSource;
}
    `,
    `
declare const overlappingComputedIndexKey: \`data-\${string}\` | 'other';
function overlappingComputedIndexKeyValue(): {
  [key: \`data-\${string}\`]: string | null;
} {
  return { 'data-ready': 'ready', [overlappingComputedIndexKey]: null };
}
    `,
    // Both nested yield expressions are observable, including the inner yield
    // whose result becomes the value of the outer yield.
    `
function* nestedYields(): Generator<string | null, void, null> {
  yield yield 'ready';
}
    `,
    `
async function* delegatedPromises(): AsyncGenerator<string | null> {
  yield* [Promise.resolve('ready'), Promise.resolve(null)];
}
    `,
    // A primitive string is iterable through its apparent type, yielding its
    // characters as `string`.
    `
function* delegatedStringYield(): Generator<string | number> {
  yield* 'ready';
  yield 1;
}
    `,
    `
function spreadStringElements(): (string | number)[] {
  return [...'ready', 1];
}
    `,
    `
function* callerProvidedCompletion(): Generator<
  string,
  number | null,
  unknown
> {
  yield 'ready';
  return 1;
}
callerProvidedCompletion().return(null);
    `,
    `
declare const numberCompletionGenerator: Generator<string, number, unknown>;
function widenedGeneratorCompletion(): Generator<
  string,
  number | null,
  unknown
> {
  return numberCompletionGenerator;
}
widenedGeneratorCompletion().return(null);
    `,
    `
declare const completeIndexedText: { [key: string]: string | null };
function completeReturnedIndex(): { [key: string]: string | null } {
  return completeIndexedText;
}
    `,
    `
declare const optionalIndexedNullOverlay: {} | { status: null };
function optionalIndexSpreadPreservesEarlierValue(): {
  [key: string]: string | null;
} {
  return { status: 'ready', ...optionalIndexedNullOverlay };
}
    `,
    `
interface CompleteSwappedMap<Value, Key> extends Map<Key, Value> {}
function completeSwappedMap(): CompleteSwappedMap<number | null, string> {
  return new Map<string, number | null>([
    ['ready', 1],
    ['empty', null],
  ]);
}
    `,
    `
interface CompleteSwappedGenerator<Return, Yield> extends Generator<
  Yield,
  Return,
  unknown
> {}
function* completeSwappedGenerator(
  flag: boolean,
): CompleteSwappedGenerator<number | null, string | null> {
  yield flag ? 'ready' : null;
  return flag ? 1 : null;
}
    `,
    `
declare const completeGeneratorObject: Generator<
  string,
  number | null,
  unknown
>;
function returnCompleteGeneratorObject(): Generator<
  string,
  number | null,
  unknown
> {
  return completeGeneratorObject;
}
    `,
    `
type CompleteWeakKey = { id: string };
interface CompleteSwappedWeakMap<Value, Key extends object> extends WeakMap<
  Key,
  Value
> {}
function completeSwappedWeakMap(): CompleteSwappedWeakMap<
  string | null,
  CompleteWeakKey
> {
  return new WeakMap<CompleteWeakKey, string | null>([
    [{ id: 'ready' }, 'ready'],
    [{ id: 'empty' }, null],
  ]);
}
    `,
    `
declare const optionalNullOverlay: {} | { value: null };
function optionalSpreadPreservesEarlierValue(): { value: string | null } {
  return { value: 'ready', ...optionalNullOverlay };
}
    `,
    `
interface OverlappingExpectedCallable {
  (value: string): string | null;
}
interface OverlappingSourceCallable {
  (value: 'empty'): null;
  (value: string): string;
}
declare const overlappingSourceCallable: OverlappingSourceCallable;
function overlappingCallableOverloads(): OverlappingExpectedCallable {
  return overlappingSourceCallable;
}
    `,
    // A structurally compatible generator protocol is not necessarily one of
    // the standard-library Generator types whose yielded slot we understand.
    `
interface DomainIterator<T> {
  next(...args: [] | [unknown]): IteratorResult<T, void>;
  return(value: void): IteratorResult<T, void>;
  throw(error: unknown): IteratorResult<T, void>;
  [Symbol.iterator](): DomainIterator<T>;
}
function* opaqueGeneratorProtocol(): DomainIterator<string | null> {
  yield 'ready';
}
    `,
    // `any` remains an escape hatch at nested projected output positions.
    `
declare const opaqueNestedValue: any;
function opaqueArrayElement(): readonly (string | null)[] {
  return opaqueNestedValue;
}
    `,
    `
declare const opaqueNestedValue: any;
function opaqueCallableReturn(): () => string | null {
  return opaqueNestedValue;
}
    `,
    `
declare const opaqueNestedValue: any;
function opaqueWeakReference(): WeakRef<
  { readonly kind: 'idle' } | { readonly kind: 'ready' }
> {
  return opaqueNestedValue;
}
    `,
    // An external Promise executor can call either continuation, so its
    // settlement values cannot be inferred from this function body.
    `
declare const opaquePromiseExecutor: (
  resolve: (value: string | null | PromiseLike<string | null>) => void,
  reject: (reason?: any) => void,
) => void;
function opaquePromiseSettlement(): Promise<string | null> {
  return new Promise(opaquePromiseExecutor);
}
    `,
    // Getter overrides expose the inherited property contract directly.
    `
abstract class GetterContractBase {
  abstract get value(): string | null;
}
class GetterContractDerived extends GetterContractBase {
  override get value(): string | null {
    return 'ready';
  }
}
    `,
    // Individual nested projections preserve an opaque source.
    `
declare const opaqueNestedValue: any;
function opaqueTupleElement(): readonly [string | null] {
  return opaqueNestedValue;
}
    `,
    `
declare const opaqueNestedValue: any;
function opaqueSetElement(): ReadonlySet<string | null> {
  return opaqueNestedValue;
}
    `,
    `
declare const opaqueNestedValue: any;
function opaqueObjectProperty(): { readonly value: string | null } {
  return opaqueNestedValue;
}
    `,
    // Type-invalid partial programs must bail out instead of crashing.
    `
type WeakReferenceValue =
  { readonly kind: 'idle' } | { readonly kind: 'ready' };
function incompleteWeakReference(): WeakRef<WeakReferenceValue> {
  return {};
}
    `,
    `
type WeakSetValue = { readonly kind: 'idle' } | { readonly kind: 'ready' };
function incompleteWeakSet(): WeakSet<WeakSetValue> {
  return {
    has() {
      return true;
    },
  };
}
    `,
    `
interface MissingValueIterator {
  next(): { done?: false };
}
interface MissingValueIterable {
  [Symbol.iterator](): MissingValueIterator;
}
declare const missingValueIterable: MissingValueIterable;
function incompleteIterableResult(): Iterable<string | null> {
  return missingValueIterable;
}
    `,
    // A partial program with disjoint callable parameters keeps every source
    // return possibility instead of guessing at signature correspondence.
    `
interface DisjointExpectedCallable {
  (value: string): string | null;
}
interface DisjointSourceCallable {
  (value: boolean): string | null;
}
declare const disjointSourceCallable: DisjointSourceCallable;
function disjointCallableParameters(): DisjointExpectedCallable {
  return disjointSourceCallable;
}
    `,
    // Missing numeric index information in a partial program cannot prove an
    // array element constituent absent.
    `
function incompleteArrayProjection(): readonly (string | null)[] {
  return {};
}
    `,
    // Unknown object spreads can populate any string index value.
    `
declare const opaqueIndexSpread: any;
function opaqueIndexValues(): { readonly [key: string]: string | null } {
  return { ...opaqueIndexSpread };
}
    `,
    // A Promise without an inspectable executor is opaque in a partial
    // type-invalid program.
    `
function missingPromiseExecutor(): Promise<string | null> {
  return new Promise();
}
    `,
    // Dynamic loop and logical conditions keep their yielded branch reachable.
    `
type TextGenerator = Generator<string | null, void, unknown>;
function* reachableForYield(flag: boolean): TextGenerator {
  for (; flag;) {
    yield null;
    break;
  }
  yield 'ready';
}
    `,
    `
type TextGenerator = Generator<string | null, void, unknown>;
function* reachableLogicalYield(flag: boolean): TextGenerator {
  flag && (yield null);
  yield 'ready';
}
    `,
    `
type TextGenerator = Generator<string | null, void, unknown>;
function* reachableWhileYield(flag: boolean): TextGenerator {
  while (flag) {
    yield null;
    break;
  }
  yield 'ready';
}
    `,
    // Computed literal method names still inherit contextual contracts.
    `
interface ComputedMethodContract {
  read(): string | null;
}
const computedMethodContract: ComputedMethodContract = {
  ['read'](): string | null {
    return 'ready';
  },
};
    `,
    {
      code: `
function checkedStringIndex(
  values: Readonly<Record<string, string>>,
): string | undefined {
  return values['known'];
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
interface MixedNodes extends NodeListOf<HTMLDivElement | SVGElement> {
  readonly source: 'mixed';
}
declare const mixedNodes: MixedNodes;
function completeNodeList(): NodeListOf<HTMLDivElement | SVGElement> {
  return mixedNodes;
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.lib-dom.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
  ],
  invalid: [
    {
      code: noFormat`
function unrelatedNestedDepth(): string | null {
  const ignored = () => !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!0;
  void ignored;
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Original #6442 cases and the literal/primitive relationship agreed on in
    // the issue discussion.
    {
      code: `
function original(): string | null {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function text(): string | undefined {
  return 'ready';
}
      `,
      errors: [
        {
          column: 16,
          data: { annotated: 'string | undefined', unused: 'undefined' },
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
function text(): string | void {
  return 'ready';
}
      `,
      errors: [
        {
          column: 16,
          data: { annotated: 'string | void', unused: 'void' },
          endColumn: 31,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
function knownTupleIndex(value: readonly [string]): string | undefined {
  return value[0];
}
      `,
      errors: [
        {
          column: 51,
          data: { annotated: 'string | undefined', unused: 'undefined' },
          endColumn: 71,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
type MaybeText = string | undefined;
function aliasedUndefined(): MaybeText {
  return 'ready';
}
      `,
      errors: [
        {
          column: 28,
          data: { annotated: 'MaybeText', unused: 'undefined' },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
function primitiveBooleanWithUnusedNull(): boolean | null {
  return true;
}
      `,
      errors: [
        {
          data: { annotated: 'boolean | null', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type WideContextualReturn = () => string | number | null;
const narrowedContextualReturn: WideContextualReturn = (): string | null =>
  'ready';

class WideReturnBase {
  read(flag: 0 | 1 | 2): string | number | null {
    if (flag === 0) return 'ready';
    return flag === 1 ? 1 : null;
  }
}
class NarrowReturnOverride extends WideReturnBase {
  override read(): string | null {
    return 'ready';
  }
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
interface InstanceReader {
  read(): string | null;
}
class StaticReader implements InstanceReader {
  read(): string {
    return 'ready';
  }
  static read(): string | null {
    return 'ready';
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: "const conciseArrow = (): string | null => 'ready';",
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
const directObjectMethod = {
  read(): string | null {
    return 'ready';
  },
};
const getterOnlyObject = {
  get value(): string | null {
    return 'ready';
  },
};
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function transparentExpressionWrappers(): 'ready' | 'idle' {
  return 'ready' as const satisfies string;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function wideningAssertion(): string | null {
  return 'ready' as string;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
class OriginalClass {
  static read(): string | null {
    return 'ready';
  }
  read(): string | null {
    return 'ready';
  }
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function literalSubset(): 'loading' | 'idle' {
  return 'loading';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type TextAlias = string;
type Count = number;
function inlineAliases(): TextAlias | Count {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
enum State {
  Loading,
  Ready,
}
function enumSubset(): State.Loading | State.Ready {
  return State.Loading;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const firstSymbol: unique symbol;
declare const secondSymbol: unique symbol;
function symbolSubset(): typeof firstSymbol | typeof secondSymbol {
  return firstSymbol;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function shapeSubset(): { kind: 'one' } | { kind: 'two' } {
  return { kind: 'one' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type FirstCallback = () => 1;
type SecondCallback = () => 2;
declare const firstCallback: FirstCallback;
function callbackSubset(): FirstCallback | SecondCallback {
  return firstCallback;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const brand: unique symbol;
type Branded = { value: string } & { readonly [brand]: true };
declare const branded: Branded;
function intersectionConstituent():
  ({ value: string } & { readonly [brand]: true }) | null {
  return branded;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Type parameters, conditional types, mapped types, and indexed access
    // types are safe when they are explicit top-level union constituents: the
    // implementation returns that same constituent and not the sibling.
    {
      code: `
function generic<T>(value: T): T | null {
  return value;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function wrapNarrowCall<T>(value: T): { readonly value: T };
function resolvedGenericCall(): { readonly value: 'idle' | 'ready' } {
  return wrapNarrowCall('ready' as const);
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function selectNarrowCall(value: 'ready'): {
  readonly state: 'ready';
};
declare function selectNarrowCall(value: string): {
  readonly state: 'idle' | 'ready';
};
function resolvedOverloadCall(): { readonly state: 'idle' | 'ready' } {
  return selectNarrowCall('ready');
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function narrowedGeneric<T extends string | null>(value: T): string | null {
  if (value === null) {
    return 'fallback';
  }
  return value;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type Result = string | null;
function aliasedReturn(): Result {
  return 'ready';
}
      `,
      errors: [
        {
          data: { annotated: 'Result', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type Maybe<T> = T | null;
function genericAlias<T>(value: T): Maybe<T> {
  return value;
}
      `,
      errors: [
        {
          data: { annotated: 'Maybe<T>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type ObjectResult = { readonly value: string | null };
function objectAlias(): ObjectResult {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface InterfaceResult {
  readonly value: string | null;
}
function interfaceResult(): InterfaceResult {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type Box<T> = { readonly value: T };
declare const textBox: Box<string>;
function genericObjectAlias(): Box<string | null> {
  return textBox;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type TextPromise = Promise<string | null>;
declare const promisedText: Promise<string>;
function opaquePromiseAlias(): TextPromise {
  return promisedText;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type TextArray = ReadonlyArray<string | null>;
declare const textArray: readonly string[];
function opaqueArrayAlias(): TextArray {
  return textArray;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type Model = { ready: 1; idle: 2 };
function keyOfAlias(): keyof Model {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type MappedResult = { readonly [Key in 'value']: string | null };
function mappedObjectAlias(): MappedResult {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type FullResult = { readonly value: string | null; count: number };
function pickedObject(): Pick<FullResult, 'value'> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type Handler = () => string | null;
declare const textHandler: () => string;
function functionAlias(): Handler {
  return textHandler;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function createStableReader() {
  let value: string | null = 'ready';
  return function stableReader(): string | null {
    return value;
  };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface RecursiveResult {
  readonly next?: RecursiveResult;
  readonly value: string | null;
}
function recursiveAlias(): RecursiveResult {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Deep but acyclic structures are analyzed within the depth budget; the
    // cycle memoization must not mistake repetition for a cycle.
    {
      code: `
type Depth1 = [unknown];
type Depth2 = [...Depth1, ...Depth1];
type Depth4 = [...Depth2, ...Depth2];
type Depth8 = [...Depth4, ...Depth4];
type Depth16 = [...Depth8, ...Depth8];
type DeepValue<T, Depth extends unknown[]> = Depth extends [
  unknown,
  ...infer Rest,
]
  ? { readonly next: DeepValue<T, Rest> }
  : { readonly value: T };
declare const deepText: DeepValue<string, Depth16>;
function deepAcyclicType(): DeepValue<string | null, Depth16> {
  return deepText;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type AliasLeaf = { readonly value: string | null };
type AliasEnvelope = Promise<Readonly<AliasLeaf>>;
async function nestedAliasChain(): AliasEnvelope {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
import type { ImportedResult } from './no-misleading-return-type';
function importedAlias(): ImportedResult {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
import { type ImportedBox, importedTextBox } from './no-misleading-return-type';
function importedGenericAlias(): ImportedBox<string | null> {
  return importedTextBox;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
import type { ImportedEnvelope } from './no-misleading-return-type';
async function importedNestedAlias(): ImportedEnvelope<string | null> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type ExtractedState = Extract<'ready' | 'idle' | 0, string>;
function concreteConditional(): ExtractedState {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type IntersectedResult = { readonly value: string | null } & {
  readonly tag: 'result';
};
function intersectionAlias(): IntersectedResult {
  return { value: 'ready', tag: 'result' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type StatefulArray = string[] & { readonly state: 'ready' | 'idle' };
declare const readyArray: string[] & { readonly state: 'ready' };
function builtinIntersection(): StatefulArray {
  return readyArray;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type EventName = \`on\${'Ready' | 'Idle'}\`;
function templateLiteralUnion(): EventName {
  return 'onReady';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type ReturnedState = ReturnType<() => 'ready' | 'idle'>;
function utilityReturnType(): ReturnedState {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function bigintSubset(): 1n | 2n {
  return BigInt(1) as 1n;
}
type DataKey = \`data-\${string}\`;
function templatePattern(): DataKey | null {
  return 'data-ready';
}
type UpperState = Uppercase<'ready' | 'idle'>;
function intrinsicStringMapping(): UpperState {
  return 'READY';
}
function noInferGeneric<T>(value: T): NoInfer<T> | null {
  return value;
}
function genericKey<T>(key: keyof T): keyof T | null {
  return key;
}
type NullableParameter = (value: string | null) => void;
declare const textParameter: readonly [string];
function utilityTuple(): Readonly<Parameters<NullableParameter>> {
  return textParameter;
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
declare const queriedValue: { readonly value: string | null };
declare const queriedText: { readonly value: string };
function typeQuery(): typeof queriedValue {
  return queriedText;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type Accessors<T> = {
  readonly [Key in keyof T as \`get\${Capitalize<string & Key>}\`]: T[Key];
};
function keyRemappedMappedType(): Accessors<{ state: string | null }> {
  return { getState: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function capitalizeStringIndex(): {
  readonly [key: \`get\${Capitalize<string>}\`]: 'A' | 'B';
  readonly getState: 'A';
  readonly getother: 'B';
} {
  return { getState: 'A', getother: 'B' };
}
function uppercaseStringIndex(): {
  readonly [key: Uppercase<string>]: 'A' | 'B';
  readonly READY: 'A';
  readonly ready: 'B';
} {
  return { READY: 'A', ready: 'B' };
}
function lowercaseStringIndex(): {
  readonly [key: Lowercase<string>]: 'A' | 'B';
  readonly ready: 'A';
  readonly READY: 'B';
} {
  return { ready: 'A', READY: 'B' };
}
function uncapitalizeStringIndex(): {
  readonly [key: Uncapitalize<string>]: 'A' | 'B';
  readonly ready: 'A';
  readonly Ready: 'B';
} {
  return { ready: 'A', Ready: 'B' };
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
namespace Domain {
  export interface Promise<T> {
    readonly value: T;
  }
}
declare const domainText: Domain.Promise<string>;
function shadowedBuiltin(): Domain.Promise<string | null> {
  return domainText;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
class FluentResult {
  narrow(): this | null {
    return this;
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type IndexedModel = { state: 'ready' | 'idle' };
function concreteIndexedAccess(): IndexedModel['state'] {
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type OmittedSource = { readonly value: string | null; ignored: number };
function omittedObject(): Omit<OmittedSource, 'ignored'> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function partialObject(): Partial<{ readonly value: string | null }> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function recordedObject(): Readonly<Record<'value', string | null>> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type Conditional<T> = T extends string ? string : number;
function conditional<T>(value: Conditional<T>): Conditional<T> | null {
  return value;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type DeferredValueBox<T extends boolean> = {
  readonly value: T extends true ? string : number;
};
function constrainedDeferredMember<T extends boolean>(
  value: DeferredValueBox<T>,
): { readonly value: string | number | null } {
  return value;
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly value: string | number | null; }',
            unused: 'null',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type DeferredIndexedValue<
  K extends PropertyKey,
  T extends Record<K, string | number>,
> = { readonly value: T[K] };
function constrainedIndexedMember<
  K extends PropertyKey,
  T extends Record<K, string | number>,
>(
  value: DeferredIndexedValue<K, T>,
): {
  readonly value: string | number | null;
} {
  return value;
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly value: string | number | null; }',
            unused: 'null',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type Mapped<T> = { [Key in keyof T]: T[Key] };
function mapped<T>(value: Mapped<T>): Mapped<T> | null {
  return value;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function indexed<T, Key extends keyof T>(value: T[Key]): T[Key] | null {
  return value;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function enclosingGeneric<T>(value: T) {
  return function nested(): T | null {
    return value;
  };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Promise and PromiseLike positions use awaited semantics for both async
    // and synchronous functions.
    {
      code: `
async function asyncPromise(): Promise<string | null> {
  return 'ready';
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function syncPromise(): Promise<string | null> {
  return Promise.resolve('ready');
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function promiseConstructor(): Promise<string | null> {
  return new Promise(resolve => {
    resolve('ready');
  });
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function staticPromiseField(): Promise<string | null> {
  return new Promise(resolve => {
    class Holder {
      static value = resolve('ready');
    }
    void Holder;
  });
}
function staticPromiseFieldThroughLocalFunction(): Promise<string | null> {
  return new Promise(resolve => {
    function settle(): void {
      resolve('ready');
    }
    class Holder {
      static value = settle();
    }
    void Holder;
  });
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function nestedPromiseConstructor(): Promise<string | null> {
  return new Promise(resolve => {
    resolve(Promise.resolve('ready'));
  });
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function unusedPromiseResolverClosure(): Promise<string | null> {
  return new Promise(resolve => {
    function neverInvoked() {
      resolve(null);
    }
    resolve('ready');
  });
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function unusedPromiseResolverArrow(): Promise<string | null> {
  return new Promise(resolve => {
    const neverInvoked = () => resolve(null);
    resolve('ready');
  });
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function unreachablePromiseSettlement(): Promise<string | null> {
  return new Promise(resolve => {
    resolve('ready');
    return;
    resolve(null);
  });
}
function repeatedPromiseSettlement(): Promise<string | null> {
  return new Promise(resolve => {
    resolve('ready');
    resolve(null);
  });
}
function branchedThenSettledPromise(
  flag: boolean,
): Promise<string | number | null> {
  return new Promise(resolve => {
    if (flag) resolve('ready');
    resolve(null);
    resolve(1);
  });
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        {
          data: {
            annotated: 'Promise<string | number | null>',
            unused: 'number',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function rejectionIsASettlementBarrier(flag: boolean): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (flag) resolve('ready');
    else reject(new Error('rejected'));
    resolve(null);
  });
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function wrappedPromiseSettlement(): Promise<string | null> {
  return new Promise(resolve => {
    void resolve('ready');
    resolve(null);
  });
}
function sequencedPromiseSettlement(): Promise<string | null> {
  return new Promise(resolve => {
    (resolve('ready'), resolve(null));
  });
}
function nestedPromiseSettlement(): Promise<string | null> {
  return new Promise(resolve => {
    resolve((resolve(null), 'ready'));
  });
}
      `,
      errors: [
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
        {
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
        {
          data: { annotated: 'Promise<string | null>', unused: 'string' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface CustomPromise<T> extends PromiseLike<T> {}
declare const textPromise: CustomPromise<string>;
function customPromise(): CustomPromise<string | null> {
  return textPromise;
}
      `,
      errors: [
        {
          data: { annotated: 'CustomPromise<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const fulfilledText: PromiseFulfilledResult<string>;
function fulfilledResult(): PromiseFulfilledResult<string | null> {
  return fulfilledText;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function propertyDescriptor(): Readonly<
  TypedPropertyDescriptor<string | null>
> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const textIteratorResult: IteratorResult<string, number>;
function iteratorResult(): IteratorResult<string | null, number | boolean> {
  return textIteratorResult;
}
      `,
      errors: [
        {
          data: {
            annotated: 'IteratorResult<string | null, number | boolean>',
            unused: 'null | boolean',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Readonly collection projections inspect the content position rather
    // than incorrectly reporting the entire returned container.
    {
      code: `
function mutableArray(): Array<string | null> {
  return ['ready'];
}
function mutableObjectProperty(): { value: string | null } {
  return { value: 'ready' };
}
function mutableTuple(): [string | null] {
  return ['ready'];
}
function mutableIndex(): { [key: string]: string | null } {
  return { state: 'ready' };
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
const mutableCollectionKey = {};
function mutableSet(): Set<string | null> {
  return new Set(['ready']);
}
function mutableMap(): Map<'ready' | 'idle', number | null> {
  return new Map([['ready', 1]]);
}
function mutableWeakMap(): WeakMap<object, string | null> {
  return new WeakMap([[mutableCollectionKey, 'ready']]);
}
type ReadyWeakValue = { readonly kind: 'ready' };
type IdleWeakValue = { readonly kind: 'idle' };
const readyWeakValue: ReadyWeakValue = { kind: 'ready' };
function mutableWeakSet(): WeakSet<ReadyWeakValue | IdleWeakValue> {
  return new WeakSet([readyWeakValue]);
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function arrayGeneric(): ReadonlyArray<string | null> {
  return ['ready'];
}
      `,
      errors: [
        {
          data: { annotated: 'readonly (string | null)[]', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function arraySyntax(): readonly (string | null)[] {
  return ['ready'];
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const textArrayLike: ArrayLike<string>;
function arrayLike(): ArrayLike<string | null> {
  return textArrayLike;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const htmlNodes: NodeListOf<HTMLDivElement>;
function narrowedNodeList(): NodeListOf<HTMLDivElement | SVGElement> {
  return htmlNodes;
}
      `,
      errors: [
        {
          column: 28,
          endColumn: 69,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.lib-dom.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
declare const spreadTextValues: string[];
function spreadArray(): ReadonlyArray<string | null> {
  return [...spreadTextValues];
}
function sparseArray(): ReadonlyArray<string | null | undefined> {
  return ['ready', ,];
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function tupleElement(): readonly [string | null, number] {
  return ['ready', 1];
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function tupleVariant(): [string] | [string, number] {
  return ['ready'];
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function namedReadonlyTuple(): readonly [value: string | null, count?: number] {
  return ['ready'];
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function restTuple(): readonly [head: string, ...tail: (number | null)[]] {
  return ['ready', 1, 2];
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function setElement(): ReadonlySet<string | null> {
  return new Set(['ready']);
}
      `,
      errors: [
        {
          data: { annotated: 'ReadonlySet<string | null>', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function mapValue(): ReadonlyMap<string, number | null> {
  return new Map([['count', 1]]);
}
      `,
      errors: [
        {
          data: {
            annotated: 'ReadonlyMap<string, number | null>',
            unused: 'null',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function readonlyMapKey(): ReadonlyMap<string | null, number> {
  return new Map([['count', 1]]);
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type FirstWeakRefValue = { kind: 'first' };
type SecondWeakRefValue = { kind: 'second' };
declare const firstWeakRef: WeakRef<FirstWeakRefValue>;
function weakRefValue(): WeakRef<FirstWeakRefValue | SecondWeakRefValue> {
  return firstWeakRef;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface Values<T> extends Iterable<T> {}
declare const textValues: Values<string>;
function customIterable(): Values<string | null> {
  return textValues;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface NullableSet extends ReadonlySet<string | null> {}
declare const derivedTextSet: ReadonlySet<string>;
function derivedSet(): NullableSet {
  return derivedTextSet;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface StatefulSet extends Set<string> {
  readonly state: 'ready' | 'idle';
}
declare const readySet: Set<string> & { readonly state: 'ready' };
function derivedSetProperty(): StatefulSet {
  return readySet;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface TaggedSet<Tag, Value> extends ReadonlySet<Value> {}
declare const taggedTextSet: ReadonlySet<string>;
function reorderedSet(): TaggedSet<'tag', string | null> {
  return taggedTextSet;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface NullableMap extends ReadonlyMap<string, number | null> {}
declare const derivedNumberMap: ReadonlyMap<string, number>;
function derivedMap(): NullableMap {
  return derivedNumberMap;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface NullableValues extends Iterable<string | null> {}
declare const derivedTextValues: Iterable<string>;
function derivedIterable(): NullableValues {
  return derivedTextValues;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
async function nestedContainers(): Promise<ReadonlyArray<string | null>> {
  return ['ready'];
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const textTupleAsArray: readonly [string];
function tupleProjectedAsArray(): ReadonlyArray<string | null> {
  return textTupleAsArray;
}
function sparseTupleRest(): readonly [
  string,
  ...(string | null | undefined)[],
] {
  return ['ready', , 'ready'];
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    // Generic variadic tuple elements contribute their constrained element
    // type when the tuple is projected through an array return type.
    {
      code: `
function genericVariadicArray<T extends readonly number[]>(
  value: readonly [string, ...T],
): readonly (string | number | null)[] {
  return value;
}
      `,
      errors: [
        {
          column: 2,
          data: {
            annotated: 'readonly (string | number | null)[]',
            unused: 'null',
          },
          endColumn: 39,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Readonly structural return types expose output-only property, index, and
    // callback positions that can be projected with public checker APIs.
    {
      code: `
function objectProperty(): { readonly value: string | null } {
  return { value: 'ready' };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly value: string | null; }',
            unused: 'null',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const spreadTextResult: { value: string };
function objectSpreadProperty(): { readonly value: string | null } {
  return { ...spreadTextResult };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function nonEnumerableArrayPropertyIsNotSpread(): {
  readonly length: number | string;
} {
  const base = { length: 'kept' };
  return { ...base, ...[] };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly length: string | number; }',
            unused: 'number',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function enumerableArrayIndexIsSpread(): { readonly 0: string | null } {
  return { ...['ready'] };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
class PrototypeSpreadValue {
  get value(): null {
    return null;
  }
}
function prototypeGetterIsNotSpread(flag: boolean): {
  readonly value: string | null;
} {
  return {
    value: 'ready',
    ...(flag ? new PrototypeSpreadValue() : {}),
  };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const optionalNullOverlay: {} | { value: null };
function optionalSpreadStillExcludesNumber(): {
  readonly value: string | number | null;
} {
  return { value: 'ready', ...optionalNullOverlay };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly value: string | number | null; }',
            unused: 'number',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function nestedObjectProperty(): {
  readonly state: { readonly value: 'on' | 'off' };
} {
  return { state: { value: 'on' } };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly state: { readonly value: "on" | "off"; }; }',
            unused: '"off"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function stringIndex(): { readonly [key: string]: string | null } {
  return { status: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const nullableStatusSpread: { status: null };
function explicitIndexPropertyOverridesSpread(): {
  readonly [key: string]: string | null;
} {
  return { ...nullableStatusSpread, status: 'ready' };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly [key: string]: string | null; }',
            unused: 'null',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function laterIndexSpreadOverridesEarlierSpread(): {
  readonly [key: string]: 'ready' | 'idle';
} {
  return { ...{ status: 'idle' }, ...{ status: 'ready' } };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly [key: string]: "ready" | "idle"; }',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const nullableStringIndex: Record<string, string | null>;
function indexBearingSpread(): Readonly<
  Record<string, string | number | null>
> {
  return { fixed: 'ready', ...nullableStringIndex };
}
      `,
      errors: [
        {
          data: {
            annotated: 'Readonly<Record<string, string | number | null>>',
            unused: 'number',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function callbackProperty(): { readonly callback: () => string | null } {
  return { callback: () => 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function objectMethodProperty(): { readonly callback: () => string | null } {
  return {
    callback() {
      return 'ready';
    },
  };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function returnedArrowLiteralUnion(): () => 'ready' | 'idle' {
  return () => 'ready';
}
function returnedFunctionLiteralUnion(): () => 'ready' | 'idle' {
  return function () {
    return 'ready';
  };
}
function returnedMethodLiteralUnion(): {
  readonly read: () => 'ready' | 'idle';
} {
  return {
    read() {
      return 'ready';
    },
  };
}
function returnedGetterLiteralUnion(): {
  readonly value: 'ready' | 'idle';
} {
  return {
    get value() {
      return 'ready' as const;
    },
  };
}
      `,
      errors: [
        {
          data: {
            annotated: '() => "ready" | "idle"',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
        {
          data: {
            annotated: '() => "ready" | "idle"',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
        {
          data: {
            annotated: '{ readonly read: () => "ready" | "idle"; }',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
        {
          data: {
            annotated: '{ readonly value: "ready" | "idle"; }',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const computedPropertyKey: unique symbol;
function computedSymbolProperty(): {
  readonly [computedPropertyKey]: string | null;
} {
  return { [computedPropertyKey]: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
const computedStringKey = 'value' as const;
function computedStringProperty(): { readonly value: 'ready' | 'idle' } {
  return { [computedStringKey]: 'ready' };
}
declare const spreadIdleResult: { value: 'idle' };
function explicitPropertyOverridesSpread(): {
  readonly value: 'ready' | 'idle';
} {
  return { ...spreadIdleResult, value: 'ready' };
}
      `,
      errors: [
        {
          data: {
            annotated: '{ readonly value: "ready" | "idle"; }',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
        {
          data: {
            annotated: '{ readonly value: "ready" | "idle"; }',
            unused: '"idle"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface ServiceResult {
  readonly read: () => string | null;
}
declare const textService: { read(): string };
function methodSignature(): ServiceResult {
  return textService;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface ResultConstructor {
  new (): { readonly value: string | null };
}
declare const TextResult: new () => { value: string };
function constructSignature(): ResultConstructor {
  return TextResult;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const directTextFunction: () => string;
function directFunctionType(): () => string | null {
  return directTextFunction;
}
declare const DirectTextConstructor: new () => string;
function directConstructorType(): new () => string | null {
  return DirectTextConstructor;
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
interface WideCallableOverloads {
  (): 'zero' | 'from-string';
  (value: string): 'from-string' | 'from-number';
  (value: number): 'from-number';
}
interface NarrowCallableOverloads {
  (): 'zero';
  (value: string): 'from-string';
  (value: number): 'from-number';
}
declare const narrowCallableOverloads: NarrowCallableOverloads;
function callableOverloadProjection(): WideCallableOverloads {
  return narrowCallableOverloads;
}
      `,
      errors: [
        {
          data: {
            annotated: 'WideCallableOverloads',
            unused: '"from-string" | "from-number"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface WideGenericCallableOverloads {
  <T extends string>(value: T): 'from-string' | 'from-number';
  <T extends number>(value: T): 'from-number';
}
interface NarrowGenericCallableOverloads {
  <T extends string>(value: T): 'from-string';
  <T extends number>(value: T): 'from-number';
}
declare const narrowGenericCallableOverloads: NarrowGenericCallableOverloads;
function genericCallableOverloadProjection(): WideGenericCallableOverloads {
  return narrowGenericCallableOverloads;
}
      `,
      errors: [
        {
          data: {
            annotated: 'WideGenericCallableOverloads',
            unused: '"from-number"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface BigIntCallableResult {
  (
    value: bigint,
  ):
    | 'bigint'
    | 'boolean'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'symbol'
    | 'undefined';
}
interface PrimitiveCallableOverloads {
  (value: bigint): 'bigint';
  (value: boolean): 'boolean';
  (value: null): 'null';
  (value: number): 'number';
  (value: object): 'object';
  (value: string): 'string';
  (value: symbol): 'symbol';
  (value: undefined): 'undefined';
}
declare const primitiveCallableOverloads: PrimitiveCallableOverloads;
function primitiveCallableProjection(): BigIntCallableResult {
  return primitiveCallableOverloads;
}
      `,
      errors: [
        {
          data: {
            annotated: 'BigIntCallableResult',
            unused:
              '"string" | "number" | "boolean" | "symbol" | "undefined" | "object" | "null"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface WideRestCallableOverloads {
  (value: string, ...rest: string[]): 'from-string' | 'from-number';
  (value: number, ...rest: number[]): 'from-number';
}
interface NarrowRestCallableOverloads {
  (value: string, ...rest: string[]): 'from-string';
  (value: number, ...rest: number[]): 'from-number';
}
declare const narrowRestCallableOverloads: NarrowRestCallableOverloads;
function restCallableOverloadProjection(): WideRestCallableOverloads {
  return narrowRestCallableOverloads;
}
      `,
      errors: [
        {
          data: {
            annotated: 'WideRestCallableOverloads',
            unused: '"from-number"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface WideVariadicSuffix {
  (...args: [...string[], number]): 'matching' | 'disjoint';
}
function variadicSuffixSource(...args: [...string[], number]): 'matching';
function variadicSuffixSource(...args: [...string[], boolean]): 'disjoint';
function variadicSuffixSource(
  ...args: (string | number | boolean)[]
): 'matching' | 'disjoint' {
  return typeof args.at(-1) === 'number' ? 'matching' : 'disjoint';
}
function disjointVariadicSuffix(): WideVariadicSuffix {
  return variadicSuffixSource;
}
      `,
      errors: [
        {
          data: {
            annotated: 'WideVariadicSuffix',
            unused: '"disjoint"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type ConstrainedVariadicTarget = (
  ...args: [...string[], number]
) => 'matching' | 'disjoint';
declare function constrainedVariadicSource<T extends [...string[], number]>(
  ...args: T
): 'matching';
declare function constrainedVariadicSource<T extends [...number[], string]>(
  ...args: T
): 'disjoint';
function constrainedVariadicSuffix(): ConstrainedVariadicTarget {
  return constrainedVariadicSource;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface WideConstructableOverloads {
  new (): { readonly kind: 'zero' | 'from-string' };
  new (value: string): { readonly kind: 'from-string' | 'from-number' };
  new (value: number): { readonly kind: 'from-number' };
}
interface NarrowConstructableOverloads {
  new (): { readonly kind: 'zero' };
  new (value: string): { readonly kind: 'from-string' };
  new (value: number): { readonly kind: 'from-number' };
}
declare const NarrowConstructable: NarrowConstructableOverloads;
function constructableOverloadProjection(): WideConstructableOverloads {
  return NarrowConstructable;
}
      `,
      errors: [
        {
          data: {
            annotated: 'WideConstructableOverloads',
            unused: '"from-string" | "from-number"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function numberIndex(): { readonly [key: number]: string | null } {
  return { 0: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const symbolKey: unique symbol;
function symbolIndex(): { readonly [key: symbol]: string | null } {
  const result = { [symbolKey]: 'ready', unrelated: null };
  return result;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const unrelatedSymbol: unique symbol;
function stringIndexIgnoresSymbols(): {
  readonly [key: string]: string | null;
} {
  return { status: 'ready', [unrelatedSymbol]: null };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
const shorthandIndexValue = 'ready';
function shorthandStringIndex(): {
  readonly [key: string]: string | null;
} {
  return { shorthandIndexValue };
}
function getterStringIndex(): {
  readonly [key: string]: string | null;
} {
  return {
    get value(): string {
      return 'ready';
    },
  };
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function templateIndex(): {
  readonly [key: \`data-\${string}\`]: string | null;
} {
  const result = { 'data-ready': 'ready', unrelated: null };
  return result;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function finiteNumericStringTemplateIndex(): {
  readonly [key: \`\${number}\`]: string | null;
} {
  return { '01': 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function bigintTemplateIgnoresFraction(): {
  readonly [key: \`\${bigint}\`]: string | null;
  readonly '1.5': null;
} {
  return { '1': 'ready', '1.5': null };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function bigintTemplateRejectsLeadingPlus(): {
  readonly [key: \`\${bigint}\`]: 'A' | 'B';
  readonly '+1': 'B';
} {
  return { '+1': 'B', '1': 'A' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function intrinsicTemplateIgnoresUnrelatedKeys(): {
  readonly [key: \`value-\${boolean | null | undefined}-\${string}\`]:
    string | null;
  readonly 'value-other': null;
} {
  return { 'value-other': null, 'value-true-result': 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type UppercaseThenCapitalize = \`data-\${Capitalize<Uppercase<string>>}\`;
function nestedStringMapping(): {
  readonly [key: UppercaseThenCapitalize]: 'A' | 'B';
  readonly 'data-Abc': 'B';
} {
  return { 'data-ABC': 'A', 'data-Abc': 'B' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface WideSpecializedIndex {
  readonly [key: string]: string | null;
  readonly [key: \`data-\${string}\`]: string | null;
}
interface NarrowSpecializedIndex {
  readonly [key: string]: string | null;
  readonly [key: \`data-\${string}\`]: string;
}
declare const narrowSpecializedIndex: NarrowSpecializedIndex;
function specializedIndexPrecedence(): WideSpecializedIndex {
  return narrowSpecializedIndex;
}
      `,
      errors: [
        {
          data: { annotated: 'WideSpecializedIndex', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const indexedText: { readonly [key: string]: string };
function returnedIndexSignature(): {
  readonly [key: string]: string | null;
} {
  return indexedText;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const weakKey: object;
declare const narrowWeakMap: WeakMap<object, string>;
function returnedWeakMap(): WeakMap<object, string | null> {
  return narrowWeakMap;
}
function constructedWeakMap(): WeakMap<object, string | null> {
  return new WeakMap([[weakKey, 'ready']]);
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function readonlyProperty(): Readonly<{ value: string | null }> {
  return { value: 'ready' };
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
class NarrowFieldReturn {
  private readonly value = 'ready';
  read(): string | null {
    return this.value;
  }
}
declare const narrowIndexedValues: readonly string[];
function indexedAccessReturn(): string | null {
  return narrowIndexedValues[0];
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function omittedOptionalProperty(): {
  readonly value?: string | null;
} {
  return {};
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Getters and generator yielded-value positions are independently
    // analyzable.
    {
      code: `
const computedKey = 'value' as const;
class ComputedGetter {
  get [computedKey](): string | null {
    return 'ready';
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
class AccessorPairSubset {
  get value(): string | null {
    return 'ready';
  }
  set value(value: string | null) {}
}
      `,
      errors: [
        {
          column: 14,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function* directYield(): Generator<string | null> {
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function* noReachableYield(): Generator<'ready' | undefined, void, unknown> {}
      `,
      errors: [
        {
          column: 29,
          data: {
            annotated: 'Generator<"ready" | undefined, void, unknown>',
            unused: 'undefined | "ready"',
          },
          endColumn: 76,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
function* bareYield(): Generator<string | null | undefined> {
  yield;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const values: Iterable<string>;
function* delegatedYield(): Generator<string | null> {
  yield* values;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function* delegatedCompletion(): Generator<string, number, unknown> {
  yield 'ready';
  return 1;
}
function* returnDelegatedCompletion(): Generator<
  string | null,
  number,
  unknown
> {
  return yield* delegatedCompletion();
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
async function* asyncYield(): AsyncGenerator<string | null> {
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
async function* asyncYieldFirstPromiseSettlement(): AsyncGenerator<
  string | null
> {
  const promised: Promise<string | null> = new Promise(resolve => {
    resolve('ready');
    resolve(null);
  });
  yield promised;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const asyncTextValues: AsyncIterable<string>;
async function* delegatedAsyncYield(): AsyncGenerator<string | null> {
  yield* asyncTextValues;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function* constantDeadYield(): Generator<string | null> {
  if (false) {
    yield null;
  }
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
type TextGenerator = Generator<string | null, void, unknown>;
function* aliasedGenerator(): TextGenerator {
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface DerivedGenerator extends Generator<string | null, void, unknown> {}
function* derivedGenerator(): DerivedGenerator {
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
interface SwappedGenerator<Return, Yield> extends Generator<
  Yield,
  Return,
  unknown
> {}
function* reorderedGenerator(): SwappedGenerator<void, string | null> {
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function* unreachableYield(): Generator<string | null, void, unknown> {
  yield 'ready';
  return;
  yield null;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function* shortCircuitedYield(): Generator<string | null, void, unknown> {
  false && (yield null);
  yield 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Under the default compiler configuration, undefined remains exempt while
    // unrelated unused constituents are still reported.
    {
      code: `
function implicitVoidOnly(): 'value' | void {}
      `,
      errors: [
        {
          data: { annotated: 'void | "value"', unused: '"value"' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function fallthrough(flag: boolean): string | number | undefined {
  if (flag) return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function bareReturn(flag: boolean): string | number | undefined {
  if (flag) return 'ready';
  return;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Only reachable completions contribute to the implementation's return
    // type. Dead statements must not keep a constituent alive.
    {
      code: `
function returnAfterReturn(): string | null {
  return 'ready';
  return null;
}
      `,
      errors: [
        {
          data: { annotated: 'string | null', unused: 'null' },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function returnAfterThrow(flag: boolean): string | null {
  if (flag) return 'ready';
  throw new Error('stop');
  return null;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function stop(): never;
function returnAfterNeverCall(flag: boolean): string | null {
  if (flag) return 'ready';
  stop();
  return null;
}
function returnAfterNeverInitializer(flag: boolean): string | null {
  if (flag) return 'ready';
  const unreachable = stop();
  return null;
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
declare function stopInSwitch(): never;
function returnAfterNeverInSwitch(flag: boolean): string | null {
  switch (flag) {
    case true:
      return 'ready';
    default:
      stopInSwitch();
      return null;
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function stopInReturn(): never;
function abruptReturnExpression(flag: boolean): string | null {
  if (flag) return 'ready';
  return (stopInReturn(), null);
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function stopWhileEvaluating(): never;
function abruptObjectConstruction(flag: boolean): {
  readonly first: string;
  readonly second: string | null;
} {
  if (flag) return { first: 'ready', second: 'ready' };
  return { first: stopWhileEvaluating(), second: null };
}
function abruptArrayConstruction(
  flag: boolean,
): readonly [first: string, second: string | null] {
  if (flag) return ['ready', 'ready'];
  return [stopWhileEvaluating(), null];
}
declare function assemble(first: string, second: string | null): string | null;
function abruptCallArguments(flag: boolean): string | null {
  if (flag) return 'ready';
  return assemble(stopWhileEvaluating(), null);
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
declare function stopDuringEvaluation(): never;
declare function abruptTag(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string | null;
function abruptConditionalCondition(flag: boolean): string | null {
  if (flag) return 'ready';
  return stopDuringEvaluation() ? null : null;
}
function abruptLogicalRight(flag: boolean): string | null {
  if (flag) return 'ready';
  return false || stopDuringEvaluation();
}
function abruptComputedProperty(flag: boolean): {
  readonly value: string | null;
} {
  if (flag) return { value: 'ready' };
  return { [stopDuringEvaluation()]: 0, value: null };
}
function abruptTaggedTemplate(flag: boolean): string | null {
  if (flag) return 'ready';
  return abruptTag\`value-\${stopDuringEvaluation()}-\${null}\`;
}
function abruptTemplateInterpolation(flag: boolean): string | null {
  if (flag) return 'ready';
  return \`\${stopDuringEvaluation()}-\${null}\`;
}
function abruptUnaryExpression(flag: boolean): string | null | undefined {
  if (flag) return 'ready';
  return void stopDuringEvaluation();
}
function abruptPrefixUnary(flag: boolean): boolean | null {
  if (flag) return true;
  return !stopDuringEvaluation();
}
function abruptSatisfies(flag: boolean): string | null {
  if (flag) return 'ready';
  return (stopDuringEvaluation() satisfies never, null);
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function staticReturnExpression(): string | null {
  return true ? 'ready' : null;
}
function nestedStaticReturnExpression(): { readonly value: string | null } {
  return { value: true ? 'ready' : null };
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    {
      code: `
function nestedConstructorDoesNotContribute(): string | null {
  class Inner {
    constructor() {
      return Object.create(null);
    }
  }
  void Inner;
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare const nullableCoalescedValue: 'ready' | null;
function dynamicNullishCoalescing(): 'ready' | 'fallback' | null {
  return nullableCoalescedValue ?? 'fallback';
}
      `,
      errors: [
        {
          data: {
            annotated: '"ready" | "fallback" | null',
            unused: 'null',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function constantDeadBranch(): string | null {
  if (false) return null;
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function deadElseBranch(): string | null {
  if (true) return 'ready';
  else return null;
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function labeledBlockBreak(): string | null {
  labeled: {
    break labeled;
  }
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function step(): boolean;
function loopExitedByBreak(): string | null {
  while (true) {
    if (step()) break;
  }
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function halt(): never;
declare const flag: boolean;
function neverCompletingBranch(): string | null {
  return flag ? halt() : 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function deadLoopBody(): string | null {
  while (false) return null;
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function deadForBody(): string | null {
  for (; false;) return null;
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function constantSwitch(): 'ready' | 'unreachable' {
  switch ('ready' as 'ready' | 'unreachable') {
    case 'unreachable':
      return 'unreachable';
    default:
      return 'ready';
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function unmatchedConstantSwitch(): 'ready' | 'unreachable' {
  switch ('ready' as 'ready' | 'unreachable') {
    case 'unreachable':
      return 'unreachable';
  }
  return 'ready';
}
      `,
      errors: [
        {
          column: 35,
          endColumn: 60,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
enum ConstantSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
function constantEnumSwitch():
  ConstantSwitchState.Idle | ConstantSwitchState.Ready {
  switch (ConstantSwitchState.Ready as ConstantSwitchState) {
    case ConstantSwitchState.Idle:
      return ConstantSwitchState.Idle;
    default:
      return ConstantSwitchState.Ready;
  }
}
      `,
      errors: [
        {
          column: 30,
          endColumn: 55,
          endLine: 7,
          line: 6,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
const enum ConstantInlineSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
function constantInlineEnumSwitch():
  ConstantInlineSwitchState.Idle | ConstantInlineSwitchState.Ready {
  switch (ConstantInlineSwitchState.Ready as ConstantInlineSwitchState) {
    case ConstantInlineSwitchState.Idle:
      return ConstantInlineSwitchState.Idle;
    default:
      return ConstantInlineSwitchState.Ready;
  }
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 67,
          endLine: 7,
          line: 6,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
enum ConstantElementSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
function constantElementEnumSwitch():
  ConstantElementSwitchState.Idle | ConstantElementSwitchState.Ready {
  switch (ConstantElementSwitchState['Ready'] as ConstantElementSwitchState) {
    case ConstantElementSwitchState.Idle:
      return ConstantElementSwitchState.Idle;
    default:
      return ConstantElementSwitchState.Ready;
  }
}
      `,
      errors: [
        {
          column: 37,
          endColumn: 69,
          endLine: 7,
          line: 6,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
enum AliasedSwitchState {
  Idle = 'idle',
  Ready = 'ready',
}
const aliasedSwitchState: AliasedSwitchState = AliasedSwitchState.Ready;
function aliasedEnumSwitch():
  AliasedSwitchState.Idle | AliasedSwitchState.Ready {
  switch (aliasedSwitchState as AliasedSwitchState) {
    case AliasedSwitchState.Idle:
      return AliasedSwitchState.Idle;
    default:
      return AliasedSwitchState.Ready;
  }
}
      `,
      errors: [
        {
          column: 29,
          endColumn: 53,
          endLine: 8,
          line: 7,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function switchBreakStopsFallthrough(): 'ready' | 'unreachable' {
  switch ('ready' as 'ready' | 'unreachable') {
    case 'ready':
      break;
    case 'unreachable':
      return 'unreachable';
  }
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function labeledSwitchBreakStopsFallthrough(): 'ready' | 'unreachable' {
  done: switch ('ready' as 'ready' | 'unreachable') {
    case 'ready':
      break done;
    case 'unreachable':
      return 'unreachable';
  }
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
function dynamicSwitch(value: boolean): 'ready' | 'unused' {
  switch (value) {
    case true:
      return 'ready';
    default:
      return 'ready';
  }
}
function switchWithoutEntry(): 'ready' | 'unused' {
  switch ('ready' as 'ready' | 'unmatched') {
    case 'unmatched':
      return 'unused';
  }
  return 'ready';
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    // A completion from finally replaces an earlier return completion.
    {
      code: `
function finallyOverridesReturn(): string | null {
  try {
    return null;
  } finally {
    return 'ready';
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    {
      code: `
declare function haltOnOtherPath(): never;
function finallySwitchCanBreak(flag: boolean): string | null {
  try {
    return null;
  } finally {
    switch (flag) {
      case true:
        break;
      default:
        haltOnOtherPath();
    }
  }
}
function finallyLoopCanBreak(): string | null {
  try {
    return null;
  } finally {
    do {
      break;
    } while (false);
  }
}
      `,
      errors: [
        { messageId: 'misleadingReturnType' },
        { messageId: 'misleadingReturnType' },
      ],
    },
    // Tuple spreads exercise distinct fixed-slot and variadic projections.
    {
      code: `
type FixedTupleAfterSpread = readonly [string | null, number | null];
declare const fixedTuplePrefix: readonly ['ready'];
function fixedTupleAfterSpread(): FixedTupleAfterSpread {
  return [...fixedTuplePrefix, 1];
}
      `,
      errors: [
        {
          column: 33,
          data: { annotated: 'FixedTupleAfterSpread', unused: 'null' },
          endColumn: 56,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type VariadicTupleSpread = readonly [string, ...(number | null)[]];
declare const numericTupleTail: readonly number[];
function variadicTupleSpread(): VariadicTupleSpread {
  return ['ready', ...numericTupleTail];
}
      `,
      errors: [
        {
          column: 31,
          data: { annotated: 'VariadicTupleSpread', unused: 'null' },
          endColumn: 52,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Declared tuples use the checker's instantiated fixed and variadic slots.
    {
      code: `
type WideDeclaredTuple = readonly [string | null];
declare const narrowDeclaredTuple: readonly [string];
function declaredTupleSource(): WideDeclaredTuple {
  return narrowDeclaredTuple;
}
      `,
      errors: [
        {
          column: 31,
          data: { annotated: 'WideDeclaredTuple', unused: 'null' },
          endColumn: 50,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type WideDeclaredVariadicTuple = readonly [string, ...(number | null)[]];
declare const narrowDeclaredVariadicTuple: readonly [string, ...number[]];
function declaredVariadicTupleSource(): WideDeclaredVariadicTuple {
  return narrowDeclaredVariadicTuple;
}
      `,
      errors: [
        {
          column: 39,
          data: {
            annotated: 'WideDeclaredVariadicTuple',
            unused: 'null',
          },
          endColumn: 66,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A type-invalid array source still has usable numeric index information.
    {
      code: `
type WideTupleFromArray = readonly [string | null];
declare const textArraySource: ReadonlyArray<string>;
function tupleFromArraySource(): WideTupleFromArray {
  return textArraySource;
}
      `,
      errors: [
        {
          column: 32,
          data: { annotated: 'WideTupleFromArray', unused: 'null' },
          endColumn: 52,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Recursive structural types terminate without skipping other properties.
    {
      code: `
interface WideRecursiveNode {
  readonly next: WideRecursiveNode;
  readonly value: string | null;
}
interface NarrowRecursiveNode {
  readonly next: NarrowRecursiveNode;
  readonly value: string;
}
declare const narrowRecursiveNode: NarrowRecursiveNode;
function recursiveStructuralProjection(): WideRecursiveNode {
  return narrowRecursiveNode;
}
      `,
      errors: [
        {
          column: 41,
          data: { annotated: 'WideRecursiveNode', unused: 'null' },
          endColumn: 60,
          endLine: 11,
          line: 11,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A later exact write overrides an earlier unknown computed key.
    {
      code: `
type ComputedWriteResult = {
  readonly unrelated: number;
  readonly value: string | null;
};
declare const earlyComputedKey: string;
function computedWriteBeforeExactProperty(): ComputedWriteResult {
  return { [earlyComputedKey]: null, value: 'ready', unrelated: 1 };
}
      `,
      errors: [
        {
          column: 44,
          data: { annotated: 'ComputedWriteResult', unused: 'null' },
          endColumn: 65,
          endLine: 7,
          line: 7,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Private fields do not satisfy a public string index signature.
    {
      code: `
type StringIndexResult = { readonly [key: string]: string | null };
class PrivateIndexSource {
  #secret: null = null;
  value = 'ready';
}
function privateIndexIgnored(): StringIndexResult {
  return new PrivateIndexSource();
}
      `,
      errors: [
        {
          column: 31,
          data: { annotated: 'StringIndexResult', unused: 'null' },
          endColumn: 50,
          endLine: 7,
          line: 7,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Method declarations expose their callable value through an index.
    {
      code: `
type MethodIndexResult = {
  readonly [key: string]: (() => string) | null;
};
function methodIndexResult(): MethodIndexResult {
  return {
    read() {
      return 'ready';
    },
  };
}
      `,
      errors: [
        {
          column: 29,
          data: { annotated: 'MethodIndexResult', unused: 'null' },
          endColumn: 48,
          endLine: 5,
          line: 5,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A direct computed literal and its following plain property are the same
    // runtime key, so the later write wins. Duplicate keys are what these
    // cases exercise, so the compiler reports on them by construction.
    {
      code: `
type StringIndexResult = { readonly [key: string]: string | null };
function directComputedOverwrite(): StringIndexResult {
  return { ['value']: null, value: 'ready' };
}
      `,
      errors: [
        {
          column: 35,
          data: { annotated: 'StringIndexResult', unused: 'null' },
          endColumn: 54,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Type-level exact computed keys participate in last-write semantics.
    {
      code: `
type ExactStringIndexResult = { readonly [key: string]: string | null };
declare const exactStringIndexKey: 'value';
function exactStringIndexWrite(): ExactStringIndexResult {
  return { [exactStringIndexKey]: null, value: 'ready' };
}
      `,
      errors: [
        {
          column: 33,
          data: { annotated: 'ExactStringIndexResult', unused: 'null' },
          endColumn: 57,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type ExactNumberIndexResult = { readonly [key: number]: string | null };
declare const exactNumberIndexKey: 1;
function exactNumberIndexWrite(): ExactNumberIndexResult {
  return { [exactNumberIndexKey]: null, 1: 'ready' };
}
      `,
      errors: [
        {
          column: 33,
          data: { annotated: 'ExactNumberIndexResult', unused: 'null' },
          endColumn: 57,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const exactSymbolIndexKey: unique symbol;
type ExactSymbolIndexResult = { readonly [key: symbol]: string | null };
function exactSymbolIndexWrite(): ExactSymbolIndexResult {
  return { [exactSymbolIndexKey]: null, [exactSymbolIndexKey]: 'ready' };
}
      `,
      errors: [
        {
          column: 33,
          data: { annotated: 'ExactSymbolIndexResult', unused: 'null' },
          endColumn: 57,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A later exact index write suppresses the same key in an earlier spread.
    {
      code: `
type SpreadIndexResult = { readonly [key: string]: string | null };
function overriddenIndexSpread(): SpreadIndexResult {
  return { ...{ value: null }, value: 'ready' };
}
      `,
      errors: [
        {
          column: 33,
          data: { annotated: 'SpreadIndexResult', unused: 'null' },
          endColumn: 52,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Array object spreads expose their enumerable indexed properties.
    {
      code: `
type TupleObjectSpreadResult = { readonly 0: string | null };
function tupleObjectSpread(): TupleObjectSpreadResult {
  return { ...['ready'] };
}
      `,
      errors: [
        {
          column: 29,
          data: { annotated: 'TupleObjectSpreadResult', unused: 'null' },
          endColumn: 54,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Signature correspondence distributes over either union parameter.
    {
      code: `
interface ExpectedUnionParameter {
  (value: number | string): 'matched' | 'unused';
}
interface SourceAgainstUnionParameter {
  (value: number | string): 'matched';
  (value: boolean): 'unused';
}
declare const sourceAgainstUnionParameter: SourceAgainstUnionParameter;
function expectedUnionParameter(): ExpectedUnionParameter {
  return sourceAgainstUnionParameter;
}
      `,
      errors: [
        {
          column: 34,
          data: {
            annotated: 'ExpectedUnionParameter',
            unused: '"unused"',
          },
          endColumn: 58,
          endLine: 10,
          line: 10,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // An `any` parameter overlaps the expected string domain, but overload
    // resolution still selects that first signature's null-only return.
    {
      code: `
interface StringExpectedCallable {
  (value: string): string | null;
}
interface OpaqueParameterCallable {
  (value: any): null;
  (value: boolean): string;
}
declare const opaqueParameterCallable: OpaqueParameterCallable;
function opaqueCallableParameter(): StringExpectedCallable {
  return opaqueParameterCallable;
}
      `,
      errors: [
        {
          column: 35,
          data: {
            annotated: 'StringExpectedCallable',
            unused: 'string',
          },
          endColumn: 59,
          endLine: 10,
          line: 10,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
interface ExpectedStringParameter {
  (value: string): 'matched' | 'unused';
}
interface SourceUnionParameter {
  (value: number | string): 'matched';
  (value: boolean): 'unused';
}
declare const sourceUnionParameter: SourceUnionParameter;
function sourceHasUnionParameter(): ExpectedStringParameter {
  return sourceUnionParameter;
}
      `,
      errors: [
        {
          column: 35,
          data: {
            annotated: 'ExpectedStringParameter',
            unused: '"unused"',
          },
          endColumn: 60,
          endLine: 10,
          line: 10,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Iterator yield results may omit their optional `done` property.
    {
      code: `
interface ValueOnlyIterator<T> {
  next(): { value: T };
}
interface ValueOnlyIterable<T> {
  [Symbol.iterator](): ValueOnlyIterator<T>;
}
declare const textValueOnlyIterable: ValueOnlyIterable<string>;
function valueOnlyIterable(): Iterable<string | null> {
  return textValueOnlyIterable;
}
      `,
      errors: [
        {
          column: 29,
          data: { annotated: 'Iterable<string | null>', unused: 'null' },
          endColumn: 54,
          endLine: 9,
          line: 9,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Never-completing expressions do not make dead returns observable.
    {
      code: `
declare function stopExecution(): never;
function conditionalNever(branch: boolean, text: boolean): string | null {
  if (text) return 'ready';
  return branch ? stopExecution() : stopExecution();
}
      `,
      errors: [
        {
          column: 58,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 73,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare function stopExecution(): never;
function staticConditionalNever(text: boolean): string | null {
  if (text) return 'ready';
  return true ? stopExecution() : null;
}
      `,
      errors: [
        {
          column: 47,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 62,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // The statically selected false branch is analyzed symmetrically.
    {
      code: `
function staticFalseConditional(): string | null {
  return false ? null : 'ready';
}
      `,
      errors: [
        {
          column: 34,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 49,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A test whose type is never truthy makes its then-branch unreachable.
    {
      code: `
declare const featureDisabled: false;
function typePrunedThenBranch(): string | null {
  if (featureDisabled) return null;
  return 'ready';
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // A test whose type is never falsy makes its else-branch unreachable.
    {
      code: `
declare const alwaysOn: true;
function typePrunedElseBranch(): 'ready' | 'idle' {
  if (alwaysOn) {
    return 'ready';
  } else {
    return 'idle';
  }
}
      `,
      errors: [{ messageId: 'misleadingReturnType' }],
    },
    // Static and type-level nullishness both select the fallback value. A
    // statically nullish or non-nullish operand is reported by the compiler
    // itself, so this short-circuit can only be expressed as code the checker
    // rejects; the rule still has to read the surviving operand correctly.
    {
      code: `
function staticNullishReturn(): string | null {
  return 'ready' ?? null;
}
      `,
      errors: [
        {
          column: 31,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 46,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare const typedNull: null;
function typedNullishReturn(): string | null {
  return typedNull ?? 'ready';
}
      `,
      errors: [
        {
          column: 30,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Promise settlement without a value exposes only undefined.
    {
      code: `
function resolveWithoutValue(): Promise<string | null | undefined> {
  return new Promise<undefined>(resolve => {
    resolve(undefined);
  });
}
      `,
      errors: [
        {
          column: 31,
          data: {
            annotated: 'Promise<string | null | undefined>',
            unused: 'null | string',
          },
          endColumn: 67,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
function staticResolveWithoutValue(): Promise<string | null | undefined> {
  return Promise.resolve(undefined);
}
      `,
      errors: [
        {
          column: 37,
          data: {
            annotated: 'Promise<string | null | undefined>',
            unused: 'null | string',
          },
          endColumn: 73,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare function stopExecution(): never;
function logicalNever(text: boolean): string | null {
  if (text) return 'ready';
  true && stopExecution();
  return null;
}
      `,
      errors: [
        {
          column: 37,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 52,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Type-invalid for the same reason as `staticNullishReturn` above.
    {
      code: `
declare function stopExecution(): never;
function nullishNever(text: boolean): string | null {
  if (text) return 'ready';
  null ?? stopExecution();
  return null;
}
      `,
      errors: [
        {
          column: 37,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 52,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare function stopExecution(): never;
function computedNameNever(text: boolean): string | null {
  if (text) return 'ready';
  ({ [stopExecution()]: 1 });
  return null;
}
      `,
      errors: [
        {
          column: 42,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 57,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare function stopExecution(): never;
function forOfNever(text: boolean): string | null {
  if (text) return 'ready';
  for (const value of stopExecution() as string[]) {
    void value;
  }
  return null;
}
      `,
      errors: [
        {
          column: 35,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 50,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
declare function stopExecution(): never;
function tryCatchNever(text: boolean): string | null {
  if (text) return 'ready';
  try {
    stopExecution();
  } catch {
    stopExecution();
  }
  return null;
}
      `,
      errors: [
        {
          column: 38,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Function-expression Promise executors are inspected like arrows.
    {
      code: `
function functionExpressionPromiseExecutor(): Promise<string | null> {
  return new Promise(function (resolve) {
    resolve('ready');
  });
}
      `,
      errors: [
        {
          column: 45,
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          endColumn: 69,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Known element-access keys remain exact under unchecked-index settings.
    {
      code: `
interface ExactStringState {
  readonly known: string;
}
function exactStringElement(value: ExactStringState): string | undefined {
  return value['known'];
}
      `,
      errors: [
        {
          column: 53,
          data: { annotated: 'string | undefined', unused: 'undefined' },
          endColumn: 73,
          endLine: 5,
          line: 5,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
declare const exactElementKey: unique symbol;
interface ExactSymbolState {
  readonly [exactElementKey]: string;
}
function exactSymbolElement(value: ExactSymbolState): string | undefined {
  return value[exactElementKey];
}
      `,
      errors: [
        {
          column: 53,
          data: { annotated: 'string | undefined', unused: 'undefined' },
          endColumn: 73,
          endLine: 6,
          line: 6,
          messageId: 'misleadingReturnType',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    // Repeated exact observations share one constituent entry.
    {
      code: `
const exactReady: 'ready' = 'ready';
function repeatedExactObservation(flag: boolean): 'idle' | 'ready' {
  if (flag) return exactReady;
  return exactReady;
}
      `,
      errors: [
        {
          column: 49,
          data: {
            annotated: '"idle" | "ready"',
            unused: '"idle"',
          },
          endColumn: 67,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A tuple assembled by spread still exposes its numeric property when the
    // tuple itself is object-spread.
    {
      code: `
type NestedTupleObjectSpreadResult = { readonly 0: string | null };
declare const nestedTupleSource: readonly ['ready'];
function nestedTupleObjectSpread(): NestedTupleObjectSpreadResult {
  return { ...[...nestedTupleSource] };
}
      `,
      errors: [
        {
          column: 35,
          data: {
            annotated: 'NestedTupleObjectSpreadResult',
            unused: 'null',
          },
          endColumn: 66,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Statically unreachable loop bodies cannot contribute yielded values.
    {
      code: `
type TextGenerator = Generator<string | null, void, unknown>;
function* unreachableForYield(): TextGenerator {
  for (; false;) {
    yield null;
  }
  yield 'ready';
}
      `,
      errors: [
        {
          column: 32,
          data: { annotated: 'TextGenerator', unused: 'null' },
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    {
      code: `
type TextGenerator = Generator<string | null, void, unknown>;
function* unreachableWhileYield(): TextGenerator {
  while (false) {
    yield null;
  }
  yield 'ready';
}
      `,
      errors: [
        {
          column: 34,
          data: { annotated: 'TextGenerator', unused: 'null' },
          endColumn: 49,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Each short-circuiting operator can make a yield unreachable.
    {
      code: `
type TextGenerator = Generator<string | null, void, unknown>;
function* shortCircuitedOrYield(): TextGenerator {
  true || (yield null);
  yield 'ready';
}
      `,
      errors: [
        {
          column: 34,
          data: { annotated: 'TextGenerator', unused: 'null' },
          endColumn: 49,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Type-invalid for the same reason as `staticNullishReturn` above.
    {
      code: `
type TextGenerator = Generator<string | null, void, unknown>;
function* shortCircuitedNullishYield(): TextGenerator {
  'present' ?? (yield null);
  yield 'ready';
}
      `,
      errors: [
        {
          column: 39,
          data: { annotated: 'TextGenerator', unused: 'null' },
          endColumn: 54,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Spread arguments are evaluated before constructor invocation.
    {
      code: `
declare function stopExecution(): never;
declare const ResultBox: new (...values: never[]) => object;
function constructorSpreadNever(text: boolean): string | null {
  if (text) return 'ready';
  new ResultBox(...(stopExecution() as never[]));
  return null;
}
      `,
      errors: [
        {
          column: 47,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 62,
          endLine: 4,
          line: 4,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Overloaded local wrappers are one reachable Promise settlement source.
    {
      code: `
function overloadedResolverWrapper(): Promise<string | null> {
  return new Promise(resolve => {
    function settle(value: 'ready'): void;
    function settle(value: string): void;
    function settle(value: string): void {
      resolve(value);
    }
    settle('ready');
  });
}
      `,
      errors: [
        {
          column: 37,
          data: { annotated: 'Promise<string | null>', unused: 'null' },
          endColumn: 61,
          endLine: 2,
          line: 2,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // A never-typed observation contributes no reachable constituent.
    {
      code: `
declare const impossibleValue: never;
function neverObservation(flag: boolean): string | null {
  if (flag) return impossibleValue;
  return 'ready';
}
      `,
      errors: [
        {
          column: 41,
          data: { annotated: 'string | null', unused: 'null' },
          endColumn: 56,
          endLine: 3,
          line: 3,
          messageId: 'misleadingReturnType',
        },
      ],
    },
    // Diagnostic payloads stay bounded for large unions.
    {
      code: `
function largeUnion():
  | 'returned'
  | 'unused-constituent-one'
  | 'unused-constituent-two'
  | 'unused-constituent-three'
  | 'unused-constituent-four'
  | 'unused-constituent-five' {
  return 'returned';
}
      `,
      errors: [
        {
          data: {
            annotated:
              '"returned" | "unused-constituent-one" | "unused-constituent-two" | "unused-const...',
            unused:
              '"unused-constituent-one" | "unused-constituent-two" | "unused-constituent-three"',
          },
          messageId: 'misleadingReturnType',
        },
      ],
    },
  ],
});

const unstrictRuleTester = createRuleTesterWithTypes({
  project: './tsconfig.json',
  tsconfigRootDir: path.join(getFixturesRootDir(), 'unstrict'),
});

unstrictRuleTester.run('no-misleading-return-type without strict nulls', rule, {
  valid: [
    `
function nullIsNotASeparateType(): string | null {
  return 'ready';
}
    `,
  ],
  invalid: [],
});
