import { AnalysisOptions } from './analyze';
import { TSESTree } from '../ts-estree';

type PatternVisitorCallback = (
  pattern: TSESTree.Identifier,
  info: {
    assignments: (TSESTree.AssignmentPattern | TSESTree.AssignmentExpression)[];
    rest: boolean;
    topLevel: boolean;
  },
) => void;

interface PatternVisitorOptions {
  processRightHandNodes?: boolean;
  childVisitorKeys?: AnalysisOptions['childVisitorKeys'];
  fallback?: AnalysisOptions['fallback'];
}

interface Visitor {
  visitChildren<T extends TSESTree.Node>(node?: T | undefined | null): void;
  visit<T extends TSESTree.Node>(node?: T | undefined | null): void;
}

export { PatternVisitorCallback, PatternVisitorOptions, Visitor };
