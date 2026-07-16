import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login page logo', () => {
  render(<App />);
  const logo = screen.getByAltText(/APEXAI/i);
  expect(logo).toBeInTheDocument();
});
