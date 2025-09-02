import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders authentication form when not logged in', () => {
    render(<App />);
    expect(screen.getByText(/Join CodeBattle|Welcome Back/)).toBeInTheDocument();
  });
});