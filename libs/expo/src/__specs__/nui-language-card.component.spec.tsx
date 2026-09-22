import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NUILanguageCard } from '../nui-language-card.component';

describe('NUILanguageCard', () => {
  const props = {
    flag: 1,
    title: 'Kiswahili',
    subtitle: 'Karibu',
    onPress: () => undefined,
  };

  it('renders the title and subtitle', () => {
    render(<NUILanguageCard {...props} />);
    expect(screen.getByText('Kiswahili')).toBeTruthy();
    expect(screen.getByText('Karibu')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<NUILanguageCard {...props} onPress={onPress} />);
    fireEvent.press(screen.getByText('Kiswahili'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // Selection was conveyed by colour alone; screen readers got nothing.
  it('exposes selection to assistive tech', () => {
    render(<NUILanguageCard {...props} selected />);
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(
      true
    );
  });

  it('is not selected by default', () => {
    render(<NUILanguageCard {...props} />);
    expect(screen.getByRole('radio').props.accessibilityState.selected).toBe(
      false
    );
  });

  // The tick is a visual cue only — it is deliberately hidden from the
  // accessibility tree because accessibilityState already conveys selection,
  // so these queries have to opt into hidden elements.
  it('shows a checkmark only when selected', () => {
    const opts = { includeHiddenElements: true };
    const { rerender } = render(<NUILanguageCard {...props} />);
    expect(screen.queryByTestId('icon-checkmark-circle', opts)).toBeNull();
    rerender(<NUILanguageCard {...props} selected />);
    expect(screen.getByTestId('icon-checkmark-circle', opts)).toBeTruthy();
  });
});
