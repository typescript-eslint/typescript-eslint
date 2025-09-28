import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRule } from '../util/index.js';

// Replace with import.meta.dirname when minimum node version supports it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, '../../../..');
export const PACKAGES_DIR = path.join(REPO_ROOT, 'packages');

export default createRule({
  name: 'no-relative-paths-to-internal-packages',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow relative paths to internal packages',
    },
    fixable: 'code',
    messages: {
      noRelativePathsToInternalPackages:
        'Use absolute paths instead of relative paths to import modules in other internal packages.',
    },
    schema: [],
  },

  defaultOptions: [],

  create(context) {
    return {
      ImportDeclaration(node): void {
        const importSource = node.source;
        if (
          importSource.value.startsWith('@typescript-eslint') ||
          !importSource.value.startsWith('.')
        ) {
          return;
        }

        // The idea here is to check if the import source resolves to a different
        // package than the package the file is currently in. This lets us not flag
        // relative paths to modules inside a package called 'utils' but still flag
        // if importing the '@typescript-eslint/utils' package with a relative path.

        const pathOfFileFromPackagesDir = path.relative(
          PACKAGES_DIR,
          context.physicalFilename,
        );
        const packageOfFile = pathOfFileFromPackagesDir.split(path.sep)[0];
        const absolutePathOfImport = path.resolve(
          path.dirname(context.physicalFilename),
          importSource.value,
        );
        const pathOfImportFromPackagesDir = path.relative(
          PACKAGES_DIR,
          absolutePathOfImport,
        );
        const packageOfImport = pathOfImportFromPackagesDir.split(path.sep)[0];

        if (path.dirname(absolutePathOfImport) === REPO_ROOT) {
          // this is to allow importing the root package.json
          return;
        }

        if (packageOfImport !== packageOfFile) {
          context.report({
            node: importSource,
            messageId: 'noRelativePathsToInternalPackages',
            fix: fixer => {
              // Force the output path to be separated with '/' to get consistent
              // results on windows.
              const platformIndependentRelativePathOfImportFromPackagesDir =
                pathOfImportFromPackagesDir.split(path.sep).join('/');
              return fixer.replaceText(
                importSource,
                `'@typescript-eslint/${platformIndependentRelativePathOfImportFromPackagesDir}'`,
              );
            },
          });
        }
      },
    };
  },
});
