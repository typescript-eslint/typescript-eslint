import { version as ESLintVersion } from 'eslint-scope';

export * from './analyze';
export * from './Definition';
export * from './Options';
export * from './PatternVisitor';
export * from './Reference';
export * from './Referencer';
export * from './Scope';
export * from './ScopeManager';
export * from './Variable';
export const version: string = ESLintVersion;
