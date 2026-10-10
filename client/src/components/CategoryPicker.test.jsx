import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryPicker, MotivePicker } from './CategoryPicker.jsx';

describe('CategoryPicker', () => {
  it('lists the spending categories and reports the choice', () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="" onChange={onChange} />);
    fireEvent.click(screen.getByText(/Snacks & fast food/));
    expect(onChange).toHaveBeenCalledWith('snacks');
    expect(screen.getAllByRole('radio')).toHaveLength(10);
  });
});

describe('MotivePicker', () => {
  it('lets the user clear their reason by tapping it again', () => {
    const onChange = vi.fn();
    render(<MotivePicker value="impulse" onChange={onChange} />);
    fireEvent.click(screen.getByText('Impulse'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
