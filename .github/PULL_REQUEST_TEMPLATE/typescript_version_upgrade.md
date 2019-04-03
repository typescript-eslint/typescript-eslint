---
name: 'TypeScript Version Upgrade'
about: Used when upgrading the supported version of TypeScript
title: ''
labels: ''
assignees: ''
---

**Please complete the following:**

TypeScript version added by this PR: `{{ INSERT_TYPESCRIPT_VERSION }}`

- [ ] I have updated the devDependency range in the root package.json
- [ ] I have updated the range value in `packages/typescript-estree/src/parser.ts`
- [ ] I have run the existing tests to make sure they still pass, or made any required updates
- [ ] I have added new tests for the features introduced in this newer version of TypeScript
- New feature tests added:
  - ...
