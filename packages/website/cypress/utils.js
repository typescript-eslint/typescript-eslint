function terminalLog(violations) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${
      violations.length === 1 ? '' : 's'
    } detected`,
  );
  for (const violation of violations) {
    cy.task('log', JSON.stringify(violation, null, 4));
  }

  cy.task(
    'table',
    violations.map(({ description, id, impact, nodes }) => ({
      description,
      id,
      impact,
      nodes: nodes.length,
    })),
  );
}

export function itIsAccessible(route) {
  it('is accessible', () => {
    cy.visit(route);
    cy.injectAxe();
    cy.checkA11y(
      {
        // https://github.com/facebook/docusaurus/issues/6252
        exclude: '[class*="skipToContent"]',
      },
      null,
      terminalLog,
    );
  });
}
