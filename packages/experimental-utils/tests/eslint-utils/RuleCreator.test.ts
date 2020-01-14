import { ESLintUtils } from '../../src';

describe('RuleCreator', () => {
  const createRule = ESLintUtils.RuleCreator(name => `test/${name}`);

  it('createRule should be a function', () => {
    expect(typeof createRule).toEqual('function');
  });

  it('should create rule correctly', () => {
    const create = jest.fn();
    const rule = createRule({
      name: 'test',
      meta: {
        docs: {
          description: 'some description',
          category: 'Best Practices',
          recommended: 'error',
          requiresTypeChecking: true,
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
      defaultOptions: [],
      create,
    });
    expect(create).toBe(create);
    expect(create).not.toBeCalled();
    expect(rule.meta).toEqual({
      docs: {
        description: 'some description',
        category: 'Best Practices',
        url: 'test/test',
        recommended: 'error',
        requiresTypeChecking: true,
      },
      messages: {
        foo: 'some message',
      },
      schema: [],
      type: 'problem',
    });
  });
});
