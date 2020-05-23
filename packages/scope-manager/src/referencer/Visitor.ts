import { TSESTree } from '@typescript-eslint/types';
import { VisitorBase, VisitorOptions } from './VisitorBase';
import {
  PatternVisitor,
  PatternVisitorCallback,
  PatternVisitorOptions,
} from './PatternVisitor';

interface VisitPatternOptions extends PatternVisitorOptions {
  processRightHandNodes?: boolean;
}
class Visitor extends VisitorBase {
  readonly #options: VisitorOptions;
  constructor(optionsOrVisitor: VisitorOptions | Visitor) {
    super(
      optionsOrVisitor instanceof Visitor
        ? optionsOrVisitor.#options
        : optionsOrVisitor,
    );

    this.#options =
      optionsOrVisitor instanceof Visitor
        ? optionsOrVisitor.#options
        : optionsOrVisitor;
  }

  protected visitPattern(
    node: TSESTree.Node,
    callback: PatternVisitorCallback,
    options: VisitPatternOptions = { processRightHandNodes: false },
  ): void {
    // Call the callback at left hand identifier nodes, and Collect right hand nodes.
    const visitor = new PatternVisitor(this.#options, node, callback);

    visitor.visit(node);

    // Process the right hand nodes recursively.
    if (options.processRightHandNodes) {
      visitor.rightHandNodes.forEach(this.visit, this);
    }
  }
}

export { Visitor, VisitorBase, VisitorOptions };
