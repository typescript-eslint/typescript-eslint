# Contributing

Thank you for your interest in contributing to TypeScript ESLint! 💜

> Make sure you read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

## Raising Issues

So you've got a bug report, documentation request, or feature suggestion?
Great!

Do:

- Make sure you're using the [latest version of our packages](https://github.com/typescript-eslint/typescript-eslint/releases)
- Search [all opened and closed issues](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+) to make sure your issue wouldn't be a duplicate
- Fill out the [appropriate issue template](https://github.com/typescript-eslint/typescript-eslint/issues/new/choose) completely

### Questions and Support Requests

We do not have the bandwidth to handle questions or support requests in the issue tracker.
You can instead:

- Ask a question on [StackOverflow](https://stackoverflow.com/questions/tagged/typescript-eslint 'StackOverflow questions tagged with typescript-eslint') using the `typescript-eslint` tag
- Publicly tweet [@tseslint on Twitter](https://twitter.com/tseslint)

> Note that requests to add documentation _are_ allowed, even encouraged! 📝

## Commenting

Please do comment on any open issue if you have more information that would be useful.

Don't:

- Leave useless comments such as _"+1"_ or _"when's this getting fixed?"_ that only act as spam
  - If you have nothing to add but enthusiasm and joy, add a reaction such as 👍
- Bring up unrelated topics in existing issues: instead, file a new issue
- Comment on closed PRs: instead, file a new issue
- Comment on commits directly, as those comments are not searchable

## Pull Requests

> See [DEVELOPMENT.md](./DEVELOPMENT.md) for details on how to get started developing locally.

Do:

- Only send pull requests that resolve [open issues marked as `accepting prs`](https://github.com/typescript-eslint/typescript-eslint/issues?q=is%3Aissue+is%3Aopen+label%3A%22accepting+prs%22)
  - One exception: extremely minor documentation typos
- Fill out the pull request template in full
- Validate your changes per [Development > Validating Changes](./DEVELOPMENT.md#validating-changes) before un-[drafting your PR](https://github.blog/2019-02-14-introducing-draft-pull-requests)

Don't:

- Force push after opening a PR
  - Reasoning: GitHub is not able to track changes across force pushes, which makes it take longer for us to perform incremental reviews

### Raising a PR

Once your changes are ready, you can raise a PR! 🙌
The title of your PR should match the following format:

```text
<type>(<package>): <short description>
```

You can find more samples of good past PR titles in [recent commits to `main`](https://github.com/typescript-eslint/typescript-eslint/commits/main).

```text
fix(scope-manager): correct handling for class static blocks
```

```text
docs: Fix links to getting started in README.md
```

Within the body of your PR, make sure you reference the issue that you have worked on, as well as pointing out anything of note you wish us to look at during our review.

> We do not care about the number, or style of commits in your history, because we squash merge every PR into `main`.
> Feel free to commit in whatever style you feel comfortable with.

#### type

Must be one of the following:

- `docs` - if you only change documentation, and not shipped code
- `feat` - for any new functionality additions
- `fix` - for any bug fixes that don't add new functionality
- `test` - if you only change tests, and not shipped code
- `chore` - anything el se

#### package

The name of the package you have made changes within, (e.g. `eslint-plugin`, `parser`, `typescript-estree`).
If you make significant changes across multiple packages, you can omit this (e.g.
`feat: foo bar`).

#### short description

A succinct title for the PR.

### Addressing Feedback and Beyond

With your PR raised and the CI passing, your PR will [wait in the queue to be reviewed](https://github.com/typescript-eslint/typescript-eslint/pulls?q=is%3Apr+is%3Aopen+sort%3Acreated-asc+-label%3A%22breaking+change%22+-label%3A%22awaiting+response%22+-label%3A%221+approval%22+-label%3A%22DO+NOT+MERGE%22+status%3Asuccess).
We generally review PRs oldest to newest, unless we consider a newer PR higher priority (e.g. if it's a bug fix).

Once we have reviewed your PR, we will provide any feedback that needs addressing.
If you feel a requested change is wrong, don't be afraid to discuss with us in the comments.
Once the feedback is addressed, and the PR is reviewed, we'll ensure the branch is up to date with `main`, and merge it for you.
