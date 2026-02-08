import { isUnsafeAssignment } from '../src/index.js';

describe(isUnsafeAssignment, () => {
  describe('unsafe', () => {
    it('any to a non-any', () => {
      expect('const test: string = (1 as any);').toHaveTypes({
        receiverStr: 'string',
        senderStr: 'any',
      });
    });

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

    // Nested any detection - object properties
    it('any in object property to non-any', () => {
      expect(`
        declare const sender: { foo: any };
        const test: { foo: number } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ foo: number; }',
        senderStr: '{ foo: any; }',
      });
    });

    it('any in nested object property to non-any', () => {
      expect(`
        declare const sender: { nested: { value: any } };
        const test: { nested: { value: number } } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ nested: { value: number; }; }',
        senderStr: '{ nested: { value: any; }; }',
      });
    });

    // Nested any detection - tuple elements (handled via type reference)
    it('any in tuple element to non-any', () => {
      expect(`
        declare const sender: [any, string];
        const test: [number, string] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '[number, string]',
        senderStr: '[any, string]',
      });
    });

    it('any in nested tuple to non-any', () => {
      expect(`
        declare const sender: [[any]];
        const test: [[number]] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '[[number]]',
        senderStr: '[[any]]',
      });
    });

    // Nested any detection - array elements (handled via type reference)
    it('any[] to non-any[]', () => {
      expect(`
        declare const sender: any[];
        const test: number[] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: 'number[]',
        senderStr: 'any[]',
      });
    });

    it('any in nested array to non-any', () => {
      expect(`
        declare const sender: any[][];
        const test: number[][] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: 'number[][]',
        senderStr: 'any[][]',
      });
    });

    // Nested any detection - index signatures
    it('any in index signature to non-any', () => {
      expect(`
        declare const sender: { [key: string]: any };
        const test: { [key: string]: number } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ [key: string]: number; }',
        senderStr: '{ [key: string]: any; }',
      });
    });

    // Complex nested cases
    it('any in object property inside array to non-any', () => {
      expect(`
        declare const sender: Array<{ foo: any }>;
        const test: Array<{ foo: number }> = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ foo: number; }[]',
        senderStr: '{ foo: any; }[]',
      });
    });

    // Mixed nesting: object containing array
    it('any in array property of object to non-any', () => {
      expect(`
        declare const sender: { items: any[] };
        const test: { items: number[] } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ items: number[]; }',
        senderStr: '{ items: any[]; }',
      });
    });

    // Union types
    it('any in union member object property to non-any', () => {
      expect(`
        declare const sender: { a: any } | { b: string };
        const test: { a: number } | { b: string } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ a: number; } | { b: string; }',
        senderStr: '{ a: any; } | { b: string; }',
      });
    });

    // Intersection types
    it('any in intersection member to non-any', () => {
      expect(`
        declare const sender: { a: any } & { b: string };
        const test: { a: number } & { b: string } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ a: number; } & { b: string; }',
        senderStr: '{ a: any; } & { b: string; }',
      });
    });

    // Function return types
    it('any in function return type to non-any', () => {
      expect(`
        declare const sender: { fn: () => any };
        const test: { fn: () => number } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ fn: () => number; }',
        senderStr: '{ fn: () => any; }',
      });
    });

    it('any in nested function return type to non-any', () => {
      expect(`
        declare const sender: { fn: () => { value: any } };
        const test: { fn: () => { value: number } } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ fn: () => { value: number; }; }',
        senderStr: '{ fn: () => { value: any; }; }',
      });
    });

    // Readonly arrays (handled via type reference)
    it('readonly any[] to readonly non-any[]', () => {
      expect(`
        declare const sender: readonly any[];
        const test: readonly number[] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: 'readonly number[]',
        senderStr: 'readonly any[]',
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

    // Safe nested assignments - object properties
    it('non-any object property to same type', () => {
      expect(`
        declare const sender: { foo: number };
        const test: { foo: number } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    it('non-any nested object property to same type', () => {
      expect(`
        declare const sender: { nested: { value: number } };
        const test: { nested: { value: number } } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe nested assignments - tuple elements
    it('non-any tuple element to same type', () => {
      expect(`
        declare const sender: [number, string];
        const test: [number, string] = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe nested assignments - array elements
    it('non-any array to same type', () => {
      expect(`
        declare const sender: number[];
        const test: number[] = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe nested assignments - index signatures
    it('non-any index signature to same type', () => {
      expect(`
        declare const sender: { [key: string]: number };
        const test: { [key: string]: number } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: any in sender property to any in receiver
    it('any object property to any', () => {
      expect(`
        declare const sender: { foo: any };
        const test: { foo: any } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: any in sender property to unknown in receiver
    it('any object property to unknown', () => {
      expect(`
        declare const sender: { foo: any };
        const test: { foo: unknown } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: readonly array with same types
    it('readonly non-any[] to readonly same type', () => {
      expect(`
        declare const sender: readonly number[];
        const test: readonly number[] = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: union types without any
    it('non-any union to same union', () => {
      expect(`
        declare const sender: { a: number } | { b: string };
        const test: { a: number } | { b: string } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: intersection types without any
    it('non-any intersection to same intersection', () => {
      expect(`
        declare const sender: { a: number } & { b: string };
        const test: { a: number } & { b: string } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: function return types without any
    it('non-any function return type to same type', () => {
      expect(`
        declare const sender: { fn: () => number };
        const test: { fn: () => number } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: function with any return to any receiver
    it('any function return type to any', () => {
      expect(`
        declare const sender: { fn: () => any };
        const test: { fn: () => any } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });

    // Safe: function with any return to unknown receiver
    it('any function return type to unknown', () => {
      expect(`
        declare const sender: { fn: () => any };
        const test: { fn: () => unknown } = sender;
      `).toBeSafeAssignment({ declarationIndex: 1 });
    });
  });

  // Edge cases
  describe('edge cases', () => {
    // Optional properties
    it('any in optional property to non-any (unsafe)', () => {
      expect(`
        declare const sender: { foo?: any };
        const test: { foo?: number } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ foo?: number | undefined; }',
        senderStr: '{ foo?: any; }',
      });
    });

    // Number index signature
    it('any in number index signature to non-any (unsafe)', () => {
      expect(`
        declare const sender: { [key: number]: any };
        const test: { [key: number]: number } = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '{ [key: number]: number; }',
        senderStr: '{ [key: number]: any; }',
      });
    });

    // Circular reference in object
    it('circular reference object with any property (unsafe)', () => {
      expect(`
        type Sender = { self: Sender; value: any };
        type Receiver = { self: Receiver; value: number };
        declare const sender: Sender;
        const test: Receiver = sender;
      `).toHaveTypes({
        declarationIndex: 3,
        receiverStr: 'Receiver',
        senderStr: 'Sender',
      });
    });

    // Circular reference object - safe case
    it('circular reference object without any (safe)', () => {
      expect(`
        type T = { self: T; value: number };
        declare const sender: T;
        const test: T = sender;
      `).toBeSafeAssignment({ declarationIndex: 2 });
    });

    // Rest elements in tuples (handled via type reference)
    it('any in tuple rest element to non-any (unsafe)', () => {
      expect(`
        declare const sender: [string, ...any[]];
        const test: [string, ...number[]] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '[string, ...number[]]',
        senderStr: '[string, ...any[]]',
      });
    });

    // Record type (resolved as index signature)
    it('Record with any value to non-any (unsafe)', () => {
      expect(`
        declare const sender: Record<string, any>;
        const test: Record<string, number> = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: 'Record<string, number>',
        senderStr: 'Record<string, any>',
      });
    });

    // Mixed: tuple with object element
    it('any in object inside tuple to non-any (unsafe)', () => {
      expect(`
        declare const sender: [{ a: any }];
        const test: [{ a: number }] = sender;
      `).toHaveTypes({
        declarationIndex: 1,
        receiverStr: '[{ a: number; }]',
        senderStr: '[{ a: any; }]',
      });
    });
  });
});
