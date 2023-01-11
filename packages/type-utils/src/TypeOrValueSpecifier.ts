import type * as ts from 'typescript';

interface FileSpecifier {
  from: 'file';
  name: string | Array<string>;
  source?: string;
}

interface LibSpecifier {
  from: 'lib';
  name: string | Array<string>;
}

interface PackageSpecifier {
  from: 'package';
  name: string | Array<string>;
  source: string;
}

interface MultiSourceSpecifier {
  from: Array<'file' | 'lib' | 'package'>;
  name: string;
}

export type TypeOrValueSpecifier =
  | string
  | FileSpecifier
  | LibSpecifier
  | PackageSpecifier
  | MultiSourceSpecifier;

export const typeOrValueSpecifierSchema = {
  oneOf: [
    {
      type: 'string',
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'file',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
        source: {
          type: 'string',
        },
      },
      required: ['from', 'name'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'lib',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
      },
      required: ['from', 'name'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'package',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
        source: {
          type: 'string',
        },
      },
      required: ['from', 'name', 'source'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'array',
          minItems: 1,
          uniqueItems: true,
          items: {
            type: 'string',
            enum: ['file', 'lib', 'package'],
          },
        },
        name: {
          type: 'string',
        },
      },
      required: ['from', 'name'],
    },
  ],
};

function isMultiSourceSpecifier(
  specifier: TypeOrValueSpecifier,
): specifier is MultiSourceSpecifier {
  return typeof specifier === 'object' && Array.isArray(specifier.from);
}

function specifierNameMatches(
  type: ts.Type,
  name: string | Array<string>,
): boolean {
  if (typeof name === 'string') {
    name = [name];
  }
  return name.some(item => item === type.getSymbol()?.escapedName);
}

function typeMatchesFileSpecifier(
  type: ts.Type,
  specifier: FileSpecifier,
  declarationFiles: Array<ts.SourceFile>,
  program: ts.Program,
): boolean {
  if (
    !declarationFiles.some(declaration =>
      declaration.fileName.startsWith(program.getCurrentDirectory()),
    )
  ) {
    return false;
  }
  // TODO: Check filename against source.
  return true;
}

function typeIsFromLib(
  declarationFiles: Array<ts.SourceFile>,
  program: ts.Program,
): boolean {
  return declarationFiles.some(declaration =>
    program.isSourceFileDefaultLibrary(declaration),
  );
}

function typeMatchesPackageSpecifier(
  specifier: PackageSpecifier,
  declarationFiles: Array<ts.SourceFile>,
): boolean {
  return declarationFiles.some(
    declaration =>
      declaration.fileName.includes(`node_modules/${specifier.source}/`) ||
      declaration.fileName.includes(`node_modules/@types/${specifier.source}/`),
  );
}

function typeMatchesMultiSourceSpecifier(
  type: ts.Type,
  specifier: MultiSourceSpecifier,
  declarationFiles: Array<ts.SourceFile>,
  program: ts.Program,
): boolean {
  if (
    specifier.from.includes('file') &&
    typeMatchesFileSpecifier(
      type,
      { from: 'file', name: specifier.name },
      declarationFiles,
      program,
    )
  ) {
    return true;
  }
  if (
    specifier.from.includes('lib') &&
    typeIsFromLib(declarationFiles, program)
  ) {
    return true;
  }
  if (
    specifier.from.includes('package') &&
    typeMatchesPackageSpecifier(
      // TODO: Solve what to do with the source.
      { from: 'package', name: specifier.name, source: '' },
      declarationFiles,
    )
  ) {
    return true;
  }
  return false;
}

export function typeMatchesSpecifier(
  type: ts.Type,
  specifier: TypeOrValueSpecifier,
  program: ts.Program,
): boolean {
  if (typeof specifier === 'string') {
    return specifierNameMatches(type, specifier);
  }
  if (!specifierNameMatches(type, specifier.name)) {
    return false;
  }
  const declarationFiles =
    type
      .getSymbol()
      ?.getDeclarations()
      ?.map(declaration => declaration.getSourceFile()) ?? [];
  if (isMultiSourceSpecifier(specifier)) {
    return typeMatchesMultiSourceSpecifier(
      type,
      specifier,
      declarationFiles,
      program,
    );
  }
  switch (specifier.from) {
    case 'file':
      return typeMatchesFileSpecifier(
        type,
        specifier,
        declarationFiles,
        program,
      );
    case 'lib':
      return typeIsFromLib(declarationFiles, program);
    case 'package':
      return typeMatchesPackageSpecifier(specifier, declarationFiles);
  }
}
