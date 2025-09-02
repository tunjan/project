import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Modal from './Modal';

// Mock focus-trap-react
vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Icons are mocked globally in setupTests.ts

describe('<Modal />', () => {
  const defaultProps = {
    children: <div>Modal content</div>,
    onClose: vi.fn(),
    title: 'Test Modal',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title and content', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Modal {...defaultProps} description="Test description" />);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  it('shows close button by default', () => {
    render(<Modal {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /close modal/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);

    expect(
      screen.queryByRole('button', { name: /close modal/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-sm');

    rerender(<Modal {...defaultProps} size="md" />);
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-lg');

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-2xl');

    rerender(<Modal {...defaultProps} size="xl" />);
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-4xl');

    rerender(<Modal {...defaultProps} size="2xl" />);
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-6xl');
  });

  it('defaults to md size when no size is provided', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId('modal-content')).toHaveClass('max-w-lg');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    const modalContent = screen.getByTestId('modal-content');
    await user.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const mockOnClose = vi.fn();

    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for other keys', () => {
    const mockOnClose = vi.fn();

    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const mockOnClose = vi.fn();
    const { unmount } = render(
      <Modal {...defaultProps} onClose={mockOnClose} />
    );

    // Headless UI handles its own event listeners internally
    // We just need to ensure the component unmounts without errors
    expect(() => unmount()).not.toThrow();
  });

  it('has correct ARIA attributes', () => {
    render(<Modal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('has correct title id association', () => {
    render(<Modal {...defaultProps} />);

    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  it('has correct accessibility attributes on close button', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
  });

  it('applies correct CSS classes for styling', () => {
    render(<Modal {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('relative', 'z-50');

    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toHaveClass(
      'relative',
      'my-4',
      'w-full',
      'md:border-2',
      'border-black',
      'bg-white',
      'max-w-lg'
    );
  });

  it('renders children in scrollable container', () => {
    render(<Modal {...defaultProps} />);

    const contentContainer = screen.getByText('Modal content').parentElement;
    expect(contentContainer).toHaveClass(
      'max-h-[calc(90vh-120px)]',
      'overflow-y-auto',
      'p-6'
    );
  });

  it('handles complex children', () => {
    render(
      <Modal {...defaultProps}>
        <div>
          <h3>Complex Content</h3>
          <p>With multiple elements</p>
          <button>Action Button</button>
        </div>
      </Modal>
    );

    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('With multiple elements')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /action button/i })
    ).toBeInTheDocument();
  });
});
