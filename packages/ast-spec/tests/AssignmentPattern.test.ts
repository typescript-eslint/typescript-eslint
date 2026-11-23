import type { CallExpression } from '../src/expression/CallExpression/spec';
import type { MemberExpression } from '../src/expression/MemberExpression/spec';
import type { TSAsExpression } from '../src/expression/TSAsExpression/spec';
import type { TSNonNullExpression } from '../src/expression/TSNonNullExpression/spec';
import type { TSSatisfiesExpression } from '../src/expression/TSSatisfiesExpression/spec';
import type { TSTypeAssertion } from '../src/expression/TSTypeAssertion/spec';
import type { AssignmentPattern } from '../src/parameter/AssignmentPattern/spec';

type AssignableTarget<T extends AssignmentPattern['left']> = T;
type RejectInvalidTarget<T extends never> = T;

test('AssignmentPattern.left accepts assignable targets, not arbitrary expressions', () => {
  type Left = AssignmentPattern['left'];
  type _AssignableTargets = [
    AssignableTarget<MemberExpression>,
    AssignableTarget<TSAsExpression>,
    AssignableTarget<TSNonNullExpression>,
    AssignableTarget<TSSatisfiesExpression>,
    AssignableTarget<TSTypeAssertion>,
  ];
  type _RejectedCall = RejectInvalidTarget<Extract<Left, CallExpression>>;

  expectTypeOf<MemberExpression>().toExtend<Left>();
  expectTypeOf<TSAsExpression>().toExtend<Left>();
  expectTypeOf<TSNonNullExpression>().toExtend<Left>();
  expectTypeOf<TSSatisfiesExpression>().toExtend<Left>();
  expectTypeOf<TSTypeAssertion>().toExtend<Left>();

  expectTypeOf<CallExpression>().not.toExtend<Left>();
});
