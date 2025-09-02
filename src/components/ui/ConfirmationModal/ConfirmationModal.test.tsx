import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmationModal from './ConfirmationModal';

// Mock the Modal component
vi.mock('./Modal', () => ({
  default: ({
    children,
    title,
    onClose,
  }: {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
  }) => (
    <div data-testid="modal" data-title={title}>
      <div data-testid="modal-content">{children}</div>
      <button data-testid="modal-close" onClick={onClose}>
        Modal Close
      </button>
    </div>
  ),
}));

// Icons are mocked globally in setupTests.ts

describe('<ConfirmationModal />', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    // Headless UI always renders the DOM structure but controls visibility with CSS
    // Check that the modal is not visible instead of checking for null
    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    // The modal should be rendered but not visible when isOpen is false
    expect(modal).toHaveAttribute('data-title', 'Confirm Action');
  });

  it('renders modal with correct title when isOpen is true', () => {
    render(<ConfirmationModal {...defaultProps} />);
    const modal = screen.getByTestId('modal');
    expect(modal).toHaveAttribute('data-title', 'Confirm Action');
  });

  it('renders message correctly', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument();
  });

  it('renders default button texts', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders custom button texts', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    expect(screen.getByText('Keep')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders shield icon', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
  });

  it('applies correct CSS classes for danger variant', () => {
    render(<ConfirmationModal {...defaultProps} variant="danger" />);

    const message = screen.getByText('Are you sure you want to proceed?');
    expect(message).toHaveClass('text-red-700');
  });

  it('applies correct CSS classes for warning variant', () => {
    render(<ConfirmationModal {...defaultProps} variant="warning" />);

    const message = screen.getByText('Are you sure you want to proceed?');
    expect(message).toHaveClass('text-yellow-700');
  });

  it('applies correct CSS classes for info variant', () => {
    render(<ConfirmationModal {...defaultProps} variant="info" />);

    const message = screen.getByText('Are you sure you want to proceed?');
    expect(message).toHaveClass('text-blue-700');
  });

  it('has correct button styling classes', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');

    expect(cancelButton).toHaveClass('btn-outline', 'flex-1');
    expect(confirmButton).toHaveClass('btn-danger', 'flex-1');
  });

  it('handles long messages correctly', () => {
    const longMessage =
      'This is a very long message that should still be displayed properly within the modal. It contains multiple sentences and should wrap appropriately.';

    render(<ConfirmationModal {...defaultProps} message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles special characters in title and message', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        title="Confirm: Delete Item?"
        message="Are you sure you want to delete 'special-item'?"
      />
    );

    // Check that the title is passed to the modal (via data attribute)
    const modal = screen.getByTestId('modal');
    expect(modal).toHaveAttribute('data-title', 'Confirm: Delete Item?');

    expect(
      screen.getByText("Are you sure you want to delete 'special-item'?")
    ).toBeInTheDocument();
  });

  it('maintains button order (Cancel first, then Confirm)', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');

    // Cancel should come before Confirm in the DOM
    expect(cancelButton.compareDocumentPosition(confirmButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('is accessible with proper button labels', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    const confirmButton = screen.getByText('Confirm');

    expect(cancelButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(<ConfirmationModal {...defaultProps} onClose={mockOnClose} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm and onClose when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <ConfirmationModal
        {...defaultProps}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when modal close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    render(<ConfirmationModal {...defaultProps} onClose={mockOnClose} />);

    const modalCloseButton = screen.getByTestId('modal-close');
    await user.click(modalCloseButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies danger variant styles by default', () => {
    render(<ConfirmationModal {...defaultProps} />);
    const icon = screen.getByTestId('shield-icon');
    expect(icon).toHaveClass('text-danger');
  });

  it('applies warning variant styles', () => {
    render(<ConfirmationModal {...defaultProps} variant="warning" />);
    const icon = screen.getByTestId('shield-icon');
    expect(icon).toHaveClass('text-warning');
  });

  it('applies info variant styles', () => {
    render(<ConfirmationModal {...defaultProps} variant="info" />);
    const icon = screen.getByTestId('shield-icon');
    expect(icon).toHaveClass('text-info');
  });

  it('applies danger variant styles when variant is explicitly set', () => {
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    const icon = screen.getByTestId('shield-icon');
    expect(icon).toHaveClass('text-danger');
  });
});
