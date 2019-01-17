/**
 * @fileoverview Enforces explicit accessibility modifiers for class members
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

let rule = require("../../../lib/rules/explicit-member-accessibility"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

let ruleTester = new RuleTester();
ruleTester.run("explicit-member-accessibility", rule, {

    valid: [
        {
            code: `
class Test {
  protected name: string
  private x: number
  public getX () {
    return this.x
  }
}
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: `
class Test {
  x: number
  public getX () {
    return this.x
  }
}
          `,
            parser: "typescript-eslint-parser",
            errors: [{
                message: "Missing accessibility modifier on class property x.",
                line: 3,
                column: 3
            }]
        },
        {
            code: `
class Test {
  private x: number
  getX () {
    return this.x
  }
}
          `,
            parser: "typescript-eslint-parser",
            errors: [{
                message: "Missing accessibility modifier on method definition getX.",
                line: 4,
                column: 3
            }]
        }
    ]
});
