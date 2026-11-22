import type { ScopeVariable } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import {
  createRule,
  getStaticMemberAccessValue,
  getStaticStringValue,
  isAssignee,
  isStaticMemberAccessOfValue,
  isTypeAssertion,
  nullThrows,
} from '../util';

const UNNECESSARY_OPERATORS = new Set(['??=', '&&=', '=', '||=']);

export default createRule({
  name: 'no-unnecessary-parameter-property-assignment',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow unnecessary assignment of constructor property parameter',
    },
    messages: {
      unnecessaryAssign:
        'This assignment is unnecessary since it is already assigned by a parameter property.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    /**
     * The report info of each class body being visited. Nested classes have
     * their own, and code in a nested class can still use the outer `this`,
     * as in a computed key, so each lookup goes by class body.
     */
    const reportInfos = new Map<
      TSESTree.Node,
      {
        assignedBeforeConstructor: Set<string>;
        /**
         * Assignments such as `this.foo = foo` that are unnecessary if `foo`
         * still holds the parameter's value. Whether it does depends on code
         * after them, so they're checked once the class body is done.
         */
        possibleCopies: {
          constructorNode: TSESTree.FunctionExpression;
          name: string;
          node: TSESTree.AssignmentExpression;
          rightId: TSESTree.Identifier;
        }[];
        /** Nodes that write to a property of the constructor's `this`. */
        writes: {
          constructorNode: TSESTree.FunctionExpression;
          name: string;
          node: TSESTree.Node;
        }[];
      }
    >();

    /**
     * Each constructor's `this` expressions, including the ones in arrow
     * functions in it, which share its `this`.
     */
    const constructorThisExpressions = new Map<
      TSESTree.FunctionExpression,
      TSESTree.ThisExpression[]
    >();

    function getReportInfo(classBody: TSESTree.Node | undefined) {
      return nullThrows(
        classBody && reportInfos.get(classBody),
        'The class body should have report info',
      );
    }

    function isThisMemberExpression(
      node: TSESTree.Node,
    ): node is TSESTree.MemberExpression {
      return (
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.object.type === AST_NODE_TYPES.ThisExpression
      );
    }

    function getPropertyName(node: TSESTree.Node): string | null {
      if (!isThisMemberExpression(node)) {
        return null;
      }

      if (!node.computed && node.property.type === AST_NODE_TYPES.Identifier) {
        return node.property.name;
      }
      if (node.computed) {
        return getStaticStringValue(node.property);
      }
      return null;
    }

    /**
     * Finds the function that has `node`, or the class static block or class
     * field initializer that has it, as their `this` is that class rather
     * than anything outside it.
     */
    function findThisContainer(
      node: TSESTree.Node | undefined,
    ):
      | TSESTree.AccessorProperty
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | TSESTree.PropertyDefinition
      | TSESTree.StaticBlock
      | undefined {
      for (let current = node; current; current = current.parent) {
        if (
          current.type === AST_NODE_TYPES.FunctionDeclaration ||
          current.type === AST_NODE_TYPES.FunctionExpression ||
          current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          current.type === AST_NODE_TYPES.StaticBlock
        ) {
          return current;
        }
        if (
          (current.parent?.type === AST_NODE_TYPES.AccessorProperty ||
            current.parent?.type === AST_NODE_TYPES.PropertyDefinition) &&
          current.parent.value === current
        ) {
          return current.parent;
        }
      }
      return undefined;
    }

    /**
     * Like `findThisContainer`, but for the code around `node` rather than in
     * it, so a function that is a field's value gives that field.
     */
    function findEnclosingThisContainer(
      node: TSESTree.Node,
    ): ReturnType<typeof findThisContainer> {
      const { parent } = node;
      if (
        (parent?.type === AST_NODE_TYPES.AccessorProperty ||
          parent?.type === AST_NODE_TYPES.PropertyDefinition) &&
        parent.value === node
      ) {
        return parent;
      }
      return findThisContainer(parent);
    }

    /**
     * Whether `node` is an instance field of the class that has
     * `constructorNode`, whose initializer runs as part of the constructor.
     */
    function isInstanceFieldOf(
      node: TSESTree.Node,
      constructorNode: TSESTree.FunctionExpression,
    ): node is TSESTree.AccessorProperty | TSESTree.PropertyDefinition {
      return (
        (node.type === AST_NODE_TYPES.AccessorProperty ||
          node.type === AST_NODE_TYPES.PropertyDefinition) &&
        !node.static &&
        node.parent === constructorNode.parent.parent
      );
    }

    function findThisFunction(
      node: TSESTree.Node | undefined,
    ):
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | undefined {
      const container = findThisContainer(node);
      return container && ASTUtils.isFunction(container)
        ? container
        : undefined;
    }

    function isConstructorFunctionExpression(
      node: TSESTree.Node | undefined,
    ): node is TSESTree.FunctionExpression {
      return (
        node?.type === AST_NODE_TYPES.FunctionExpression &&
        ASTUtils.isConstructor(node.parent)
      );
    }

    /**
     * Whether `node` reads a parameter of `constructorNode` that may not have
     * been written to before `position`, so it still holds the value that the
     * parameter property assigned.
     */
    function isUnchangedConstructorParameter(
      node: TSESTree.Identifier,
      constructorNode: TSESTree.FunctionExpression,
      position: number,
    ): boolean {
      const variable = ASTUtils.findVariable(
        context.sourceCode.getScope(node),
        node,
      );
      const definition = variable?.defs.at(0);

      if (
        definition?.type !== DefinitionType.Parameter ||
        definition.node !== constructorNode
      ) {
        return false;
      }

      // Any write other than the parameter's own default value, including
      // `var foo = 'bar'` or `for (var foo of values)` redeclaring it.
      return !variable?.references.some(reference => {
        if (!reference.isWrite() || reference.identifier === definition.name) {
          return false;
        }
        const writePosition = getEarliestRunPosition(
          reference.identifier,
          constructorNode,
        );
        return writePosition != null && writePosition < position;
      });
    }

    function isParameterPropertyWithName(
      node: TSESTree.Parameter,
      name: string,
    ): boolean {
      return (
        node.type === AST_NODE_TYPES.TSParameterProperty &&
        ((node.parameter.type === AST_NODE_TYPES.Identifier && // constructor (public foo) {}
          node.parameter.name === name) ||
          (node.parameter.type === AST_NODE_TYPES.AssignmentPattern && // constructor (public foo = 1) {}
            node.parameter.left.name === name))
      );
    }

    function getIdentifier(node: TSESTree.Node): TSESTree.Identifier | null {
      if (node.type === AST_NODE_TYPES.Identifier) {
        return node;
      }
      if (
        node.type === AST_NODE_TYPES.TSAsExpression ||
        node.type === AST_NODE_TYPES.TSNonNullExpression
      ) {
        return getIdentifier(node.expression);
      }
      return null;
    }

    /**
     * Whether `node` is an arrow function IIFE that runs all of its body
     * immediately. An async one may stop at an `await` and run the rest later.
     */
    function isSyncArrowIIFE(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        !node.async &&
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      );
    }

    /**
     * Finds the constructor that runs `node` immediately: either directly or
     * through non-async arrow function IIFEs.
     */
    function findImmediateConstructor(
      node: TSESTree.Node,
    ): TSESTree.FunctionExpression | undefined {
      let functionNode = findThisFunction(node);
      while (functionNode && isSyncArrowIIFE(functionNode)) {
        functionNode = findThisFunction(functionNode.parent);
      }

      return isConstructorFunctionExpression(functionNode)
        ? functionNode
        : undefined;
    }

    function findConstructor(
      classBody: TSESTree.ClassBody,
    ): TSESTree.FunctionExpression | undefined {
      for (const member of classBody.body) {
        if (
          member.type === AST_NODE_TYPES.MethodDefinition &&
          member.kind === 'constructor' &&
          member.value.type === AST_NODE_TYPES.FunctionExpression
        ) {
          return member.value;
        }
      }
      return undefined;
    }

    function skipTypeWrappers(node: TSESTree.Node): TSESTree.Node {
      let current = node;
      while (
        isTypeAssertion(current) ||
        current.type === AST_NODE_TYPES.TSNonNullExpression ||
        current.type === AST_NODE_TYPES.TSSatisfiesExpression
      ) {
        current = current.expression;
      }
      return current;
    }

    /**
     * Whether `node` is a property of `this`, as in `this.bar`, `this[key]`
     * or `(this as any).bar`.
     */
    function isThisMemberTarget(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.MemberExpression &&
        skipTypeWrappers(node.object).type === AST_NODE_TYPES.ThisExpression
      );
    }

    /**
     * Goes up from `node` through the expressions whose value may be `node`'s
     * value, as in `cond ? node : other`, `other || node`, `(other, node)`,
     * `node as Type` or `o.bar = node`, stopping at an assignment to a
     * property of `this`, which is the target that `node` reaches.
     */
    function getValueContext(node: TSESTree.Node): TSESTree.Node {
      let current = node;
      while (true) {
        const { parent } = current;
        if (
          !parent ||
          !(
            (parent.type === AST_NODE_TYPES.AssignmentExpression &&
              parent.right === current &&
              !isThisMemberTarget(parent.left)) ||
            (parent.type === AST_NODE_TYPES.ConditionalExpression &&
              parent.test !== current) ||
            parent.type === AST_NODE_TYPES.LogicalExpression ||
            (parent.type === AST_NODE_TYPES.SequenceExpression &&
              parent.expressions.at(-1) === current) ||
            isTypeAssertion(parent) ||
            parent.type === AST_NODE_TYPES.TSNonNullExpression ||
            parent.type === AST_NODE_TYPES.TSSatisfiesExpression
          )
        ) {
          return current;
        }
        current = parent;
      }
    }

    /**
     * Finds the `this` that a function expression is known to be called
     * with: the object of `this.bar = function () {}`, as `this.bar()` calls
     * it with the instance as `this`, or the first argument of
     * `function () {}.call(this)`, `.apply(this)` or `.bind(this)`.
     */
    function findThisOfFunctionExpression(
      node: TSESTree.FunctionExpression,
    ): TSESTree.Node | undefined {
      const value = getValueContext(node);
      const { parent } = value;
      if (
        parent?.type === AST_NODE_TYPES.AssignmentExpression &&
        parent.right === value &&
        isThisMemberTarget(parent.left)
      ) {
        return parent.left;
      }
      if (
        parent?.type === AST_NODE_TYPES.MemberExpression &&
        parent.object === value &&
        isStaticMemberAccessOfValue(parent, context, 'apply', 'bind', 'call') &&
        parent.parent.type === AST_NODE_TYPES.CallExpression &&
        parent.parent.callee === parent
      ) {
        const thisArgument = parent.parent.arguments.at(0);
        if (
          thisArgument &&
          skipTypeWrappers(thisArgument).type === AST_NODE_TYPES.ThisExpression
        ) {
          return thisArgument;
        }
      }
      return undefined;
    }

    /**
     * Finds the constructor whose `this` a write in `node` changes: like
     * `findImmediateConstructor`, but through any arrow function, as each one
     * shares the constructor's `this`. That includes the instance fields of
     * its class, as in `bar = () => { this.foo = 1; }`, and a function
     * expression that is a field's value, as in `bar = function () {}`, or
     * that is called with the constructor's `this`, as in
     * `this.bar = function () {}` or `function () {}.call(this)`.
     */
    function findConstructorOfWrite(
      node: TSESTree.Node,
    ): TSESTree.FunctionExpression | undefined {
      let container = findThisContainer(node);
      while (container?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        container = findEnclosingThisContainer(container);
      }

      if (container?.type === AST_NODE_TYPES.FunctionExpression) {
        if (ASTUtils.isConstructor(container.parent)) {
          return container;
        }
        const thisNode = findThisOfFunctionExpression(container);
        if (thisNode) {
          return findConstructorOfWrite(thisNode);
        }
        const value = getValueContext(container);
        if (
          (value.parent?.type === AST_NODE_TYPES.AccessorProperty ||
            value.parent?.type === AST_NODE_TYPES.PropertyDefinition) &&
          value.parent.value === value
        ) {
          container = value.parent;
        }
      }

      if (
        (container?.type === AST_NODE_TYPES.AccessorProperty ||
          container?.type === AST_NODE_TYPES.PropertyDefinition) &&
        !container.static
      ) {
        return findConstructor(container.parent);
      }

      return undefined;
    }

    function getVariableReads(variable: ScopeVariable | undefined) {
      return variable?.references
        .filter(reference => reference.isRead())
        .map(reference => reference.identifier);
    }

    /**
     * Finds the `this` expressions in `constructorNode` that may read the
     * property `name`: `this.name` other than as the target of `=`, and any
     * `this` not used for a known property, as in `const { name } = this`.
     */
    function getThisPropertyReads(
      constructorNode: TSESTree.FunctionExpression,
      name: string,
    ): TSESTree.ThisExpression[] {
      return (constructorThisExpressions.get(constructorNode) ?? []).filter(
        thisExpression => {
          const { parent } = thisExpression;
          if (
            parent.type !== AST_NODE_TYPES.MemberExpression ||
            parent.object !== thisExpression
          ) {
            return true;
          }
          const propertyName = getPropertyName(parent);
          if (propertyName == null) {
            return true;
          }
          return (
            propertyName === name &&
            !(
              parent.parent.type === AST_NODE_TYPES.AssignmentExpression &&
              parent.parent.operator === '=' &&
              parent.parent.left === parent
            )
          );
        },
      );
    }

    /**
     * Whether `this.name = value` in `constructorNode` may call a setter,
     * which may call `value` right away: one the class has, or one a base
     * class may have if the class doesn't declare `name` itself, as
     * TypeScript reports a property that overrides an accessor.
     */
    function mayCallSetter(
      name: string,
      constructorNode: TSESTree.FunctionExpression,
    ): boolean {
      const classBody = constructorNode.parent.parent as TSESTree.ClassBody;
      let declared = constructorNode.params.some(param =>
        isParameterPropertyWithName(param, name),
      );
      for (const member of classBody.body) {
        // Skipping an abstract accessor only treats its name as undeclared.
        if (
          member.type === AST_NODE_TYPES.StaticBlock ||
          member.type === AST_NODE_TYPES.TSAbstractAccessorProperty ||
          member.type === AST_NODE_TYPES.TSIndexSignature ||
          member.static ||
          member.key.type === AST_NODE_TYPES.PrivateIdentifier ||
          getStaticMemberAccessValue(member, context) !== name
        ) {
          continue;
        }
        if (
          (member.type === AST_NODE_TYPES.MethodDefinition ||
            member.type === AST_NODE_TYPES.TSAbstractMethodDefinition) &&
          member.kind === 'set'
        ) {
          return true;
        }
        declared = true;
      }
      return !declared && classBody.parent.superClass != null;
    }

    /**
     * Finds the nodes a function can only be called through, as in
     * `function f() {}`, `const f = () => {}`, `const o = { f: () => {} }`,
     * `this.f = () => {};` or a field such as `f = () => {}`. Calls from
     * other methods, as in `this.init()`, aren't counted, as with writes in
     * other methods, but a setter that `this.f = () => {};` may call is.
     */
    function getFunctionAccesses(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
      constructorNode: TSESTree.FunctionExpression,
    ): TSESTree.Node[] | undefined {
      if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
        return getVariableReads(
          context.sourceCode.getDeclaredVariables(node).at(0),
        );
      }

      // The object and array literals the function is a value in, if any.
      let holder: TSESTree.Node = node;
      while (true) {
        if (
          holder.parent.type === AST_NODE_TYPES.Property &&
          holder.parent.value === holder &&
          holder.parent.parent.type === AST_NODE_TYPES.ObjectExpression
        ) {
          holder = holder.parent.parent;
        } else if (holder.parent.type === AST_NODE_TYPES.ArrayExpression) {
          holder = holder.parent;
        } else {
          break;
        }
      }

      const { parent } = holder;
      if (
        parent.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.init === holder &&
        parent.id.type === AST_NODE_TYPES.Identifier
      ) {
        return getVariableReads(
          context.sourceCode.getDeclaredVariables(parent).at(0),
        );
      }

      // The properties of `this` that the function is assigned to, as in
      // `this.g = this.f = () => {}`. Only when the assignments are a whole
      // statement: their value, as in `(this.f = () => {})()`, also reaches
      // the function. An assignment that may call a setter is an access too,
      // as the setter may call the function.
      const assignmentAccesses: TSESTree.Node[] = [];
      let assigned: TSESTree.Node = holder;
      while (
        assigned.parent.type === AST_NODE_TYPES.AssignmentExpression &&
        assigned.parent.operator === '=' &&
        assigned.parent.right === assigned &&
        findConstructorOfWrite(assigned.parent.left) === constructorNode
      ) {
        const name = getPropertyName(assigned.parent.left);
        if (name == null) {
          break;
        }
        assignmentAccesses.push(...getThisPropertyReads(constructorNode, name));
        if (mayCallSetter(name, constructorNode)) {
          assignmentAccesses.push(assigned.parent);
        }
        assigned = assigned.parent;
      }
      if (
        assigned !== holder &&
        assigned.parent.type === AST_NODE_TYPES.ExpressionStatement
      ) {
        return assignmentAccesses;
      }

      if (
        isInstanceFieldOf(parent, constructorNode) &&
        parent.value === holder
      ) {
        const name = getStaticMemberAccessValue(parent, context);
        if (typeof name === 'string') {
          return getThisPropertyReads(constructorNode, name);
        }
      }

      return undefined;
    }

    /**
     * Finds the earliest position in `constructorNode` that `node` may run
     * at, or `undefined` if it never runs as part of the constructor.
     *
     * A function can't run before it's created, and one only reachable
     * through a variable or property can't run before that is first read, so
     * `const f = () => { this.foo = 1; };` doesn't run until `f` is used.
     * Instance field initializers run before the constructor's body.
     */
    function getEarliestRunPosition(
      node: TSESTree.Node,
      constructorNode: TSESTree.FunctionExpression,
      visited = new Set<TSESTree.Node>(),
    ): number | undefined {
      return getContainerRunPosition(
        findThisContainer(node),
        node.range[0],
        constructorNode,
        visited,
      );
    }

    /**
     * Like `getEarliestRunPosition`, for code at `position` in `container`.
     */
    function getContainerRunPosition(
      container: ReturnType<typeof findThisContainer>,
      position: number,
      constructorNode: TSESTree.FunctionExpression,
      visited: Set<TSESTree.Node>,
    ): number | undefined {
      if (!container || visited.has(container)) {
        return undefined;
      }
      if (container === constructorNode) {
        return position;
      }
      if (isInstanceFieldOf(container, constructorNode)) {
        return constructorNode.range[0];
      }

      visited.add(container);

      const accesses = ASTUtils.isFunction(container)
        ? getFunctionAccesses(container, constructorNode)
        : undefined;
      if (!accesses) {
        return getContainerRunPosition(
          findEnclosingThisContainer(container),
          container.range[0],
          constructorNode,
          visited,
        );
      }

      let earliest: number | undefined;
      for (const access of accesses) {
        const position = getEarliestRunPosition(
          access,
          constructorNode,
          visited,
        );
        if (position != null && (earliest == null || position < earliest)) {
          earliest = position;
        }
      }
      return earliest;
    }

    /**
     * Finds the latest position that writes before `node` may run at. In a
     * loop, a write later in the loop runs before the next iteration's
     * `node`, so that's the end of `node`'s outermost loop in the
     * constructor.
     */
    function getCopyPosition(
      node: TSESTree.Node,
      constructorNode: TSESTree.FunctionExpression,
    ): number {
      let position = node.range[0];
      for (
        let current: TSESTree.Node | undefined = node;
        current && current !== constructorNode;
        current = current.parent
      ) {
        if (ASTUtils.isLoop(current)) {
          position = current.range[1];
        }
      }
      return position;
    }

    function addWrite(
      name: string,
      node: TSESTree.Node,
      constructorNode: TSESTree.FunctionExpression,
    ): void {
      getReportInfo(constructorNode.parent.parent).writes.push({
        name,
        node,
        constructorNode,
      });
    }

    return {
      ":matches(MethodDefinition[kind='constructor'] > FunctionExpression, AccessorProperty, PropertyDefinition) AssignmentExpression"(
        node: TSESTree.AssignmentExpression,
      ): void {
        const leftName = getPropertyName(node.left);
        const constructorNode = findConstructorOfWrite(node);

        if (!leftName || !constructorNode) {
          return;
        }

        const rightId = getIdentifier(node.right);

        if (
          UNNECESSARY_OPERATORS.has(node.operator) &&
          leftName === rightId?.name &&
          constructorNode.params.some(param =>
            isParameterPropertyWithName(param, leftName),
          )
        ) {
          getReportInfo(constructorNode.parent.parent).possibleCopies.push({
            name: leftName,
            node,
            constructorNode,
            rightId,
          });
          return;
        }

        addWrite(leftName, node, constructorNode);
      },
      ":matches(MethodDefinition[kind='constructor'] > FunctionExpression, AccessorProperty, PropertyDefinition) MemberExpression"(
        node: TSESTree.MemberExpression,
      ): void {
        const name = getPropertyName(node);
        const constructorNode = findConstructorOfWrite(node);

        // Writes such as `this.foo++`, `[this.foo] = values`,
        // `(this.foo as number) = 1`, `delete this.foo` or
        // `delete this?.foo`. A plain `this.foo = value` is handled by the
        // AssignmentExpression listener.
        if (
          name &&
          isAssignee(
            node.parent.type === AST_NODE_TYPES.ChainExpression
              ? node.parent
              : node,
          ) &&
          !(
            node.parent.type === AST_NODE_TYPES.AssignmentExpression &&
            node.parent.left === node
          ) &&
          constructorNode
        ) {
          addWrite(name, node, constructorNode);
        }
      },
      ":matches(MethodDefinition[kind='constructor'] > FunctionExpression, AccessorProperty, PropertyDefinition) ThisExpression"(
        node: TSESTree.ThisExpression,
      ): void {
        const constructorNode = findConstructorOfWrite(node);
        if (!constructorNode) {
          return;
        }
        const thisExpressions = constructorThisExpressions.get(constructorNode);
        if (thisExpressions) {
          thisExpressions.push(node);
        } else {
          constructorThisExpressions.set(constructorNode, [node]);
        }
      },
      ClassBody(node): void {
        reportInfos.set(node, {
          assignedBeforeConstructor: new Set(),
          possibleCopies: [],
          writes: [],
        });
      },
      'ClassBody:exit'(node): void {
        const { assignedBeforeConstructor, possibleCopies, writes } =
          getReportInfo(node);
        reportInfos.delete(node);

        const unnecessaryAssignments: {
          name: string;
          node: TSESTree.AssignmentExpression;
          /**
           * The latest position in the code that this assignment may run
           * after: the end of its outermost loop, or else its start.
           */
          position: number;
        }[] = [];
        for (const copy of possibleCopies) {
          const position = getCopyPosition(copy.node, copy.constructorNode);
          if (
            !isUnchangedConstructorParameter(
              copy.rightId,
              copy.constructorNode,
              position,
            )
          ) {
            writes.push(copy);
          } else if (findImmediateConstructor(copy.node)) {
            // A copy in a callback such as `setTimeout` may run after the
            // property changed, so only report copies that run immediately.
            unnecessaryAssignments.push({
              name: copy.name,
              node: copy.node,
              position,
            });
          }
        }

        // For each property written in the constructor, the earliest position
        // in the code that a write to it may run at.
        const earliestWrites = new Map<string, number>();
        for (const write of writes) {
          const position = getEarliestRunPosition(
            write.node,
            write.constructorNode,
          );
          const earliest = earliestWrites.get(write.name);
          if (position != null && (earliest == null || position < earliest)) {
            earliestWrites.set(write.name, position);
          }
        }

        for (const { name, node, position } of unnecessaryAssignments) {
          const earliestWrite = earliestWrites.get(name);
          if (
            assignedBeforeConstructor.has(name) ||
            (earliestWrite != null && earliestWrite < position)
          ) {
            continue;
          }
          context.report({
            node,
            messageId: 'unnecessaryAssign',
          });
        }
      },
      'PropertyDefinition AssignmentExpression'(
        node: TSESTree.AssignmentExpression,
      ): void {
        const name = getPropertyName(node.left);

        if (!name) {
          return;
        }

        let container = findThisContainer(node);
        // An arrow passed as an argument (`bar = list.map(() => ...)`) counts
        // too, since it may run before the constructor body.
        if (
          container?.type === AST_NODE_TYPES.ArrowFunctionExpression &&
          container.parent.type === AST_NODE_TYPES.CallExpression
        ) {
          const outer = findThisContainer(container.parent);
          if (
            outer?.type === AST_NODE_TYPES.PropertyDefinition &&
            outer.value === container.parent
          ) {
            container = outer;
          }
        }

        if (container?.type !== AST_NODE_TYPES.PropertyDefinition) {
          return;
        }

        getReportInfo(container.parent).assignedBeforeConstructor.add(name);
      },
    };
  },
});
