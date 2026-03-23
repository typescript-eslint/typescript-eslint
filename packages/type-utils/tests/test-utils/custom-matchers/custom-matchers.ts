import type { ParserOptions } from '@typescript-eslint/parser';
import type {
  ParserServices,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { parseForESLint } from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import Ajv from 'ajv';
import * as path from 'node:path';

import type {
  ReadonlynessOptions,
  TypeOrValueSpecifier,
} from '../../../src/index.js';

import {
  containsAllTypesByName,
  isTypeReadonly,
  isUnsafeAssignment,
  typeMatchesSpecifier,
  typeOrValueSpecifiersSchema,
} from '../../../src/index.js';

const FIXTURES_DIR = path.join(__dirname, '..', '..', 'fixtures');

const DEFAULT_PARSER_OPTIONS = {
  disallowAutomaticSingleRunInference: true,
  filePath: path.join(FIXTURES_DIR, 'file.ts'),
  project: './tsconfig.json',
  tsconfigRootDir: FIXTURES_DIR,
} satisfies ParserOptions;

chai.use((chai, utils) => {
  function parserServices(this: Chai.AssertionStatic, errorMessage?: string) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const services: ParserServices | null | undefined = utils.flag(
      this,
      'object',
    );

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(services, errorMessage, ssfi, true);

    if (negate) {
      (utils.hasProperty(services, 'program')
        ? assertion
        : assertion.not
      ).to.have
        .property('program')
        .that.equals(null);
    } else {
      assertion.to.have.property('program').that.does.not.equal(null);
    }
  }

  chai.Assertion.addMethod(parserServices.name, parserServices);

  chai.assert.isParserServices = (services, errorMessage) => {
    new chai.Assertion(
      services,
      errorMessage,
      chai.assert.isParserServices,
      true,
    ).to.be.parserServices();
  };

  chai.assert.isNotParserServices = (services, errorMessage) => {
    new chai.Assertion(
      services,
      errorMessage,
      chai.assert.isNotParserServices,
      true,
    ).not.to.be.parserServices();
  };
});

function hasParserServicesWithTypeInformation<
  T extends ReturnType<typeof parseForESLint>,
>(
  parseForESLintResult: T,
): asserts parseForESLintResult is T & {
  services: ParserServicesWithTypeInformation;
} {
  assert.isParserServices(parseForESLintResult.services);
}

export function parseCodeForEslint(code: string): ReturnType<
  typeof parseForESLint
> & {
  services: ParserServicesWithTypeInformation;
} {
  const parseForESLintResult = parseForESLint(code, DEFAULT_PARSER_OPTIONS);

  hasParserServicesWithTypeInformation(parseForESLintResult);

  return parseForESLintResult;
}

function getTypes(
  code: string,
  declarationIndex = 0,
): {
  checker: ts.TypeChecker;
  receiver: ts.Type;
  sender: ts.Type;
  senderNode: TSESTree.Node;
} {
  const { ast, services } = parseCodeForEslint(code);

  const checker = services.program.getTypeChecker();

  const node = ast.body[declarationIndex];

  const declaration =
    node.type === AST_NODE_TYPES.FunctionDeclaration
      ? node.body.body.find(
          (stmt): stmt is TSESTree.VariableDeclaration =>
            stmt.type === AST_NODE_TYPES.VariableDeclaration,
        )
      : (node as TSESTree.VariableDeclaration);

  assert.isDefined(declaration, 'Could not find a VariableDeclaration node');

  const declarator = declaration.declarations[0];

  assert.isNotNull(declarator.init);

  return {
    checker,
    receiver: services.getTypeAtLocation(declarator.id),
    sender: services.getTypeAtLocation(declarator.init),
    senderNode: declarator.init,
  };
}

