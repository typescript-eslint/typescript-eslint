import { checkAccessibility } from '../utils';

describe('Index', () => {
  it('has no accessibility issues detected by aXe', () => {
    cy.visit('/', {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
    cy.injectAxe();

    // 1. Check accessibility in default, light mode
    checkAccessibility();

    // 2. Check accessibility in dark mode
    cy.get('[class*=toggleButton]').click();
    checkAccessibility();
  });
});
