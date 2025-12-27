import { isUnsafeAssignment } from '../src/index.js';

describe(isUnsafeAssignment, () => {
  describe('unsafe', () => {
    it('any to a non-any', () => {
      expect('const test: string = (1 as any);').toHaveTypes({
        receiverStr: 'string',
        senderStr: 'any',
      });
    }, 20_000);

    it('any in a generic position to a non-any', () => {
      expect('const test: Set<string> = new Set<any>();').toHaveTypes({
        receiverStr: 'Set<string>',
        senderStr: 'Set<any>',
      });
    });

    it('any in a generic position to a non-any (multiple generics)', () => {
      expect(
        'const test: Map<string, string> = new Map<string, any>();',
      ).toHaveTypes({
        receiverStr: 'Map<string, string>',
        senderStr: 'Map<string, any>',
      });
    });

    it('any[] in a generic position to a non-any[]', () => {
      expect('const test: Set<string[]> = new Set<any[]>();').toHaveTypes({
        receiverStr: 'Set<string[]>',
        senderStr: 'Set<any[]>',
      });
    });

    it('any in a generic position to a non-any (nested)', () => {
      expect(
        'const test: Set<Set<Set<string>>> = new Set<Set<Set<any>>>();',
      ).toHaveTypes({
        receiverStr: 'Set<Set<Set<string>>>',
        senderStr: 'Set<Set<Set<any>>>',
      });
    });

    it('circular reference', () => {
      expect(`type T = [string, T[]];
        const test: T = ["string", []] as any;`).toHaveTypes({
        declarationIndex: 1,
        passSenderNode: true,
        receiverStr: 'T',
        senderStr: 'any',
      });
    });

    it('object property any to non-any (nested)', () => {
      expect(`
type Sender = { foo: any };
type Receiver = { foo: number };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('array element any to non-any element', () => {
      expect('const test: number[] = [1] as any[];').toHaveTypes({
        receiverStr: 'number[]',
        senderStr: 'any[]',
      });
    });

    it('tuple element any to non-any element', () => {
      expect(
        "const test: [string, number] = ['a', 1 as any] as [string, any];",
      ).toHaveTypes({
        receiverStr: '[string, number]',
        senderStr: '[string, any]',
      });
    });

    it('string index signature any to non-any', () => {
      expect(`
type Sender = { [key: string]: any };
type Receiver = { [key: string]: number };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('number index signature any to non-any', () => {
      expect(`
type Sender = { [key: number]: any };
type Receiver = { [key: number]: string };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('receiver union with any in sender', () => {
      expect(`
type Sender = { kind: 'foo'; foo: any };
type Receiver = { kind: 'foo'; foo: number } | { kind: 'bar'; bar: string };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('receiver union hit with non-union sender', () => {
      expect(`
type Sender = { foo: any };
type Receiver = { foo: number } | { bar: string };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('union containing any property to discriminated union without any', () => {
      expect(`
type Sender = { kind: 'foo'; foo: any } | { kind: 'bar'; bar: string };
type Receiver = { kind: 'foo'; foo: number } | { kind: 'bar'; bar: string };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('self-referential object with nested any', () => {
      expect(`
type Sender = { self: Sender; value: any };
type Receiver = { self: Receiver; value: number };
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    it('tuple with recursive element containing any', () => {
      expect(`
type Sender = [Sender, any];
type Receiver = [Receiver, number];
const test: Receiver = {} as Sender;
      `).toHaveTypes({
        declarationIndex: 2,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });
  });

  describe('safe', () => {
    it('non-any to a non-any', () => {
      expect('const test: string = "";').toBeSafeAssignment();
    });

    it('non-any to a any', () => {
      expect('const test: any = "";').toBeSafeAssignment();
    });

    it('non-any in a generic position to a non-any', () => {
      expect(
        'const test: Set<string> = new Set<string>();',
      ).toBeSafeAssignment();
    });

    it('non-any in a generic position to a non-any (multiple generics)', () => {
      expect(
        'const test: Map<string, string> = new Map<string, string>();',
      ).toBeSafeAssignment();
    });

    it('non-any[] in a generic position to a non-any[]', () => {
      expect(
        'const test: Set<string[]> = new Set<string[]>();',
      ).toBeSafeAssignment();
    });

    it('non-any in a generic position to a non-any (nested)', () => {
      expect(
        'const test: Set<Set<Set<string>>> = new Set<Set<Set<string>>>();',
      ).toBeSafeAssignment();
    });

    it('non-any in a generic position to a any (nested)', () => {
      expect(
        'const test: Set<Set<Set<any>>> = new Set<Set<Set<string>>>();',
      ).toBeSafeAssignment();
    });

    it('any to a unknown', () => {
      expect('const test: unknown = [] as any;').toBeSafeAssignment();
    });

    it('any[] in a generic position to a unknown[]', () => {
      expect('const test: unknown[] = [] as any[]').toBeSafeAssignment();
    });

    it('any in a generic position to a unknown (nested)', () => {
      expect(
        'const test: Set<Set<Set<unknown>>> = new Set<Set<Set<any>>>();',
      ).toBeSafeAssignment();
    });

    // https://github.com/typescript-eslint/typescript-eslint/issues/2109
    it('special cases the empty map constructor with no generics', () => {
      expect('const test: Map<string, string> = new Map();').toBeSafeAssignment(
        { passSenderNode: true },
      );
    });

    it('circular reference', () => {
      expect(`type T = [string, T[]];
        const test: T = ["string", []] as T;`).toBeSafeAssignment({
        declarationIndex: 1,
        passSenderNode: true,
      });
    });

    it('object property with no any remains safe', () => {
      expect(`
type Sender = { foo: number };
type Receiver = { foo: number };
const test: Receiver = {} as Sender;
      `).toBeSafeAssignment({ declarationIndex: 2 });
    });

    it('same type with any is treated as safe (type equality)', () => {
      expect(`
type Both = { foo: any };
const test: Both = {} as Both;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    it('intersection with any is currently treated as safe', () => {
      expect(`
type Sender = { foo: any } & { bar: string };
type Receiver = { foo: number; bar: string };
const test: Receiver = {} as Sender;
      `).toBeSafeAssignment({ declarationIndex: 2 });
    });
  });
});
