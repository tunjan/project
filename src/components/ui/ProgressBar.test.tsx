import { render, screen } from '@testing-library/react';

import ProgressBar from './ProgressBar';

describe('<ProgressBar />', () => {
  it('renders with correct progress percentage', () => {
    render(<ProgressBar value={25} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '25%' });
  });

  it('renders with 0% when value is 0', () => {
    render(<ProgressBar value={0} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('renders with 100% when value equals max', () => {
    render(<ProgressBar value={100} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('caps at 100% when value exceeds max', () => {
    render(<ProgressBar value={150} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('renders with 0% when max is 0', () => {
    render(<ProgressBar value={50} max={0} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('renders with 0% when max is negative', () => {
    render(<ProgressBar value={50} max={-10} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('has correct ARIA attributes', () => {
    render(<ProgressBar value={25} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuetext', '25 of 100');
  });

  it('applies custom className', () => {
    render(<ProgressBar value={50} max={100} className="custom-class" />);

    const container = screen.getByRole('progressbar').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has correct default styling', () => {
    render(<ProgressBar value={50} max={100} />);

    const container = screen.getByRole('progressbar').parentElement;
    const progressBar = screen.getByRole('progressbar');

    expect(container).toHaveClass(
      'h-2.5',
      'w-full',
      'border',
      'border-black',
      'bg-white'
    );

    expect(progressBar).toHaveClass('h-2', 'bg-primary');
  });

  it('handles decimal values correctly', () => {
    render(<ProgressBar value={33.33} max={100} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '33.33%' });
  });

  it('handles large numbers correctly', () => {
    render(<ProgressBar value={50000} max={100000} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('handles very small percentages correctly', () => {
    render(<ProgressBar value={1} max={1000} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '0.1%' });
  });

  it('maintains accessibility with different values', () => {
    const { rerender } = render(<ProgressBar value={25} max={100} />);

    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    expect(progressBar).toHaveAttribute('aria-valuetext', '25 of 100');

    rerender(<ProgressBar value={75} max={200} />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemax', '200');
    expect(progressBar).toHaveAttribute('aria-valuetext', '75 of 200');
  });

  it('rounds percentage correctly for edge cases', () => {
    // Test case where floating point arithmetic might cause issues
    render(<ProgressBar value={1} max={3} />);

    const progressBar = screen.getByRole('progressbar');
    // 1/3 ≈ 33.333..., should be approximately 33.33%
    const width = progressBar.style.width;
    expect(parseFloat(width)).toBeCloseTo(33.333, 2);
  });
});
