v20.1.0 - October 30, 2018

* 075d243 Chore: Make ESLint a devDependency/peerDependency (fixes #523) (#526) (Kevin Partington)
* 4310aac Chore: Force LF for tsx files (#520) (Benjamin Lichtman)
* bacac5f New: Add visitor keys (#516) (Michał Sajnóg)
* 4172933 Upgrade: eslint-release@1.0.0 (#527) (Teddy Katz)

v20.0.0 - October 8, 2018

* f4b9893 Breaking: Support TypeScript 3.1 (fixes #524) (#525) (James Henry)

v19.0.2 - September 29, 2018

* aa0fe13 Fix: Re-expose parse method (fixes #519) (#521) (Kevin Partington)
* 655359f Chore: Makefile tweaks (#522) (Kevin Partington)

v19.0.1 - September 25, 2018

* 7a367c7 Fix: Remove lib from package.json files (#518) (James Henry)

v19.0.0 - September 25, 2018

* 3d3ab2f Breaking: Use typescript-estree for parsing (#515) (James Henry)

v18.0.0 - August 6, 2018

* 16d1a78 Breaking: Support TypeScript 3.0 (#504) (James Henry)
* 7461462 Fix: remove unnecessary TypeRef wrapper for ImportType (fixes #507) (#508) (Ika)

v17.0.1 - July 26, 2018

* f1d7de3 Chore: Replace removed API with public flags (fixes #498) (#505) (Texas Toland)

v17.0.0 - July 26, 2018

* 117800d Fix: support JSXSpreadChild (fixes #500) (#501) (Ika)
* 6eec85b Breaking: Remove "Experimental" from rest and spread (fixes #428) (#429) (Lucas Duailibe)
* 42f29a1 Fix: error on multiple super classes (fixes #493) (#494) (Ika)
* 11d9169 Breaking: always set optional on ClassProperty (fixes #472) (#491) (Ika)

v16.0.1 - June 27, 2018

* bc83c6a Chore: Do not run integration tests within npm test (James Henry)
* db62d63 Fix: Snapshot all ecma-features fixtures (#495) (James Henry)
* 3c1fab0 Fix: support ImportMeta (fixes #489) (#490) (Ika)
* 6611535 Chore: Loosen node version requirement in package.json (fixes #482) (#484) (James Henry)
* 27f39cc Chore: Powerful integration tests and improved README (#483) (James Henry)

v16.0.0 - June 3, 2018

* 009336d Breaking: Set minimum node version to 6 (#481) (James Henry)
* 9316b23 Breaking: Support TypeScript 2.9 (#480) (James Henry)

v15.0.1 - June 3, 2018

* 891cee9 Fix: decorators removed on interface declarations (fixes #478) (#479) (Muhanad Rabie)

v15.0.0 - April 17, 2018

* e572416 Breaking: Support TypeScript 2.8 (fixes #453) (#454) (James Henry)

v14.0.0 - February 21, 2018

* 439ea24 New: Support Definite Assignment (fixes #424) (#432) (Lucas Azzola)
* adc0b1b Breaking: Remove all tokens inside comments from tokens array (fixes #422) (#423) (Kai Cataldo)

v13.0.0 - February 9, 2018

* fb5e4c4 Breaking: Support TypeScript 2.7 (fixes #442,#426) (#447) (James Henry)
* bd9c12f Docs: Update Known Issues section of README (#440) (Kepler Sticka-Jones)

v12.0.0 - January 16, 2018

* 6ce4cd8 Breaking: Properly categorize constructors with no body (#427) (Jed Fox)
* e94ede3 Docs: Sets default code block language in issue template to "ts" (#421) (Marius Schulz)

v11.0.0 - December 13, 2017

* 6698042 Breaking: No prefix on FnDec within namespace (fixes #127) (#413) (James Henry)
* aec31cb Breaking: Implement parseForESLint() function (#412) (James Henry)

v10.0.0 - December 11, 2017

* 59a37f4 Breaking: Updates to AST node types of some TSNodes (fixes #386) (#388) (James Henry)
* 627355e Chore: Introduce integration tests (#411) (James Henry)
* b4d22e7 Chore: No package-lock like other ESLint repos (#409) (James Henry)

v9.0.1 - November 29, 2017

* 153cdb8 Fix: Calculate end position of TypeInstantiation (fixes #406) (#405) (Lucas Duailibe)
* 678907b Fix: Explicitly convert AbstractKeyword (fixes #407) (#408) (James Henry)

v9.0.0 - November 10, 2017

* 46479e8 Breaking: Support TypeScript 2.6 (fixes #394) (#397) (James Henry)

v8.0.1 - October 22, 2017

* 0401ffc Fix: Calculate typeArguments loc data correctly if empty (fixes #395) (#396) (James Henry)
* a214f71 Chore: Add a way to test TSX specific issues (fixes #376) (#398) (James Henry)
* 9c71a62 Fix: add missing TSSymbolKeyword type (#385) (Ika)
* e10aab8 Chore: Refactor alignment tests, now on by default (#387) (James Henry)
* 9e17d0b Chore: Minor cleanup, fix jQuery foundation copyright (#383) (James Henry)

v8.0.0 - September 5, 2017

* 9877e98 Breaking: Support TypeScript 2.5 (fixes #368) (#369) (#370) (James Henry)
* 5b49870 Fix: Location data for typeAnnotations (#378) (James Henry)

v7.0.0 - August 22, 2017

* 01c34f4 Fix: Ensure exports applied to TSModuleDeclaration (#375) (James Henry)
* 38bd1ae Breaking: Check for isTypeKeyword in type params (fixes #373) (#374) (James Henry)
* 3727956 Breaking: Handle TSModuleDeclaration and refactor (fixes #371) (#372) (James Henry)
* d67ee6c Fix: Typo in TSExportAssignment node type (#367) (James Henry)

v6.0.1 - August 19, 2017

* 7bcc0d6 Fix: Ensure modifiers are applied to enums (fixes #365) (#366) (James Henry)

v6.0.0 - August 19, 2017

* 32c0cc8 Breaking: Explicitly handle TSEnumDeclaration (fixes #345) (#364) (James Henry)
* 5f741a9 Fix: Allow other orderings of implements/extends clauses (fixes #361) (#363) (Jed Fox)
* f5bd145 Chore: Breakout and label TS-specific AST comparison tests (#360) (James Henry)
* f6e56b3 Chore: Build out AST comparison tests and categorize issues (#358) (James Henry)
* ab4e05e Breaking: Only add .implements/.accessibility/.decorators if truthy (#354) (James Henry)
* 275897b Fix: Location data for methods and constructors (#357) (James Henry)
* 5fce5e7 Fix: Exp. operator assignment is AssignmentExpression (fixes #355) (#356) (James Henry)
* 67971de Fix: Include newlines at the end of source in AST (fixes #352) (#353) (James Henry)
* 8406209 Fix: Remove start and end values from JSX tokens (fixes #341) (#351) (James Henry)

v5.0.1 - August 9, 2017

* 81e20c0 Fix: Only warn about an unsupported TypeScript version once (#347) (Jed Fox)
* 5e22fac Chore: AST alignment testing against Babylon (#342) (James Henry)

v5.0.0 - August 6, 2017

* 271b4f1 New: Support TypeScript 2.4 (fixes #321) (#322) (#326) (James Henry)
* ea6c3bb Breaking: Use TSTypeReference for TypeParameters (#340) (James Henry)
* a9ca775 Fix: Use name 'this' in JSXMemberExpression (fixes #337) (#338) (Reyad Attiyat)
* ef2687b Fix: Handle assignment within property destructuring (fixes #332) (#336) (James Henry)

v4.0.0 - July 10, 2017

* 6a612cd Breaking: Include type annotation range for Identifiers (fixes #314) (#319) (Reyad Attiyat)
* 074a64f Fix: Arrow function body should be ObjectExpression (fixes #331) (#334) (Reyad Attiyat)
* fb66f61 Fix: Unescape string literal identifiers (fixes #328) (#330) (Lucas Azzola)
* 9cab9d3 Breaking: Remove TypeAnnotation wrapper from constraint (#325) (James Henry)
* b255499 New: Provider loggerFn option to configure logging (fixes #323) (#324) (James Henry)
* 0540298 Fix: Calculate correct type parameter range (fixes #316) (#320) (Reyad Attiyat)
* 4938c2c Fix: Ensure JSX tag names are JSXIdentifiers (fixes #315) (#318) (Reyad Attiyat)
* 1f20557 Fix: Use TSExportAssignment node type (fixes #304) (#317) (Reyad Attiyat)
* b26cda1 Fix: Use TSNullKeyword for null type instead of Literal (#313) (James Henry)
* 9037dc5 Chore: Add node 8 to .travis.yml (#312) (James Henry)
* 8062515 Chore: Refactor tests to assert snapshots not JSON (#311) (James Henry)
* 2ad791b Fix: Add name to JSXIdentifier when converting ThisKeyword (fixes #307) (#310) (Reyad Attiyat)
* 519907e Breaking: Use ESTree export node types in modules (fixes# 263) (#265) (Reyad Attiyat)
* c4b0b64 Fix: Label readonly class properties (fixes #302) (#303) (Reyad Attiyat)
* bffd6cc Fix: Add more tests for destructuring and spread (fixes #306) (#308) (Reyad Attiyat)
* f7c9246 Chore: Fix typo in comment (#305) (Jeremy Attali)
* 3dcba7d Breaking: Change isReadonly to readonly (fixes #284) (#285) (James Henry)
* bc9225f Chore: Replace mocha (istanbul, chai, leche) with Jest (#300) (James Henry)
* 8744577 Breaking: Decorator ESTree compliance, always convert (fixes #250) (#293) (James Henry)
* dd6404a Breaking: Convert Signature types to be more ESTree like (fixes #262) (#264) (Reyad Attiyat)
* 379dcaf Fix: Only set optional property on certain node property (fixes #289) (#292) (Reyad Attiyat)
* 89f8561 Fix: Label static and export in TSParameterProperty (fixes #286) (#301) (Reyad Attiyat)
* 992f1fa Fix: Unescape type parameter names (fixes #296) (#298) (Reyad Attiyat)
* 5ed8573 Fix: Async generator method should be labeled (fixes #297) (#299) (Reyad Attiyat)
* 31ad3c4 Fix: Create RegExp object for RegExp literals (fixes #287) (#291) (Reyad Attiyat)
* 525a544 Fix: Set node type to ExperimentalRestProperty (fixes #276) (#279) (Reyad Attiyat)
* eb32fed Fix: Convert type guards (fixes #282) (#283) (James Henry)
* b7220fd New: Create option to enable JSXText node type (fixes #266) (#272) (Reyad Attiyat)
* 6dd3696 Fix: Add exponentiation operators (fixes #280) (#281) (Lucas Azzola)
* 3491b4b Fix: Replace JSXMemberExpression with TSQualifiedName (fixes #257) (#258) (Lucas Azzola)
* b4eb0b5 Fix: Convert range and line number corretly in JSX literals (#277) (Reyad Attiyat)
* 3f9f41c Fix: wrap interface in ExportNamedDeclaration if necessary (fixes #269) (#270) (Danny Martini)

v3.0.0 - May 17, 2017

* 6b56bfe Fix: Use correct starting range and loc for JSXText tokens (fixes #227) (#271) (Reyad Attiyat)
* f5fcc87 Breaking: Allow comment scanner to rescan tokens (fixes #216) (#219) (Reyad Attiyat)
* f836bb9 Chore: Refactor the codebase (fixes #220) (#261) (James Henry)
* aade6bd Chore: Update README with list of known issues (#247) (Reyad Attiyat)
* c8e881a Breaking: Normalize type parameters (fixes #197) (#196) (Rasmus Eneman)
* d37bf04 Fix: Type parameter start location calculation (fixes #260) (#259) (Igor Oleinikov)
* 1a97650 Fix: Handle case where class has extends but no super class (fixes #249) (#254) (Reyad Attiyat)
* 00ad71d Fix: add `instanceof` to ast-converter (fixes #252) (#251) (Danny Arnold)
* 2989f8b Upgrade: Update semver package (#246) (Simen Bekkhus)
* b1efe69 Breaking: Change how interface node gets converted (fixes #201) (#241) (Reyad Attiyat)
* e311620 Fix: Set await property on async iterators (for await) (fixes #236) (#239) (Reyad Attiyat)
* a294afa Fix: Set async on async FunctionExpressions (fixes #244) (#245) (Lucas Azzola)
* 7c00f16 Chore: Add tests for object spread and async generator (refs #236) (#237) (Reyad Attiyat)
* 7b69bc9 Fix: Label abstract class properties (fixes #234) (#238) (Reyad Attiyat)
* a330ec6 New: Add support for default type parameters (fixes #235) (#240) (Reyad Attiyat)
* e1ef800 Fix: Support superTypeParameters (fixes #242) (#243) (Lucas Azzola)
* 65c2e0a Breaking: Support TypeScript 2.3 (fixes #232) (#233) (Lucas Azzola)
* 15f1173 Fix: Use TSAbsractMethodDefinition for abstract constructor (fixes #228) (#229) (Lucas Azzola)
* 8fb71d2 Breaking: Add .body to TSModuleBlock nodes (fixes #217) (#218) (Philipp A)
* 471f403 Chore: Remove before_script from .travis.yml (fixes #231) (#230) (James Henry)
* 9397c5c Chore: Cleanup Makefile (#221) (Reyad Attiyat)
* dd57f81 Update: Open TS peerDependency, warn non-supported version (fixes #167) (#193) (James Henry)
* a37d5ed Fix: Wrap any parameter with modifiers, not just in constructors (#214) (Rasmus Eneman)

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

