import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the HealthAI brand name', () => {
  render(<App />);
  const heading = screen.getByText(/HealthAI/i);
  expect(heading).toBeInTheDocument();
});
