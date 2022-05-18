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

export function checkAccessibility() {
  // Wait for any pending paints and ticks to clear
  cy.wait(500);

  cy.checkA11y(undefined, undefined, terminalLog);
}
