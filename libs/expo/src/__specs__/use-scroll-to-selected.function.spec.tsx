import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useScrollToSelected } from '../use-scroll-to-selected.function';

const ROW = 40;
const VIEWPORT = 200;
const OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);

let scrollTo: jest.Mock;
let select: (value: number) => void;

function Picker({ initial, resetKey }: { initial: number; resetKey?: number }) {
  const [value, setValue] = useState(initial);
  select = setValue;
  const picker = useScrollToSelected(value, { resetKey });
  return (
    <ScrollView
      testID="list"
      ref={(node) => {
        picker.scrollRef.current = node;
        if (node) node.scrollTo = scrollTo;
      }}
      onLayout={picker.onScrollLayout}
    >
      {OPTIONS.map((option) => (
        <TouchableOpacity
          key={option}
          testID={`row-${option}`}
          onLayout={picker.onItemLayout(option)}
          onPress={() => {
            picker.markTapped(option);
            setValue(option);
          }}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const layOut = () => {
  fireEvent(screen.getByTestId('list'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 300, height: VIEWPORT } },
  });
  for (const option of OPTIONS) {
    fireEvent(screen.getByTestId(`row-${option}`), 'layout', {
      nativeEvent: { layout: { x: 0, y: (option - 1) * ROW, width: 300, height: ROW } },
    });
  }
};

// Row n starts at (n-1)·40; centred in a 200 viewport it scrolls to that − 80.
const centredOffset = (value: number) => (value - 1) * ROW - (VIEWPORT - ROW) / 2;

beforeEach(() => {
  scrollTo = jest.fn();
});

describe('useScrollToSelected', () => {
  it('opens centred on the default value', () => {
    render(<Picker initial={20} />);
    layOut();
    expect(scrollTo).toHaveBeenLastCalledWith({ y: centredOffset(20), animated: false });
  });

  it('never scrolls past the top for a value near the start', () => {
    render(<Picker initial={1} />);
    layOut();
    expect(scrollTo).toHaveBeenLastCalledWith({ y: 0, animated: false });
  });

  it('re-centres when the value changes from outside, e.g. loaded from the server', () => {
    render(<Picker initial={1} />);
    layOut();
    act(() => select(25));
    expect(scrollTo).toHaveBeenLastCalledWith({ y: centredOffset(25), animated: false });
  });

  it('leaves a tapped value where it is', () => {
    render(<Picker initial={20} />);
    layOut();
    scrollTo.mockClear();
    fireEvent.press(screen.getByTestId('row-22'));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('re-centres after a tap once the value changes from outside again', () => {
    render(<Picker initial={20} />);
    layOut();
    fireEvent.press(screen.getByTestId('row-22'));
    act(() => select(5));
    expect(scrollTo).toHaveBeenLastCalledWith({ y: centredOffset(5), animated: false });
  });

  it('re-tapping the selected value does not swallow the next re-centre', () => {
    render(<Picker initial={20} />);
    layOut();
    fireEvent.press(screen.getByTestId('row-20'));
    act(() => select(10));
    expect(scrollTo).toHaveBeenLastCalledWith({ y: centredOffset(10), animated: false });
  });

  it('re-centres on resetKey even if the value is unchanged', () => {
    const { rerender } = render(<Picker initial={20} resetKey={0} />);
    layOut();
    scrollTo.mockClear();
    rerender(<Picker initial={20} resetKey={1} />);
    expect(scrollTo).toHaveBeenCalledWith({ y: centredOffset(20), animated: false });
  });
});
