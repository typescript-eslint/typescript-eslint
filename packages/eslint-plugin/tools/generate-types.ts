/*
TS wants to transpile each rule file to this `.d.ts` file:

```ts
import type { TSESLint } from '@typescript-eslint/utils';
declare const _default: TSESLint.RuleModule<TMessageIds, TOptions, TSESLint.RuleListener>;
export default _default;
```

Because we don't import `TSESLint` in most files, it means that TS would have to
insert a new import during the declaration emit to make this work.

However TS wants to avoid adding new imports to the file because a new module
could have type side-effects (like global augmentation) which could cause weird
type side-effects in the decl file that wouldn't exist in source TS file.

So TS errors on most of our rules with the following error:
```
The inferred type of 'default' cannot be named without a reference to
'../../../../node_modules/@typescript-eslint/utils/src/ts-eslint/Rule'.
This is likely not portable. A type annotation is necessary. ts(2742)
```

Ultimately though we don't need 110% deep and correct types for our module because
the types of the rules don't matter externally.

This script generates approximate type declarations for the plugin -
meaning that the keys will be correct, and the types of the values will be
the supertype of the real values.

This is enough for anyone who is consuming this plugin via types to use safely.

Additional Notes:
- We could manually define a `.d.ts` file for the module - but that's a pain to
  maintain over time because we need to keep it in sync as we add/remove rules
  and configs.
- We can't use `tsc --noEmitOnError=false` for this because TS will not emit
  `.d.ts` files for files with errors - only `.js` files.
- We can't use `api-extractor` for this because that tool *only* operates on
  `.d.ts` files - and we can't generate `.d.ts` files.
*/

// eslint-disable-next-line @typescript-eslint/internal/no-typescript-estree-import
import {
  AST_NODE_TYPES,
  parse,
  simpleTraverse,
} from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/utils';
import * as fs from 'fs';
import makeDir from 'make-dir';
import * as path from 'path';
import prettier from 'prettier';

const OUTPUT_PATH = path.resolve(__dirname, '..', 'dist', '_types');
async function main(): Promise<void> {
  await makeDir(OUTPUT_PATH);

  const declaredNames = await Promise.all([
    writeTypeDef('configs', {
      importedName: 'Linter',
      referenceName: 'Linter.Config',
      moduleName: '@typescript-eslint/utils/ts-eslint',
    }),
    writeTypeDef('rules', {
      importedName: 'RuleModule',
      referenceName: 'RuleModule<string, readonly unknown[]>',
      moduleName: '@typescript-eslint/utils/ts-eslint',
    }),
  ]);

  // write the index file
  const code = format([
    ...declaredNames.map(name => `import type { ${name} } from './${name}'`),
    '',
    'declare const cjsExport: {',
    ...declaredNames.map(name => `${name}: typeof ${name},`),
    '};',
    'export = cjsExport;',
  ]);
  await fs.promises.writeFile(
    path.resolve(OUTPUT_PATH, 'index.d.ts'),
    code,
    'utf8',
  );
}

async function writeTypeDef(
  name: 'configs' | 'rules',
  type: {
    importedName: string;
    referenceName: string;
    moduleName: string;
  },
): Promise<string> {
  const keys = await extractExportedKeys(
    path.resolve(__dirname, '..', 'src', name, 'index.ts'),
    name,
  );

  const code = format([
    `import type { ${type.importedName} } from '${type.moduleName}';`,
    '',
    `type Keys = ${keys.map(k => `'${k}'`).join('\n  | ')};`,
    '',
    `export const ${name}: Readonly<Record<Keys, ${type.referenceName}>>;`,
  ]);

  await fs.promises.writeFile(
    path.resolve(OUTPUT_PATH, `${name}.d.ts`),
    code,
    'utf8',
  );

  return name;
}

const BREAK_TRAVERSE = Symbol();
async function extractExportedKeys(
  file: string,
  name: string,
): Promise<string[]> {
  const program = parse(await fs.promises.readFile(file, 'utf8'));
  const exportedNode = ((): TSESTree.VariableDeclarator => {
    let exportedNode;
    try {
      simpleTraverse(program, {
        enter(node) {
          if (
            node.type === AST_NODE_TYPES.ExportNamedDeclaration &&
            node.declaration?.type === AST_NODE_TYPES.VariableDeclaration &&
            node.declaration.declarations.length === 1 &&
            node.declaration.declarations[0].id.type ===
              AST_NODE_TYPES.Identifier &&
            node.declaration.declarations[0].id.name === name
          ) {
            exportedNode = node.declaration.declarations[0];
            throw BREAK_TRAVERSE;
          }
        },
      });
    } catch (e) {
      if (e !== BREAK_TRAVERSE) {
        throw e;
      }
    }

    if (exportedNode == null) {
      throw new Error(`Unable to find exported name ${name}`);
    }

    return exportedNode;
  })();

  if (exportedNode.init?.type !== AST_NODE_TYPES.ObjectExpression) {
    throw new Error(
      `Expected an exported object, got an exported ${exportedNode.init?.type}`,
    );
  }

  const keys = exportedNode.init.properties.map(k => {
    if (k.type === AST_NODE_TYPES.SpreadElement) {
      throw new Error('Cannot process spread elements');
    }
    if (k.computed) {
      throw new Error('Cannot process computed keys');
    }

    switch (k.key.type) {
      case AST_NODE_TYPES.Identifier:
        return k.key.name;

      case AST_NODE_TYPES.Literal:
        if (typeof k.key.value !== 'string') {
          throw new Error(`Expected a string literal but got ${k.key.value}`);
        }
        return k.key.value;
    }
  });

  return keys;
}

const prettierConfig = prettier.resolveConfig.sync(__dirname);
function format(lines: string[]): string {
  return prettier.format(lines.join('\n'), {
    parser: 'typescript',
    ...prettierConfig,
  });
}

main().catch(error => {
  console.error(error);
});
