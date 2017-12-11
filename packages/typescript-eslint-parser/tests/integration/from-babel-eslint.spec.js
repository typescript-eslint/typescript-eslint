/**
 * LICENCE from babel-eslint
 */
// Copyright (c) 2014-2016 Sebastian McKenzie <sebmck@gmail.com>

// MIT License

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


"use strict";

const unpad = require("dedent");

const utils = require("./utils");
const verifyAndAssertMessages = utils.verifyAndAssertMessages;

describe("Non-regression tests from babel-eslint", () => {
    it("arrow function support (issue #1)", () => {
        verifyAndAssertMessages("describe('stuff', () => {});", {}, []);
    });

    it("EOL validation (issue #2)", () => {
        verifyAndAssertMessages(
            "module.exports = \"something\";",
            { "eol-last": 1, semi: 1 },
            ["1:30 Newline required at end of file but not found. eol-last"]
        );
    });

    it("Modules support (issue #5)", () => {
        verifyAndAssertMessages(
            unpad(`
          import Foo from 'foo';
          export default Foo;
          export const c = 'c';
          export class Store {}
        `),
            {},
            [],
            "module"
        );
    });

    it("Rest parameters (issue #7)", () => {
        verifyAndAssertMessages(
            "function foo(...args) { return args; }",
            { "no-undef": 1 },
            []
        );
    });

    it("Exported classes should be used (issue #8)", () => {
        verifyAndAssertMessages(
            "class Foo {} module.exports = Foo;",
            { "no-unused-vars": 1 },
            []
        );
    });

    it("super keyword in class (issue #10)", () => {
        verifyAndAssertMessages(
            "class Foo { constructor() { super() } }",
            { "no-undef": 1 },
            []
        );
    });

    it("Rest parameter in destructuring assignment (issue #11)", () => {
        verifyAndAssertMessages(
            "const [a, ...rest] = ['1', '2', '3']; module.exports = rest;",
            { "no-undef": 1 },
            [],
            "script",
            {
                envs: ["node"]
            }
        );
    });

    it("JSX attribute names marked as variables (issue #12)", () => {
        verifyAndAssertMessages(
            "module.exports = <div className=\"foo\" />",
            { "no-undef": 1 },
            [],
            "script",
            {
                envs: ["node"]
            }
        );
    });

    it("Multiple destructured assignment with compound properties (issue #16)", () => {
        verifyAndAssertMessages(
            "module.exports = { ...a.a, ...a.b };",
            { "no-dupe-keys": 1 },
            []
        );
    });

    it("Arrow function with non-block bodies (issue #20)", () => {
        verifyAndAssertMessages(
            "\"use strict\"; () => 1",
            { strict: [1, "global"] },
            [],
            "script"
        );
    });

    it("#242", () => {
        verifyAndAssertMessages(
            "\"use strict\"; asdf;",
            { "no-irregular-whitespace": 1 },
            [],
            {}
        );
    });

    it("await keyword (issue #22)", () => {
        verifyAndAssertMessages(
            "async function foo() { await bar(); }",
            { "no-unused-expressions": 1 },
            []
        );
    });

    it("arrow functions (issue #27)", () => {
        verifyAndAssertMessages(
            "[1, 2, 3].map(i => i * 2);",
            { "func-names": 1, "space-before-blocks": 1 },
            []
        );
    });

    it("comment with padded-blocks (issue #33)", () => {
        verifyAndAssertMessages(
            unpad(`
          if (a) {
            // i'm a comment!
            let b = c
          }
        `),
            { "padded-blocks": [1, "never"] },
            []
        );
    });

    it("class usage", () => {
        verifyAndAssertMessages(
            "class Lol {} module.exports = Lol;",
            { "no-unused-vars": 1 },
            []
        );
    });

    it("class definition: gaearon/redux#24", () => {
        verifyAndAssertMessages(
            unpad(`
          export default function root(stores) {
          return DecoratedComponent => class ReduxRootDecorator {
          a() { DecoratedComponent; stores; }
          };
          }
        `),
            { "no-undef": 1, "no-unused-vars": 1 },
            []
        );
    });

    it("template strings #31", () => {
        verifyAndAssertMessages(
            "console.log(`${a}, b`);",
            { "comma-spacing": 1 },
            []
        );
    });

    it("template with destructuring #31", () => {
        verifyAndAssertMessages(
            unpad(`
          module.exports = {
          render() {
          var {name} = this.props;
          return Math.max(null, \`Name: \${name}, Name: \${name}\`);
          }
          };
        `),
            { "comma-spacing": 1 },
            []
        );
    });

    describe("decorators #72", () => {
        // it("class declaration", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     import classDeclaration from 'decorator';
        //     import decoratorParameter from 'decorator';
        //     @classDeclaration((parameter) => parameter)
        //     @classDeclaration(decoratorParameter)
        //     @classDeclaration
        //     export class TextareaAutosize {}
        //   `),
        //         { "no-unused-vars": 1 },
        //         [],
        //         "module"
        //     );
        // });

        // it("method definition", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     import classMethodDeclarationA from 'decorator';
        //     import decoratorParameter from 'decorator';
        //     export class TextareaAutosize {
        //     @classMethodDeclarationA((parameter) => parameter)
        //     @classMethodDeclarationA(decoratorParameter)
        //     @classMethodDeclarationA
        //     methodDeclaration(e) {
        //     e();
        //     }
        //     }
        //   `),
        //         { "no-unused-vars": 1 },
        //         []
        //     );
        // });

        // it("method definition get/set", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     import classMethodDeclarationA from 'decorator';
        //     import decoratorParameter from 'decorator';
        //     export class TextareaAutosize {
        //     @classMethodDeclarationA((parameter) => parameter)
        //     @classMethodDeclarationA(decoratorParameter)
        //     @classMethodDeclarationA
        //     get bar() { }
        //     @classMethodDeclarationA((parameter) => parameter)
        //     @classMethodDeclarationA(decoratorParameter)
        //     @classMethodDeclarationA
        //     set bar(val) { val; }
        //     }
        //   `),
        //         { "no-unused-vars": 1 },
        //         []
        //     );
        // });

        // it("object property", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     import classMethodDeclarationA from 'decorator';
        //     import decoratorParameter from 'decorator';
        //     var obj = {
        //     @classMethodDeclarationA((parameter) => parameter)
        //     @classMethodDeclarationA(decoratorParameter)
        //     @classMethodDeclarationA
        //     methodDeclaration(e) {
        //     e();
        //     }
        //     };
        //     obj;
        //   `),
        //         { "no-unused-vars": 1 },
        //         []
        //     );
        // });

        // it("object property get/set", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     import classMethodDeclarationA from 'decorator';
        //     import decoratorParameter from 'decorator';
        //     var obj = {
        //     @classMethodDeclarationA((parameter) => parameter)
        //     @classMethodDeclarationA(decoratorParameter)
        //     @classMethodDeclarationA
        //     get bar() { },
        //     @classMethodDeclarationA((parameter) => parameter)
        //     @classMethodDeclarationA(decoratorParameter)
        //     @classMethodDeclarationA
        //     set bar(val) { val; }
        //     };
        //     obj;
        //   `),
        //         { "no-unused-vars": 1 },
        //         []
        //     );
        // });
    });

    it("detects minimal no-unused-vars case #120", () => {
        verifyAndAssertMessages("var unused;", { "no-unused-vars": 1 }, [
            "1:5 'unused' is defined but never used. no-unused-vars"
        ]);
    });

    // This two tests are disabled, as the feature to visit properties when
    // there is a spread/rest operator has been removed as it caused problems
    // with other rules #249
    it.skip("visits excluded properties left of spread #95", () => {
        verifyAndAssertMessages(
            "var originalObject = {}; var {field1, field2, ...clone} = originalObject;",
            { "no-unused-vars": 1 },
            []
        );
    });

    it.skip("visits excluded properties left of spread #210", () => {
        verifyAndAssertMessages(
            "const props = { yo: 'yo' }; const { ...otherProps } = props;",
            { "no-unused-vars": 1 },
            []
        );
    });

    it("does not mark spread variables false-positive", () => {
        verifyAndAssertMessages(
            "var originalObject = {}; var {field1, field2, ...clone} = originalObject;",
            { "no-undef": 1, "no-redeclare": 1 },
            []
        );
    });

    it("does not mark spread variables false-positive", () => {
        verifyAndAssertMessages(
            "const props = { yo: 'yo' }; const { ...otherProps } = props;",
            { "no-undef": 1, "no-redeclare": 1 },
            []
        );
    });

    it("does not mark spread variables as use-before-define #249", () => {
        verifyAndAssertMessages(
            "var originalObject = {}; var {field1, field2, ...clone} = originalObject;",
            { "no-use-before-define": 1 },
            []
        );
    });

    it("detects no-unused-vars with object destructuring #142", () => {
        verifyAndAssertMessages(
            "const {Bacona} = require('baconjs')",
            { "no-undef": 1, "no-unused-vars": 1 },
            ["1:8 'Bacona' is assigned a value but never used. no-unused-vars"],
            "script",
            {
                envs: ["node"]
            }
        );
    });

    it("don't warn no-unused-vars with spread #142", () => {
        verifyAndAssertMessages(
            unpad(`
          export default function test(data) {
          return {
          foo: 'bar',
          ...data
          };
          }
        `),
            { "no-undef": 1, "no-unused-vars": 1 },
            []
        );
    });

    it("excludes comment tokens #153", () => {
        verifyAndAssertMessages(
            unpad(`
          var a = [
          1,
          2, // a trailing comment makes this line fail comma-dangle (always-multiline)
          ];
        `),
            { "comma-dangle": [2, "always-multiline"] },
            []
        );

        verifyAndAssertMessages(
            unpad(`
          switch (a) {
          // A comment here makes the above line fail brace-style
          case 1:
          console.log(a);
          }
        `),
            { "brace-style": 2 },
            []
        );
    });

    it("ternary and parens #149", () => {
        verifyAndAssertMessages(
            "true ? (true) : false;",
            { "space-infix-ops": 1 },
            []
        );
    });

    it("line comment space-in-parens #124", () => {
        verifyAndAssertMessages(
            unpad(`
          React.createClass({
          render() {
          // return (
          //   <div />
          // ); // <-- this is the line that is reported
          }
          });
        `),
            { "space-in-parens": 1 },
            []
        );
    });

    it("block comment space-in-parens #124", () => {
        verifyAndAssertMessages(
            unpad(`
          React.createClass({
          render() {
          /*
          return (
            <div />
          ); // <-- this is the line that is reported
          */
          }
          });
        `),
            { "space-in-parens": 1 },
            []
        );
    });

    it("no no-undef error with rest #11", () => {
        verifyAndAssertMessages(
            "const [a, ...rest] = ['1', '2', '3']; a; rest;",
            { "no-undef": 1, "no-unused-vars": 1 },
            []
        );
    });

    it("async function with space-before-function-paren #168", () => {
        verifyAndAssertMessages(
            "it('handles updates', async function() {});",
            { "space-before-function-paren": [1, "never"] },
            []
        );
    });

    it("no-use-before-define #192", () => {
        verifyAndAssertMessages(
            unpad(`
          console.log(x);
          var x = 1;
        `),
            { "no-use-before-define": 1 },
            ["1:13 'x' was used before it was defined. no-use-before-define"]
        );
    });

    it("jsx and stringliteral #216", () => {
        verifyAndAssertMessages("<div className=''></div>", {}, []);
    });

    it("getter/setter #218", () => {
        verifyAndAssertMessages(
            unpad(`
          class Person {
              set a (v) { }
          }
        `),
            {
                "space-before-function-paren": 1,
                "keyword-spacing": [1, { before: true }],
                indent: 1
            },
            []
        );
    });

    it("getter/setter #220", () => {
        verifyAndAssertMessages(
            unpad(`
          var B = {
          get x () {
          return this.ecks;
          },
          set x (ecks) {
          this.ecks = ecks;
          }
          };
        `),
            { "no-dupe-keys": 1 },
            []
        );
    });

    it("correctly detects redeclares if in script mode #217", () => {
        verifyAndAssertMessages(
            unpad(`
          var a = 321;
          var a = 123;
        `),
            { "no-redeclare": 1 },
            ["2:5 'a' is already defined. no-redeclare"],
            "script"
        );
    });

    // it("correctly detects redeclares if in module mode #217", () => {
    //     verifyAndAssertMessages(
    //         unpad(`
    //       var a = 321;
    //       var a = 123;
    //     `),
    //         { "no-redeclare": 1 },
    //         ["2:5 'a' is already defined. no-redeclare"],
    //         "module"
    //     );
    // });

    it("no-implicit-globals in script", () => {
        verifyAndAssertMessages(
            "var leakedGlobal = 1;",
            { "no-implicit-globals": 1 },
            [
                "1:5 Implicit global variable, assign as global property instead. no-implicit-globals"
            ],
            "script",
            {
                env: {},
                parserOptions: { ecmaVersion: 6, sourceType: "script" }
            }
        );
    });

    it("no-implicit-globals in module", () => {
        verifyAndAssertMessages(
            "var leakedGlobal = 1;",
            { "no-implicit-globals": 1 },
            [],
            "module",
            {
                env: {},
                parserOptions: { ecmaVersion: 6, sourceType: "module" }
            }
        );
    });

    // it("no-implicit-globals in default", () => {
    //     verifyAndAssertMessages(
    //         "var leakedGlobal = 1;",
    //         { "no-implicit-globals": 1 },
    //         [],
    //         null,
    //         {
    //             env: {},
    //             parserOptions: { ecmaVersion: 6 }
    //         }
    //     );
    // });

    it("with does not crash parsing in script mode (strict off) #171", () => {
        verifyAndAssertMessages("with (arguments) { length; }", {}, [], "script");
    });

    // it("with does crash parsing in module mode (strict on) #171", () => {
    //     verifyAndAssertMessages("with (arguments) { length; }", {}, [
    //         "1:1 Parsing error: 'with' in strict mode"
    //     ]);
    // });

    it("new.target is not reported as undef #235", () => {
        verifyAndAssertMessages(
            "function foo () { return new.target }",
            { "no-undef": 1 },
            []
        );
    });

    // it("decorator does not create TypeError #229", () => {
    //     verifyAndAssertMessages(
    //         unpad(`
    //       class A {
    //         @test
    //         f() {}
    //       }
    //     `),
    //         { "no-undef": 1 },
    //         ["2:4 'test' is not defined. no-undef"]
    //     );
    // });

    it("newline-before-return with comments #289", () => {
        verifyAndAssertMessages(
            unpad(`
          function a() {
          if (b) {
          /* eslint-disable no-console */
          console.log('test');
          /* eslint-enable no-console */
          }
  
          return hasGlobal;
          }
        `),
            { "newline-before-return": 1 },
            []
        );
    });

    describe("Class Property Declarations", () => {
        // it("no-redeclare false positive 1", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     class Group {
        //       static propTypes = {};
        //     }
        //     class TypicalForm {
        //       static propTypes = {};
        //     }
        //   `),
        //         { "no-redeclare": 1 },
        //         []
        //     );
        // });

        // it("no-redeclare false positive 2", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     function validate() {}
        //     class MyComponent {
        //       static validate = validate;
        //     }
        //   `),
        //         { "no-redeclare": 1 },
        //         []
        //     );
        // });

        // it("check references", () => {
        //     verifyAndAssertMessages(
        //         unpad(`
        //     var a;
        //     class A {
        //       prop1;
        //       prop2 = a;
        //       prop3 = b;
        //     }
        //     new A
        //   `),
        //         { "no-undef": 1, "no-unused-vars": 1, "no-redeclare": 1 },
        //         ["5:11 'b' is not defined. no-undef"]
        //     );
        // });
    });

    it("dynamic import support", () => {
        verifyAndAssertMessages("import('test-module').then(() => {})", {}, []);
    });

    it("regex with es6 unicodeCodePointEscapes", () => {
        verifyAndAssertMessages(
            "string.replace(/[\u{0000A0}-\u{10FFFF}<>&]/gmiu, (char) => `&#x${char.codePointAt(0).toString(16)};`);",
            {},
            []
        );
    });

    it("works with dynamicImport", () => {
        verifyAndAssertMessages(
            unpad(`
          import('a');
        `),
            {},
            []
        );
    });

    it("works with optionalCatchBinding", () => {
        verifyAndAssertMessages(
            unpad(`
          try {} catch {}
          try {} catch {} finally {}
        `),
            {},
            []
        );
    });
});