expect.extend({
  toBeReadOnly(
    code: string,
    readOnlyNessOptions: ReadonlynessOptions | undefined,
  ) {
    const { isNot, utils } = this;

    const { printReceived } = utils;

    const { ast, services } = parseCodeForEslint(code);

    const { esTreeNodeToTSNodeMap, program } = services;

    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    const type = program
      .getTypeChecker()
      .getTypeAtLocation(esTreeNodeToTSNodeMap.get(declaration.id));

    const actual = isTypeReadonly(program, type, readOnlyNessOptions);

    return {
      actual,
      expected: true,
      message: () =>
        `Expected type to${isNot ? ' not' : ''} be readonly:\n\n${printReceived(
          code,
        )}`,
      pass: actual,
    };
  },
  toBeSafeAssignment(
    code: string,
    additionalOptions: {
      declarationIndex?: number;
      passSenderNode?: boolean;
    } = {},
  ) {
    const { isNot } = this;

    const { declarationIndex = 0, passSenderNode = false } = additionalOptions;

    const { checker, receiver, sender, senderNode } = getTypes(
      code,
      declarationIndex,
    );

    const actual = isUnsafeAssignment(
      sender,
      receiver,
      checker,
      passSenderNode ? senderNode : null,
    );

    const expected = false;

    const pass = actual === expected;

    return {
      actual,
      expected: isNot
        ? expect.objectContaining({
            receiver: expect.anything(),
            sender: expect.anything(),
          })
        : expected,
      message: () => `Expected Assignment${isNot ? ' not' : ''} to be safe.`,
      pass,
    };
  },

  toBeValidSpecifier(typeOrValueSpecifier: unknown) {
    const { isNot, utils } = this;

    const { printReceived } = utils;

    const ajv = new Ajv();

    const validate = ajv.compile(typeOrValueSpecifiersSchema);

    const actual = validate(typeOrValueSpecifier);

    const expected = true;

    const pass = actual === expected;

    return {
      actual,
      expected,
      message: () =>
        `Expected specifier to${isNot ? ' not' : ''} be valid:\n\n${printReceived(
          typeOrValueSpecifier,
        )}`,
      pass,
    };
  },

  toContainsAllTypesByName(
    code: string,
    additionalOptions: {
      allowAny?: boolean;
      allowedNames?: Set<string>;
      matchAnyInstead?: boolean;
    } = {},
  ) {
    const { isNot, utils } = this;

    const { printReceived } = utils;

    const {
      allowAny = false,
      allowedNames = new Set(),
      matchAnyInstead,
    } = additionalOptions;

    const { ast, services } = parseCodeForEslint(code);

    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    const type = services.getTypeAtLocation(declaration.id);

    const actual = containsAllTypesByName(
      type,
      allowAny,
      allowedNames,
      matchAnyInstead,
    );

    return {
      actual,
      expected: true,
      message: () =>
        `Expected type to${isNot ? ' not' : ''} contain all types by name:\n\n${printReceived(
          code,
        )}`,
      pass: actual,
    };
  },

  toHaveTypes(
    code: string,
    additionalOptions: {
      senderStr: string;
      receiverStr: string;
      declarationIndex?: number;
      passSenderNode?: boolean;
    },
  ) {
    const { isNot } = this;

    const {
      declarationIndex = 0,
      passSenderNode = false,
      receiverStr,
      senderStr,
    } = additionalOptions;

    const { checker, receiver, sender, senderNode } = getTypes(
      code,
      declarationIndex,
    );

    const result = isUnsafeAssignment(
      sender,
      receiver,
      checker,
      passSenderNode ? senderNode : null,
    );

    assert.isNotFalse(result);

    const senderType = checker.typeToString(result.sender);
    const receiverType = checker.typeToString(result.receiver);

    const actual = { receiver: receiverType, sender: senderType };
    const expected = { receiver: receiverStr, sender: senderStr };

    const pass = receiverType === receiverStr && senderType === senderStr;

    return {
      actual,
      expected,
      message: () =>
        `Expected types of sender and receiver to${isNot ? ' not' : ''} match.`,
      pass,
    };
  },

  toMatchSpecifier(
    code: string,
    expectedTypeOrValueSpecifier: TypeOrValueSpecifier,
  ) {
    const { isNot, utils } = this;

    const { printReceived } = utils;

    const { ast, services } = parseCodeForEslint(code);

    const type = services.program
      .getTypeChecker()
      .getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(
          (ast.body.at(-1) as TSESTree.TSTypeAliasDeclaration).id,
        ),
      );

    const actual = typeMatchesSpecifier(
      type,
      expectedTypeOrValueSpecifier,
      services.program,
    );

    return {
      actual,
      expected: true,
      message: () =>
        `Expected type to${isNot ? ' not' : ''} match specifier:\n\n${printReceived(
          expectedTypeOrValueSpecifier,
        )}`,
      pass: actual,
    };
  },
});
