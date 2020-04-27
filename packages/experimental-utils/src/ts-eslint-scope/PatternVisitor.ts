import ESLintPatternVisitor from 'eslint-scope/lib/pattern-visitor';
import { TSESTree } from '../ts-estree';
import {
  PatternVisitorCallback,
  PatternVisitorOptions,
  Visitor,
} from './Options';

interface PatternVisitor extends Visitor {
  options: PatternVisitorOptions;
  parent?: TSESTree.Node;
  rightHandNodes: TSESTree.Node[];

  Identifier(pattern: TSESTree.Node): void;
  Property(property: TSESTree.Node): void;
  ArrayPattern(pattern: TSESTree.Node): void;
  AssignmentPattern(pattern: TSESTree.Node): void;
  RestElement(pattern: TSESTree.Node): void;
  MemberExpression(node: TSESTree.Node): void;
  SpreadElement(node: TSESTree.Node): void;
  ArrayExpression(node: TSESTree.Node): void;
  AssignmentExpression(node: TSESTree.Node): void;
  CallExpression(node: TSESTree.Node): void;
}
interface PatternVisitorStatic {
  isPattern(node: TSESTree.Node): boolean;
}
interface PatternVisitorConstructor {
  new (
    options: PatternVisitorOptions,
    rootPattern: TSESTree.Node,
    callback: PatternVisitorCallback,
  ): PatternVisitor;
}

const PatternVisitor = ESLintPatternVisitor as PatternVisitorConstructor &
  PatternVisitorStatic;

export { PatternVisitor, PatternVisitorStatic };
