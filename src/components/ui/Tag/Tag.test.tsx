import { render, screen } from '@testing-library/react';

import { Tag } from './Tag';

describe('<Tag />', () => {
  it('renders children correctly', () => {
    render(<Tag>Test Tag</Tag>);
    expect(screen.getByText('Test Tag')).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(<Tag>Default Tag</Tag>);
    const tag = screen.getByText('Default Tag');
    expect(tag).toHaveClass(
      'bg-white',
      'text-black',
      'border-black',
      'px-2',
      'py-1',
      'text-xs'
    );
  });

  it('applies different variants correctly', () => {
    const { rerender } = render(<Tag variant="primary">Primary</Tag>);
    expect(screen.getByText('Primary')).toHaveClass(
      'bg-primary',
      'text-white',
      'border-primary'
    );

    rerender(<Tag variant="secondary">Secondary</Tag>);
    expect(screen.getByText('Secondary')).toHaveClass(
      'bg-black',
      'text-white',
      'border-black'
    );

    rerender(<Tag variant="success">Success</Tag>);
    expect(screen.getByText('Success')).toHaveClass(
      'bg-success',
      'text-white',
      'border-success'
    );

    rerender(<Tag variant="warning">Warning</Tag>);
    expect(screen.getByText('Warning')).toHaveClass(
      'bg-warning',
      'text-black',
      'border-warning'
    );

    rerender(<Tag variant="danger">Danger</Tag>);
    expect(screen.getByText('Danger')).toHaveClass(
      'bg-danger',
      'text-white',
      'border-danger'
    );

    rerender(<Tag variant="info">Info</Tag>);
    expect(screen.getByText('Info')).toHaveClass(
      'bg-info',
      'text-white',
      'border-info'
    );

    rerender(<Tag variant="neutral">Neutral</Tag>);
    expect(screen.getByText('Neutral')).toHaveClass(
      'bg-white',
      'text-black',
      'border-black'
    );
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Tag size="sm">Small</Tag>);
    expect(screen.getByText('Small')).toHaveClass('px-2', 'py-1', 'text-xs');

    rerender(<Tag size="md">Medium</Tag>);
    expect(screen.getByText('Medium')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Tag size="lg">Large</Tag>);
    expect(screen.getByText('Large')).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('applies custom className', () => {
    render(<Tag className="custom-class">Custom</Tag>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  it('applies consistent base styling', () => {
    render(<Tag>Test</Tag>);
    const tag = screen.getByText('Test');
    expect(tag).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'md:border-2',
      'font-bold',
      'uppercase',
      'tracking-wider'
    );
  });

  it('renders complex children', () => {
    render(
      <Tag>
        <span>Complex</span> <strong>Content</strong>
      </Tag>
    );
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('combines variant, size, and custom classes correctly', () => {
    render(
      <Tag variant="danger" size="lg" className="extra-class">
        Combined
      </Tag>
    );
    const tag = screen.getByText('Combined');
    expect(tag).toHaveClass(
      'bg-danger',
      'text-white',
      'border-danger',
      'px-4',
      'py-2',
      'text-base',
      'extra-class'
    );
  });

  it('maintains text transformation for different content types', () => {
    render(<Tag>lowercase text</Tag>);
    const tag = screen.getByText('lowercase text');
    expect(tag).toHaveClass('uppercase');
  });

  it('handles number children', () => {
    render(<Tag>{42}</Tag>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('is accessible as a generic span element', () => {
    render(<Tag>Accessible Tag</Tag>);
    const tag = screen.getByText('Accessible Tag');
    expect(tag.tagName).toBe('SPAN');
  });
});
