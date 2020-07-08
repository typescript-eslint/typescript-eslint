import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import { VisitorBase, VisitorOptions } from './Visitor';

type PatternVisitorCallback = (
  pattern: TSESTree.Identifier,
  info: {
    assignments: (TSESTree.AssignmentPattern | TSESTree.AssignmentExpression)[];
    rest: boolean;
    topLevel: boolean;
  },
) => void;

type PatternVisitorOptions = VisitorOptions;
class PatternVisitor extends VisitorBase {
  public static isPattern(
    node: TSESTree.Node,
  ): node is
    | TSESTree.Identifier
    | TSESTree.ObjectPattern
    | TSESTree.ArrayPattern
    | TSESTree.SpreadElement
    | TSESTree.RestElement
    | TSESTree.AssignmentPattern {
    const nodeType = node.type;

    return (
      nodeType === AST_NODE_TYPES.Identifier ||
      nodeType === AST_NODE_TYPES.ObjectPattern ||
      nodeType === AST_NODE_TYPES.ArrayPattern ||
      nodeType === AST_NODE_TYPES.SpreadElement ||
      nodeType === AST_NODE_TYPES.RestElement ||
      nodeType === AST_NODE_TYPES.AssignmentPattern
    );
  }

  readonly #rootPattern: TSESTree.Node;
  readonly #callback: PatternVisitorCallback;
  readonly #assignments: (
    | TSESTree.AssignmentPattern
    | TSESTree.AssignmentExpression
  )[] = [];
  public readonly rightHandNodes: TSESTree.Node[] = [];
  readonly #restElements: TSESTree.RestElement[] = [];

  constructor(
    options: PatternVisitorOptions,
    rootPattern: TSESTree.Node,
    callback: PatternVisitorCallback,
  ) {
    super(options);
    this.#rootPattern = rootPattern;
    this.#callback = callback;
  }

  protected ArrayExpression(node: TSESTree.ArrayExpression): void {
    node.elements.forEach(this.visit, this);
  }

  protected ArrayPattern(pattern: TSESTree.ArrayPattern): void {
    for (const element of pattern.elements) {
      this.visit(element);
    }
  }

  protected AssignmentExpression(node: TSESTree.AssignmentExpression): void {
    this.#assignments.push(node);
    this.visit(node.left);
    this.rightHandNodes.push(node.right);
    this.#assignments.pop();
  }

  protected AssignmentPattern(pattern: TSESTree.AssignmentPattern): void {
    this.#assignments.push(pattern);
    this.visit(pattern.left);
    this.rightHandNodes.push(pattern.right);
    this.#assignments.pop();
  }

  protected CallExpression(node: TSESTree.CallExpression): void {
    // arguments are right hand nodes.
    node.arguments.forEach(a => {
      this.rightHandNodes.push(a);
    });
    this.visit(node.callee);
  }

  protected Decorator(): void {
    // don't visit any decorators when exploring a pattern
  }

  protected Identifier(pattern: TSESTree.Identifier): void {
    const lastRestElement =
      this.#restElements[this.#restElements.length - 1] ?? null;

    this.#callback(pattern, {
      topLevel: pattern === this.#rootPattern,
      rest:
        lastRestElement !== null &&
        lastRestElement !== undefined &&
        lastRestElement.argument === pattern,
      assignments: this.#assignments,
    });
  }

  protected MemberExpression(node: TSESTree.MemberExpression): void {
    // Computed property's key is a right hand node.
    if (node.computed) {
      this.rightHandNodes.push(node.property);
    }

    // the object is only read, write to its property.
    this.rightHandNodes.push(node.object);
  }

  protected Property(property: TSESTree.Property): void {
    // Computed property's key is a right hand node.
    if (property.computed) {
      this.rightHandNodes.push(property.key);
    }

    // If it's shorthand, its key is same as its value.
    // If it's shorthand and has its default value, its key is same as its value.left (the value is AssignmentPattern).
    // If it's not shorthand, the name of new variable is its value's.
    this.visit(property.value);
  }

  protected RestElement(pattern: TSESTree.RestElement): void {
    this.#restElements.push(pattern);
    this.visit(pattern.argument);
    this.#restElements.pop();
  }

  protected SpreadElement(node: TSESTree.SpreadElement): void {
    this.visit(node.argument);
  }

  protected TSTypeAnnotation(): void {
    // we don't want to visit types
  }
}

export { PatternVisitor, PatternVisitorCallback, PatternVisitorOptions };
