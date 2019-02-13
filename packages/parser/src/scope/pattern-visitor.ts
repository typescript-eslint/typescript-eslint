import OriginalPatternVisitor from 'eslint-scope/lib/pattern-visitor';
import {
  PatternVisitorCallback,
  PatternVisitorOptions
} from 'eslint-scope/lib/options';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

export class PatternVisitor extends OriginalPatternVisitor {
  constructor(
    options: PatternVisitorOptions,
    rootPattern: any,
    callback: PatternVisitorCallback
  ) {
    super(options, rootPattern, callback);
  }

  static isPattern(node: TSESTree.Node) {
    const nodeType = node.type;

    return (
      OriginalPatternVisitor.isPattern(node) ||
      nodeType === AST_NODE_TYPES.TSParameterProperty ||
      nodeType === AST_NODE_TYPES.TSTypeParameter
    );
  }

  Identifier(node: TSESTree.Identifier): void {
    super.Identifier(node);
    if (node.decorators) {
      this.rightHandNodes.push(...node.decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  ArrayPattern(node: TSESTree.ArrayPattern): void {
    node.elements.forEach(this.visit, this);
    if (node.decorators) {
      this.rightHandNodes.push(...node.decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  ObjectPattern(node: TSESTree.ObjectPattern): void {
    node.properties.forEach(this.visit, this);
    if (node.decorators) {
      this.rightHandNodes.push(...node.decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  RestElement(node: TSESTree.RestElement): void {
    super.RestElement(node);
    if (node.decorators) {
      this.rightHandNodes.push(...node.decorators);
    }
    if (node.typeAnnotation) {
      this.rightHandNodes.push(node.typeAnnotation);
    }
  }

  TSParameterProperty(node: TSESTree.TSParameterProperty): void {
    this.visit(node.parameter);

    if (node.decorators) {
      this.rightHandNodes.push(...node.decorators);
    }
  }

  TSTypeParameter(node: TSESTree.TSTypeParameter): void {
    this.visit(node.name);

    if (node.constraint) {
      this.rightHandNodes.push(node.constraint);
    }
    if (node.default) {
      this.rightHandNodes.push(node.default);
    }
  }
}
