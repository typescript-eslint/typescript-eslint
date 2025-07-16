import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';

import { ExplainerSpotlight } from '../ExplainerSpotlight';
import styles from './styles.module.css';

const explanations = [
  {
    children:
      'The parser and services for linting TypeScript code with ESLint, as well as how tools such as Prettier read TypeScript code.',
    emoji: '⚙️',
    header: 'Language Support',
    href: '/getting-started',
  },
  {
    children:
      'Over 100 rules that check for best practices, likely bugs, and stylistic consistency in modern JavaScript and TypeScript codebases.',
    emoji: '🧠',
    header: 'Standard Rules',
    href: '/rules',
  },
  {
    children:
      "Industry-leading services that use TypeScript's type APIs to make a more powerful breed of lint rules for deeper insights into code.",
    emoji: '⚡️',
    header: 'Typed Linting',
    href: '/getting-started/typed-linting',
  },
];

export function Explainers(): React.JSX.Element {
  return (
    <section className={clsx('padding-vert--lg', styles.explainers)}>
      <Heading as="h2" className="col col--12 text--center">
        <strong>typescript-eslint</strong> enables ESLint, Prettier, and more to
        support TypeScript code.
      </Heading>
      <ul className={clsx('col col--10', styles.explainerSpotlights)}>
        {explanations.map(({ header, ...rest }) => (
          <ExplainerSpotlight header={header} key={header} {...rest} />
        ))}
      </ul>
      <div className={styles.explainerTexts}>
        <p>
          <strong>ESLint</strong> is a linter. It runs a set of rules to find
          likely problems and suggested fixes to improve your code.
        </p>
        <p>
          <strong>TypeScript</strong> is a language and a type checker. The
          language adds syntax for types to JavaScript.
          <br />
          The type checker analyzes code to find mismatches between uses of
          values and types.
        </p>
        <p>
          <strong>typescript-eslint</strong> is necessary for JavaScript tools
          such as ESLint to work with TypeScript's new syntax.
          <br />
          It also adds lint rules for TypeScript, including many that use the
          power of types to better analyze code.
        </p>
      </div>

      <div className={styles.buttons}>
        <Link
          className="button button--primary"
          to={useBaseUrl('getting-started')}
        >
          Learn More
        </Link>
        <Link
          className="button button--primary button--outline"
          to={useBaseUrl('rules')}
        >
          See the Rules
        </Link>
      </div>
    </section>
  );
}
