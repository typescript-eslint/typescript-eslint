import { ESLintUtils } from '../../src';
import {
  type NamedCreateRuleMeta,
  RuleCreator,
} from '../../src/eslint-utils/RuleCreator';
import type { RuleContext } from '../../src/ts-eslint/Rule';

const mockGetParserServices = jest.fn();

jest.mock('../../src/eslint-utils/getParserServices', () => ({
  get getParserServices(): typeof mockGetParserServices {
    return mockGetParserServices;
  },
}));

describe('RuleCreator', () => {
  afterEach(() => {
    mockGetParserServices.mockReset();
  });

  describe('factory usage', () => {
    const createRule = ESLintUtils.RuleCreator(name => `test/${name}`);

    const meta = {
      docs: {
        description: 'some description',
        recommended: 'recommended',
      },
      messages: {
        example: 'some message',
      },
      schema: [],
      type: 'problem',
    } satisfies NamedCreateRuleMeta<'example'>;

    it('populates rule meta', () => {
      const rule = createRule({
        name: 'test',
        meta,
        defaultOptions: [],
        create: jest.fn(),
      });

      expect(rule.meta).toEqual({
        ...meta,
        docs: {
          ...meta.docs,
          url: 'test/test',
        },
      });
    });

    it('does not enforce parserServices in create when the rule is untyped', () => {
      const create = jest.fn();
      const rule = createRule({
        name: 'test',
        meta,
        defaultOptions: [],
        create,
      });

      rule.create({} as unknown as Readonly<RuleContext<'example', never[]>>);

      expect(mockGetParserServices).not.toHaveBeenCalled();
    });

    it('enforces parserServices in create when the rule is typed', () => {
      const create = jest.fn();
      const rule = createRule({
        name: 'test',
        meta: {
          ...meta,
          docs: {
            ...meta.docs,
            requiresTypeChecking: true,
          },
        },
        defaultOptions: [],
        create,
      });

      rule.create({} as unknown as Readonly<RuleContext<'example', never[]>>);

      expect(mockGetParserServices).toHaveBeenCalled();
    });
  });

  describe('withoutDocs', () => {
    const meta = {
      docs: {
        description: 'some description',
        recommended: 'recommended',
      },
      messages: {
        example: 'some message',
      },
      schema: [],
      type: 'problem',
    } satisfies NamedCreateRuleMeta<'example'>;

    it('populates rule meta with added docs.url', () => {
      const rule = RuleCreator.withoutDocs({
        meta,
        defaultOptions: [],
        create: jest.fn(),
      });

      expect(rule.meta).toEqual(meta);
    });

    it('does not enforce parserServices in create when the rule is untyped', () => {
      const create = jest.fn();
      const rule = RuleCreator.withoutDocs({
        meta,
        defaultOptions: [],
        create,
      });

      rule.create({} as unknown as Readonly<RuleContext<'example', never[]>>);

      expect(mockGetParserServices).not.toHaveBeenCalled();
    });

    it('enforces parserServices in create when the rule is typed', () => {
      const create = jest.fn();
      const rule = RuleCreator.withoutDocs({
        meta: {
          ...meta,
          docs: {
            ...meta.docs,
            requiresTypeChecking: true,
          },
        },
        defaultOptions: [],
        create,
      });

      rule.create({} as unknown as Readonly<RuleContext<'example', never[]>>);

      expect(mockGetParserServices).toHaveBeenCalled();
    });
  });
});
