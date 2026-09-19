/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-plus-operands */
// Internal fork of https://github.com/jonchardy/typedoc-plugin-no-inherit,
// pending https://github.com/jonchardy/typedoc-plugin-no-inherit/issues/34
// https://github.com/jonchardy/typedoc-plugin-no-inherit/tree/c799761733e31198107db87d33aea0e673a996c3

import {
  Converter,
  DeclarationReflection,
  Reflection,
  ReflectionKind,
} from 'typedoc';

export function load(app) {
  new NoInheritPlugin().initialize(app);
}

/**
 * A handler that deals with inherited reflections.
 */
class NoInheritPlugin {
  /**
   * Create a new NoInheritPlugin instance.
   */
  initialize(app) {
    app.converter.on(Converter.EVENT_BEGIN, this.onBegin.bind(this));
    app.converter.on(
      Converter.EVENT_CREATE_DECLARATION,
      this.onDeclaration.bind(this),
      null,
      -1100,
    ); // after ImplementsPlugin
    app.converter.on(
      Converter.EVENT_RESOLVE_BEGIN,
      this.onBeginResolve.bind(this),
    );
    this.logger = app.logger;
  }

  /**
   * Triggered when the converter begins converting a project.
   *
   * @param context  The context object describing the current state the converter is in.
   */
  onBegin() {
    this.noInherit = [];
    this.inheritedReflections = [];
  }

  /**
   * Triggered when the converter has created a declaration or signature reflection.
   *
   * Builds the list of classes/interfaces that don't inherit docs and
   * the list of reflections that are inherited that could end up being removed.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  onDeclaration(context, reflection) {
    if (reflection instanceof DeclarationReflection) {
      // class or interface that won't inherit docs
      if (
        reflection.kindOf(ReflectionKind.ClassOrInterface)
        // Fork: always add reflections, regardless of a @noInheritDoc tag
        // &&
        // reflection.comment &&
        // reflection.comment.getTag('@noInheritDoc')
      ) {
        this.noInherit.push(reflection);
        // Fork: we don't use the @noInheritDoc tag
        // reflection.comment.removeTags('@noInheritDoc');
      }
      // class or interface member inherited from a super
      if (
        reflection.inheritedFrom &&
        reflection.parent &&
        reflection.parent.kindOf(ReflectionKind.ClassOrInterface) &&
        (!reflection.overwrites ||
          (reflection.overwrites &&
            reflection.overwrites !== reflection.inheritedFrom))
      ) {
        this.inheritedReflections.push(reflection);
      }
    }
  }

  /**
   * Triggered when the converter begins resolving a project.
   *
   * Goes over the list of inherited reflections and removes any that are down the hierarchy
   * from a class that doesn't inherit docs.
   *
   * @param context The context object describing the current state the converter is in.
   */
  onBeginResolve(context) {
    if (this.noInherit) {
      const project = context.project;
      const removals = [];

      this.inheritedReflections.forEach(reflection => {
        // Look through the inheritance chain for a reflection that is flagged as noInherit for this reflection
        if (this.isNoInheritRecursive(context, reflection, 0)) {
          removals.push(reflection);
        }
      });

      removals.forEach(removal => {
        project.removeReflection(removal);
      });
    }
  }

  /**
   * Checks whether some DeclarationReflection is in the noInherit list.
   * @param search  The DeclarationReflection to search for in the list.
   */
  isNoInherit(search) {
    return this.noInherit.some(
      no => no.id === search.id && no.name === search.name,
    );
  }

  /**
   * Checks whether some Reflection is in the inheritedReflections list.
   * @param search  The Reflection to search for in the list.
   */
  isInherited(search) {
    return this.inheritedReflections.some(
      inh => inh.id === search.id && inh.name === search.name,
    );
  }

  /**
   * Checks whether some reflection's inheritance chain is broken by a class or interface that doesn't inherit docs.
   * @param context  The context object describing the current state the converter is in.
   * @param current  The current reflection being evaluated for non-inheritance.
   * @param depth  The current recursion depth, used for stopping on excessively long inheritance chains.
   */
  isNoInheritRecursive(context, current, depth) {
    if (depth > 20) {
      this.logger.warn(
        `Found inheritance chain with depth > 20, stopping no inherit check: ${current.getFullName()}`,
      );
      return false; // stop if we've recursed more than 20 times
    }

    // As we move up the chain, check if the reflection parent is in the noInherit list
    const parent = current.parent;
    if (!parent) {
      return false;
    }
    if (
      this.isNoInherit(parent) &&
      (depth === 0 || this.isInherited(current))
    ) {
      return true;
    }

    const checkExtended = type => {
      const extended = type?.reflection;
      if (extended instanceof Reflection) {
        const upLevel = extended.getChildByName(current.name);
        if (upLevel && this.isNoInheritRecursive(context, upLevel, depth + 1)) {
          return true;
        }
      }
      return false;
    };

    if (parent.extendedTypes?.some(checkExtended)) {
      return true;
    }

    return false;
  }
}
