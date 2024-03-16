import { requiresQuoting } from '../src';

describe('getDeclaration', () => {
  describe('valid identifier', () => {
    it('upper and lower case alphabet', () => {
      const name = 'fooBar';
      const result = requiresQuoting(name);
      expect(result).toBe(false);
    });

    it('upper and lower case alphabet with number not first', () => {
      const name = 'foo1234Bar';
      const result = requiresQuoting(name);
      expect(result).toBe(false);
    });

    it('start with dollorSign', () => {
      const name = '$bar';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('include dollorSign not start position', () => {
      const name = 'foo$bar';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });

    it('start with underScore', () => {
      const name = '_bar';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('include underScore not start position', () => {
      const name = 'foo_bar';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });

    it('non-alphabet characters', () => {
      const name = 'café';
      const result = requiresQuoting(name);
      expect(result).toBe(false);
    });
  });

  describe('invalid identifier', () => {
    it('only number', () => {
      const name = '12345';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('start with number', () => {
      const name = '1axcef';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('start with dash', () => {
      const name = '-bar';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('include dash not start position', () => {
      const name = 'foo-bar';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('empty string', () => {
      const name = '';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
    it('include special symbol at first', () => {
      const name = '!asdfs';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });

    it('include special symbol at middle', () => {
      const name = 'asd!fs';
      const result = requiresQuoting(name);
      expect(result).toBe(true);
    });
  });
});
