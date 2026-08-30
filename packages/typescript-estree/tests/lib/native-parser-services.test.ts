import type { ProjectServiceOptions, TSESTree } from '@typescript-eslint/types';

import path from 'node:path';

import type {
  ClassicParserServices,
  NativeParserServices,
  ParserServices,
  TSESTreeOptions,
} from '../../src/index.js';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'file.ts');

afterEach(clearCaches);

describe('native parser services', () => {
  it('returns native types and node maps from a complete ESTree conversion', () => {
    const result = parseAndGenerateServices(
      '// leading\nconst value: string = 1;',
      {
        comment: true,
        filePath,
        projectService: { backend: 'native' },
        tokens: true,
      },
    );

    expect(result.services.backend).toBe('native');
    expect(result.services).not.toHaveProperty('program');
    expect(result.ast.comments).toHaveLength(1);
    expect(result.ast.tokens.length).toBeGreaterThan(0);
    const declaration = result.ast.body[0];
    expect(result.services.native.project.configFileName).toMatch(
      /tsconfig\.json$/,
    );
    expect(result.services.getTypeAtLocation(declaration).flags).toBeTypeOf(
      'number',
    );
    expect(
      result.services.esTreeNodeToTSNodeMap.get(declaration).kind,
    ).toBeTypeOf('number');
  });

  it('returns services matching the statically known backend', () => {
    const native = parseAndGenerateServices('', {
      filePath,
      projectService: { backend: 'native' },
    });
    expectTypeOf(native.services).toEqualTypeOf<NativeParserServices>();

    const classic = parseAndGenerateServices('', { projectService: false });
    expectTypeOf(classic.services).toEqualTypeOf<ClassicParserServices>();

    const enabled = parseAndGenerateServices('', {
      filePath,
      projectService: true,
    });
    expectTypeOf(enabled.services).toEqualTypeOf<ClassicParserServices>();

    const empty = parseAndGenerateServices('', {
      filePath,
      projectService: {},
    });
    expectTypeOf(empty.services).toEqualTypeOf<ClassicParserServices>();

    const classicOptions = parseAndGenerateServices('', {
      filePath,
      projectService: { allowDefaultProject: ['*.ts'] },
    });
    expectTypeOf(
      classicOptions.services,
    ).toEqualTypeOf<ClassicParserServices>();

    const projectService: ProjectServiceOptions = {};
    const widenedProjectService = parseAndGenerateServices('', {
      filePath,
      projectService,
    });
    expectTypeOf(
      widenedProjectService.services,
    ).toEqualTypeOf<ParserServices>();

    const options: TSESTreeOptions = { projectService: false };
    const widened = parseAndGenerateServices('', options);
    expectTypeOf(widened.services).toEqualTypeOf<ParserServices>();
  });

  it('replaces native nodes and types when the same file text changes', () => {
    const options = {
      filePath,
      projectService: { backend: 'native' as const },
    };
    const first = parseAndGenerateServices('export const value = 1;', options);
    expect(first.services.backend).toBe('native');
    const firstNode = first.services.esTreeNodeToTSNodeMap.get(
      first.ast.body[0],
    );
    const firstType = first.services.getTypeAtLocation(first.ast.body[0]);
    const second = parseAndGenerateServices(
      'export const value = "updated";',
      options,
    );

    const secondNode = second.services.esTreeNodeToTSNodeMap.get(
      second.ast.body[0],
    );
    expect(secondNode).not.toBe(firstNode);
    expect(second.services.getTypeAtLocation(second.ast.body[0])).not.toBe(
      firstType,
    );
    expect(second.services.tsNodeToESTreeNodeMap.has(secondNode)).toBe(true);
    expect(second.services.tsNodeToESTreeNodeMap.has(firstNode)).toBe(false);
  });

  it('gets types at locations in order with one checker call', () => {
    const { ast, services } = parseAndGenerateServices(
      'const text = "value"; const count = 1;',
      { filePath, projectService: { backend: 'native' } },
    );
    const declarations = ast.body as TSESTree.VariableDeclaration[];
    const nodes = declarations.map(
      declaration => declaration.declarations[0].id,
    );
    const expected = nodes.map(node => services.getTypeAtLocation(node));
    const getTypeAtLocation = vi.spyOn(
      services.native.checker,
      'getTypeAtLocation',
    );

    const types = services.getTypesAtLocations(nodes);

    expect(types).toStrictEqual(expected);
    expect(getTypeAtLocation).toHaveBeenCalledTimes(1);
    expect(getTypeAtLocation.mock.calls[0][0]).toStrictEqual(
      nodes.map(node => services.esTreeNodeToTSNodeMap.get(node)),
    );
  });

  it('gets the contextual type of an expression', () => {
    const { ast, services } = parseAndGenerateServices(
      'const callback: (value: string) => string = value => value;',
      { filePath, projectService: { backend: 'native' } },
    );
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const expression = declaration.declarations[0]
      .init as TSESTree.ArrowFunctionExpression;

    expect(services.getContextualType(expression)).toBeDefined();
  });

  it.each([
    ['call', 'function create() {} create();'],
    ['new', 'class Example {} new Example();'],
  ])('gets the resolved signature of a %s expression', (_kind, code) => {
    const { ast, services } = parseAndGenerateServices(code, {
      filePath,
      projectService: { backend: 'native' },
    });
    const statement = ast.body[1] as TSESTree.ExpressionStatement;

    expect(
      services.getResolvedSignature(
        statement.expression as
          TSESTree.CallExpression | TSESTree.NewExpression,
      ),
    ).toBeDefined();
  });

  it('gets the symbol of a reference identifier', () => {
    const { ast, services } = parseAndGenerateServices(
      'const value = 1; value;',
      { filePath, projectService: { backend: 'native' } },
    );
    const statement = ast.body[1] as TSESTree.ExpressionStatement;

    expect(services.getSymbolAtLocation(statement.expression)).toBeDefined();
  });

  it('maps a native node back to the identical ESTree node', () => {
    const { ast, services } = parseAndGenerateServices('const value = 1;', {
      filePath,
      projectService: { backend: 'native' },
    });
    const estreeNode = ast.body[0];
    const nativeNode = services.esTreeNodeToTSNodeMap.get(estreeNode);

    expect(services.tsNodeToESTreeNodeMap.get(nativeNode)).toBe(estreeNode);
  });

  it('reports whether nodes exist in both maps', () => {
    const { ast, services } = parseAndGenerateServices('const value = 1;', {
      filePath,
      projectService: { backend: 'native' },
    });
    const estreeNode = ast.body[0];
    const nativeNode = services.esTreeNodeToTSNodeMap.get(estreeNode);

    expect({
      forward: services.esTreeNodeToTSNodeMap.has(estreeNode),
      reverse: services.tsNodeToESTreeNodeMap.has(nativeNode),
    }).toStrictEqual({ forward: true, reverse: true });
  });

  it.each([
    ['function test(...values,) {}', 'A rest parameter'],
    ['1 = 2;', 'left-hand side'],
  ])('reports native diagnostics for %s', (code, message) => {
    expect(() =>
      parseAndGenerateServices(code, {
        errorOnTypeScriptSyntacticAndSemanticIssues: true,
        filePath,
        projectService: { backend: 'native' },
      }),
    ).toThrow(message);
  });
});
