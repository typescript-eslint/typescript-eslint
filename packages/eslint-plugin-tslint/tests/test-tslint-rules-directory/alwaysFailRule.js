
const Lint = require('tslint');

class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile) {
    return this.applyWithWalker(
      new AlwaysFailWalker(sourceFile, this.getOptions())
    );
  }
}

class AlwaysFailWalker extends Lint.RuleWalker {
  visitSourceFile(node) {
    this.addFailure(
      this.createFailure(node.getStart(), node.getWidth(), 'failure')
    );
  }
}

exports.Rule = Rule;
