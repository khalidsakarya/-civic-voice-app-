import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test: the whole application mounts without throwing and shows the Civic Voice home screen with the
// country picker. (This replaces the Create React App boilerplate test that looked for "learn react", text this
// application has never contained; the old test failed on every run without indicating any regression.)
test('renders the Civic Voice home screen with the Canada country card', () => {
  render(<App />);
  expect(screen.getAllByRole('heading', { name: /civic voice/i }).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/government transparency platform/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Canada').length).toBeGreaterThan(0);
});
