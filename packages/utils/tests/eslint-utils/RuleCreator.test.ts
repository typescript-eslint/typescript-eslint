import { ESLintUtils } from '../../src';

describe(ESLintUtils.RuleCreator, () => {
  interface TestDocs {
    recommended?: 'yes';
  }

  const createRule = ESLintUtils.RuleCreator<TestDocs>(name => `test/${name}`);

  it('createRule should be a function', () => {
    expect(createRule).toBeTypeOf('function');
  });

  it('should create rule correctly', () => {
    const rule = createRule({
      create() {
        return {};
      },
      meta: {
        docs: {
          description: 'some description',
          recommended: 'yes',
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
      name: 'test',
    });
    expect(rule.meta).toEqual({
      docs: {
        description: 'some description',
        recommended: 'yes',
        url: 'test/test',
      },
      messages: {
        foo: 'some message',
      },
      schema: [],
      type: 'problem',
    });
    expect(rule.name).toBe('test');
  });

  it('withoutDocs should work without a `name`', () => {
    const rule = ESLintUtils.RuleCreator.withoutDocs({
      create() {
        return {};
      },
      meta: {
        docs: {
          description: 'some description',
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
    });

    expect(rule.meta.docs).toEqual({
      description: 'some description',
    });
    expect(rule.name).toBeUndefined();
  });

  it('when defaultOptions is specified, it returns the defaultOptions', () => {
    const rule = createRule({
      create() {
        return {};
      },
      defaultOptions: [{ option: true }],
      meta: {
        docs: {
          description: 'some description',
          recommended: 'yes',
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
      name: 'with-default-options',
    });

    expect(rule.defaultOptions).toEqual([{ option: true }]);
  });

  it('withoutDocs should work with a `name`', () => {
    const rule = ESLintUtils.RuleCreator.withoutDocs({
      create() {
        return {};
      },
      meta: {
        docs: {
          description: 'some description',
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
      name: 'some-name',
    });

    expect(rule.meta.docs).toEqual({
      description: 'some description',
    });
    expect(rule.name).toBe('some-name');
  });
});
