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
  });
});
