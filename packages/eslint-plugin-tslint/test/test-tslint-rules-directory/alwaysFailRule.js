var __extends =
  (this && this.__extends) ||
  function(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype =
      b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
  };
var Lint = require('tslint');
var Rule = (function(_super) {
  __extends(Rule, _super);
  function Rule() {
    _super.apply(this, arguments);
  }
  Rule.prototype.apply = function(sourceFile) {
    return this.applyWithWalker(
      new AlwaysFailWalker(sourceFile, this.getOptions()),
    );
  };
  return Rule;
})(Lint.Rules.AbstractRule);
exports.Rule = Rule;
var AlwaysFailWalker = (function(_super) {
  __extends(AlwaysFailWalker, _super);
  function AlwaysFailWalker() {
    _super.apply(this, arguments);
  }
  AlwaysFailWalker.prototype.visitSourceFile = function(node) {
    this.addFailure(
      this.createFailure(node.getStart(), node.getWidth(), 'failure'),
    );
  };
  return AlwaysFailWalker;
})(Lint.RuleWalker);
