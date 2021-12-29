function terminalLog(violations) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${
      violations.length === 1 ? '' : 's'
    } detected`,
  );

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
    cy.checkA11y(null, null, terminalLog);
  });
}
