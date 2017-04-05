v2.1.0 - April 4, 2017

* d709fd8 Fix: Set root to true in eslintrc (fixes #211) (#212) (Reyad Attiyat)
* 1e73711 Fix: Optional methods are not marked as optional (fixes #206) (#207) (Rasmus Eneman)
* 1cee2e3 Fix: Nested type arguments are not preserved (fixes #204) (#205) (Rasmus Eneman)
* 5a324a3 Fix: Preserve type parameters for methods (fixes #202) (#203) (Rasmus Eneman)
* bfb1506 New: Add type parameters to more AST nodes (fixes #184) (#183) (Rasmus Eneman)
* 0fadfc3 Fix: Convert MetaProperty (new.target) nodes correcly (fixes #194) (#195) (Reyad Attiyat)
* 4d755ed New: Store type parameter constraints (fixes #188) (#189) (Rasmus Eneman)
* 29d848c Fix: Updated broken class-with-optional-properties test result (#192) (James Henry)
* 04f6556 New: Mark optional parameters and properties (fixes #186) (#187) (Rasmus Eneman)
* cc9d4b3 Fix: Add missing typeAnnotation to class properties (fixes  #190) (#191) (Rasmus Eneman)
* 215a012 Fix: Change DoWhileStatement to DoStatement to match TS (fixes #180) (#181) (James Henry)
* 581a7a5 Fix: Missing parameter properties info in constructors (fixes #143) (#168) (patricio trevino)
* 69d2537 Chore: Add test for constructor and methods with parameters (refs #168) (#178) (Reyad Attiyat)
* c2a0b71 Fix: Add start and end property to tokens (fixes #172) (#176) (Reyad Attiyat)
* 2640d81 Fix: Remove jsdoc node property from ts nodes (fixes #164) (#177) (Reyad Attiyat)
* 701e2c5 Fix: Set name to type JSXIdentifier and fix selfClosing (fixes #172) (#175) (Reyad Attiyat)
* 8b4e548 Fix: Convert Void and Delete expressions to UnaryExpression (fixes #171) (#174) (Reyad Attiyat)

v2.0.0 - February 24, 2017

* 38aef53 Breaking: Updated supported TypeScript version to ~2.2.1 (fixes #149) (#169) (James Henry)
* 25207e0 Fix: Optimize convertTokens, treat JsxText as token (fixes #70) (#158) (James Henry)
* 76c33f8 Fix: Await node should have argument property (fixes #160) (#161) (Reyad Attiyat)
* 2f86bef Fix: Unescape identifiers typescript may prepend underscore (fixes #145) (#159) (Reyad Attiyat)

v1.0.3 - February 10, 2017

* 19e7f15 Docs: Show currently supported TypeScript version (#157) (James Henry)
* e96ba1f Fix: Calculate range correctly for exported generic class (fixes #152) (#155) (Reyad Attiyat)
* 11d5a7d Fix: Handle object types without annotations (fixes #148) (#154) (Reyad Attiyat)
* fc1e6bb Fix: Parameter with assignation provide type annotations (fixes #146) (#147) (patricio trevino)
* e5f378f Fix: Calculate range correctly when class is exported (fixes #152) (#153) (Reyad Attiyat)
* 6312383 Fix: Calculate constructor range using node.parameters.pos (fixes #139) (#140) (Reyad Attiyat)

v1.0.2 - January 12, 2017

* d53f1f8 Fix: Use ts utilities determine variable declaration type (fixes #136) (#138) (Reyad Attiyat)
* 918190d Fix: export type alias ExportNamedDeclaration node generation (fixes #134) (#135) (patricio trevino)

v1.0.1 - January 4, 2017

* 9882a8e Fix: Add missing async property (#133) (James Henry)
* 60843ad Fix: Handle async/await (fixes #119) (#129) (Philipp A)
* 0ff19dd Fix: Exception thrown when space occurs after function name (fixes #123) (#124) (Reyad Attiyat)
* ff283aa Fix: Allow running without options (fixes #121) (#120) (Philipp A)
* dd03b2f Docs: Changed --save to --save-dev in readme (#132) (Amila Welihinda)
* 41ccef5 Build: Add TS as dev-dep, only support minor range (#131) (James Henry)

v1.0.0 - November 11, 2016

* c60f216 Chore: Normalize .yml line endings (fixes #113) (#115) (James Henry)
* 9521396 Breaking: Updated to TypeScript 2.x (fixes #105) (#112) (James Henry)
* a7320df Docs: Update license copyright (Nicholas C. Zakas)
* 51ec64d Fix: Exclude TSNode.flags when deeplyCopy fallback is used (refs #105) (#107) (James Henry)
* 7ebf4d5 Fix: Rename decorator example to avoid issue in TS 2.x (refs #105) (#106) (James Henry)
* 45b9874 Fix: Added missing yml lf gitattribute (#104) (James Henry)
* 4dd3439 Build: Add Node 6.x to Travis (fixes #99) (#98) (Danny Fritz)

v0.4.0 - September 23, 2016

* eb1ad9b Fix: Add loc and range data to generated VariableDeclarator node (#100) (James Henry)
* 5dae849 New: Accessibility Modifiers (fixes #87) (#88) (Danny Fritz)
* 68992eb Fix: Tests break with Windows line-endings (fixes #93) (#97) (Danny Fritz)

v0.3.1 - September 20, 2016

* e36d800 Fix: Convert TypeAliasDeclaration into VariableDeclarator (fixes #89) (#91) (James Henry)
* ac0c95d Fix: Prefix function declarations in TS namespaces (fixes #78) (#82) (James Henry)
* 7cc865e Fix: Support abstract classes and methods (fixes #80) (#81) (James Henry)

v0.3.0 - September 13, 2016

* e76f3b9 New: Convert type alias into variable declaration (refs #77) (#83) (James Henry)
* 5c47ad5 Fix: Convert TSTypeOfExpression to UnaryExpression (fixes #85) (#86) (James Henry)
* 799fd63 Fix: Distinguish between DeclareFunction and FunctionDeclaration (#79) (James Henry)

v0.2.0 - August 29, 2016

* 138495f New: Add accessor decorators to AST (fixes #63) (#73) (James Henry)
* f6a8e71 New: Add property decorators to AST (fixes #71) (#72) (James Henry)
* 328259f New: Add param decorators to the AST (fixes #68) (#69) (James Henry)
* 8b97fe7 New: Add class decorators to AST (fixes #66) (#67) (James Henry)
* 7364cb9 New: Add method decorators to AST (fixes #65) (#64) (James Henry)

v0.1.3 - August 22, 2016

* da984bf Fix: manually update package.json after build failure (Nicholas C. Zakas)
* 5bfb9bf Fix: Check for arguments property on NewExpression (fixes #60) (#62) (James Henry)
* d323ee7 Docs: Add issue template (Nicholas C. Zakas)
* 8f4964c Fix: UpdateExpression detection and operator format (fixes #58) (#59) (James Henry)
* e09ebb3 Fix: Add function type parameters (fixes #52) (#56) (James Henry)

v0.1.1 - August 10, 2016

* 62d14b4 Fix: Class implements generic syntax (fixes #44) (#53) (James Henry)

v0.1.0 - August 9, 2016

* d49b5f1 Build: Add CI build scripts (Nicholas C. Zakas)
* 32a46b3 New: Attaches comments to the ESTree AST (fixes #31) (#49) (James Henry)
* f4856f9 Fix: Class implements conversion (fixes #39) (#43) (Nicholas C. Zakas)
* 795a418 Build: Add linting to npm test (Nicholas C. Zakas)
* d26fec4 New: Automatically generate TS-specific nodes (#40) (Nicholas C. Zakas)
* 46b9c87 Docs: Update README to have the correct phase order. (#35) (Dean Taub)
* a8b00fe Chore: Add jQuery Foundation copyright (Nicholas C. Zakas)
* 560bb99 Fix: Remove console logging of node.kind (fixes #29) (Tom X. Tobin)

v0.1.0-alpha.1 - March 18, 2016

* 0eddb71 New: Implements JSX syntax (fixes #18) (James Henry)
* e890743 Docs: PR validation check (Nicholas C. Zakas)
* c314f77 Build: Don't test Node 0.10 (Nicholas C. Zakas)
* bc05e1a Fix: Ensure true, false and null values are not stringifed (fixes #1) (James Henry)

v0.1.0-alpha.0 - March 4, 2016

* c05b5da Build: Add release tool (Nicholas C. Zakas)
* 091973b Fix: SyntaxKind code checks, update TS peerDependency ^1.7.3 (fixes #15) (James Henry)
* e34f6b4 Fix: Use YAML file for ESLint config (Nicholas C. Zakas)
* e19b29d Update: TypeScript to be a peer dependency (fixes #12) (Nicholas C. Zakas)
* bdb1e3a Fix: Make tests actually work (fixes #6) (Nicholas C. Zakas)
* c61cc81 Docs: Improved detail and accuracy of JSDoc blocks (James Henry)
* 918a9cc Fix: Fixes linting errors (fixes #10) (James Henry)
* 1721dde Fix: Bumped lint script dependencies (fixes #8) (James Henry)
* 2f04e92 Fix: Removed unused reference to acorn-jsx/inject (fixes #2) (James Henry)
* 0e9d61e Docs: Update README with plans (Nicholas C. Zakas)
* c88e3ab New: Finished up ES6 features (Nicholas C. Zakas)
* 0ea1e32 Build: Tag as alpha release (Nicholas C. Zakas)
* 08702b8 Docs: Update README (Nicholas C. Zakas)
* c88ba98 New: First commit (Nicholas C. Zakas)

