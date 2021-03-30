import * as fs from 'fs';
import { sync as globSync } from 'globby';
import * as path from 'path';
import { parseAndGenerateServices } from '@typescript-eslint/typescript-estree';
import * as ts from 'typescript';

declare module 'typescript' {
  // private APIs we want to consume in this script
  interface TypeChecker {
    getUnionType(types: ts.Type[]): ts.Type;
  }
}

const IGNORED = [
  'base',
  'unions',
  './spec.ts',
  '*/spec.ts',
  path.join('expression', 'literal', 'spec.ts'),
];

const ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(ROOT, 'src');
const TSCONFIG = path.join(ROOT, 'tsconfig.json');

function getTypeName(type: ts.Type): string {
  return (type.getSymbol() ?? type.aliasSymbol)!.getName();
}

function isUndefinedType(type: ts.Type): boolean {
  return (type.flags & ts.TypeFlags.Undefined) != 0;
}

function maybeRemoveUndefinedFromUnion(
  checker: ts.TypeChecker,
  type: ts.Type,
  isOptional: boolean,
): ts.Type {
  if (isOptional && type.isUnion()) {
    const hasUndefined = type.types.find(isUndefinedType);
    if (hasUndefined) {
      // clone the union and remove `undefined` from it
      return checker.getUnionType(type.types.filter(t => !isUndefinedType(t)));
    }
  }

  return type;
}

function inlinePropertyNameComputed(
  checker: ts.TypeChecker,
  type: ts.Type,
): ts.Type {
  if (getTypeName(type) === 'PropertyNameNonComputed') {
    // clone the type to remove the symbol so the type printer will explicitly expand it
    return checker.getUnionType((type as ts.UnionType).types);
  }

  return type;
}

function printInterface(
  checker: ts.TypeChecker,
  type: ts.Type,
  nodeName: string,
  typeName = nodeName,
): void {
  const IGNORED_PROPS = new Set(['type', 'loc', 'range']);
  const properties = checker
    .getPropertiesOfType(type)
    .filter(p => !IGNORED_PROPS.has(p.getName()));

  console.log(`
interface ${typeName} extends BaseNode {
  type: '${nodeName}';
  ${properties
    .map(p => {
      const declaration = p.getDeclarations() ?? [];
      const isOptional = declaration.some(
        d => ts.isPropertySignature(d) && d.questionToken != null,
      );
      const typeString = declaration
        .map(decl => checker.getTypeAtLocation(decl))
        .map(originalType => {
          let type = originalType;
          type = maybeRemoveUndefinedFromUnion(
            checker,
            originalType,
            isOptional,
          );
          if (p.getName() === 'key') {
            type = inlinePropertyNameComputed(checker, type);
          }

          return checker.typeToString(
            type,
            undefined,
            ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
          );
        })
        .join(' | ');

      return `${p.getName()}${isOptional ? '?' : ''}: ${typeString};`;
    })
    .join('\n  ')}
}`);
}

function printUnion(type: ts.UnionType, nodeName: string): void {
  console.log(`
type ${nodeName} =
  | ${type.types.map(t => getTypeName(t)).join('\n  | ')};
`);
}

function main(): void {
  const files = globSync('**/spec.ts', {
    cwd: SRC_ROOT,
    ignore: IGNORED,
  }).map(f => path.join(SRC_ROOT, f));

  for (const filePath of files) {
    console.log(filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    const result = parseAndGenerateServices(code, {
      project: TSCONFIG,
      filePath,
    });

    const checker = result.services.program.getTypeChecker();
    // const sourceFile = result.services.program.getSourceFile(filePath);
    const program = result.services.esTreeNodeToTSNodeMap.get(result.ast);
    const symbol = checker.getSymbolAtLocation(program);
    if (symbol == null) {
      throw new Error(`${filePath} did not have a module symbol`);
    }
    const exports = checker.getExportsOfModule(symbol);

    const nodeName = path.parse(path.dirname(filePath)).name;
    const exportedSymbol = exports.find(ex => ex.getEscapedName() === nodeName);
    if (exportedSymbol == null) {
      throw new Error(`${filePath} does not export a type called ${nodeName}`);
    }

    const exportedType = checker.getDeclaredTypeOfSymbol(exportedSymbol);

    if (exportedType.isUnion()) {
      for (const childType of exportedType.types) {
        printInterface(checker, childType, nodeName, getTypeName(childType));
      }

      printUnion(exportedType, nodeName);

      // eslint-disable-next-line no-process-exit -- TODO - remove this once the script is complete
      process.exit(0);
    } else {
      printInterface(checker, exportedType, nodeName);
    }
  }
}

main();
