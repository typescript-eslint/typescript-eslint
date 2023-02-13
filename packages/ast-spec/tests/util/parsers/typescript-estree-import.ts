/**
 * Nx is picking up on the fact that we technically have a circular dependency between ast-spec
 * and typescript-estree.
 *
 * This circular dependency only occurs in the tests/ for ast-spec and not in the main package source.
 *
 * We could therefore solve this by separating the ast-spec tests out into their own package, but the
 * other option is to get Nx to turn a blind eye to the circular dependency by removing
 * @typescript-eslint/typescript-estree as an explicit devDependency in the package.json and just doing an import here.
 *
 * This file is ignored via a root `.nxignore`
 *
 * This should be the only place in the package that we import from typescript-estree.
 */

// We need to ignore this lint error regarding it being missing from the package.json, see above.
export { parse } from '@typescript-eslint/typescript-estree';
