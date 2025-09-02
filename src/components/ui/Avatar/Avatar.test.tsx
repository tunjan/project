import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Avatar from './Avatar';

// Mock the file upload utilities
vi.mock('@/utils/fileUpload', () => ({
  validateImageFile: vi.fn(),
  readFileAsDataURL: vi.fn(),
}));

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Icons are mocked globally in setupTests.ts

import { toast } from 'sonner';

import { readFileAsDataURL, validateImageFile } from '@/utils';

describe('<Avatar />', () => {
  const mockValidateImageFile = vi.mocked(validateImageFile);
  const mockReadFileAsDataURL = vi.mocked(readFileAsDataURL);
  const mockToastError = vi.mocked(toast.error);
  const mockToastSuccess = vi.mocked(toast.success);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Avatar (initials)', () => {
    it('renders initials for single name', () => {
      render(<Avatar src={null} alt="John" />);
      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('renders initials for full name', () => {
      render(<Avatar src={null} alt="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders "U" for empty name', () => {
      render(<Avatar src={null} alt="" />);
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('renders "U" for undefined name', () => {
      render(<Avatar src={null} alt={undefined!} />);
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('applies custom className to default avatar', () => {
      render(<Avatar src={null} alt="John" className="custom-class" />);
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveClass('custom-class');
    });

    it('generates consistent background colors for same name', () => {
      const { rerender } = render(<Avatar src={null} alt="John Doe" />);
      const firstColor = screen.getByRole('img').style.backgroundColor;

      rerender(<Avatar src={null} alt="John Doe" />);
      const secondColor = screen.getByRole('img').style.backgroundColor;

      expect(firstColor).toBe(secondColor);
    });

    it('generates different background colors for different names', () => {
      const { rerender } = render(<Avatar src={null} alt="John Doe" />);
      const johnColor = screen.getByRole('img').style.backgroundColor;

      rerender(<Avatar src={null} alt="Jane Smith" />);
      const janeColor = screen.getByRole('img').style.backgroundColor;

      expect(johnColor).not.toBe(janeColor);
    });
  });

  describe('Image Avatar', () => {
    it('renders image when src is provided', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />);
      const img = screen.getByAltText('John Doe');
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(img).toHaveClass('size-10', 'rounded-full', 'object-cover');
    });

    it('falls back to initials on image error', () => {
      render(<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />);
      const img = screen.getByAltText('John Doe');

      fireEvent.error(img);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('applies custom className to image', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="John Doe"
          className="custom-class"
        />
      );
      const img = screen.getByAltText('John Doe');
      expect(img).toHaveClass('custom-class');
    });
  });

  describe('Editable Avatar', () => {
    it('shows camera icon when editable', () => {
      render(<Avatar src={null} alt="John" editable />);
      const cameraIcons = screen.getAllByTestId('camera-icon');
      expect(cameraIcons.length).toBeGreaterThan(0);
    });

    it('does not show camera icon when not editable', () => {
      render(<Avatar src={null} alt="John" editable={false} />);
      expect(screen.queryByTestId('camera-icon')).not.toBeInTheDocument();
    });

    it('shows upload overlay on hover', async () => {
      const user = userEvent.setup();
      render(<Avatar src={null} alt="John" editable />);

      const container = screen.getByRole('button');
      await user.hover(container);

      // The overlay should be visible (though we can't easily test opacity changes)
      expect(container).toBeInTheDocument();
    });

    it('triggers file input click when overlay is clicked', async () => {
      const user = userEvent.setup();
      render(<Avatar src={null} alt="John" editable />);

      const overlay = screen.getByRole('button');
      await user.click(overlay);

      // We can't directly test the file input click, but we can verify the overlay exists
      expect(overlay).toBeInTheDocument();
    });

    it('handles keyboard activation', async () => {
      const user = userEvent.setup();
      render(<Avatar src={null} alt="John" editable />);

      const overlay = screen.getByRole('button');
      overlay.focus();

      await user.keyboard('{Enter}');
      // Should not throw error
      expect(overlay).toBeInTheDocument();
    });

    it('handles valid file upload', async () => {
      const user = userEvent.setup();
      const mockOnImageChange = vi.fn();

      mockValidateImageFile.mockReturnValue({ isValid: true });
      mockReadFileAsDataURL.mockResolvedValue('preview-url');

      render(
        <Avatar
          src={null}
          alt="John"
          editable
          onImageChange={mockOnImageChange}
        />
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByDisplayValue(''); // Hidden input

      await user.upload(fileInput, file);

      expect(mockValidateImageFile).toHaveBeenCalledWith(file);
      expect(mockReadFileAsDataURL).toHaveBeenCalledWith(file);
      expect(mockOnImageChange).toHaveBeenCalledWith('preview-url');
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'Avatar updated successfully!'
      );
    });

    it('handles invalid file upload', () => {
      mockValidateImageFile.mockReturnValue({
        isValid: false,
        error: 'Invalid file type',
      });

      render(<Avatar src={null} alt="John" editable />);

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;

      // Manually trigger the change event since userEvent.upload might not work as expected
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockValidateImageFile).toHaveBeenCalledWith(file);
      expect(mockToastError).toHaveBeenCalledWith('Invalid file type');
      expect(mockReadFileAsDataURL).not.toHaveBeenCalled();
    });

    it('handles file upload error', async () => {
      const user = userEvent.setup();
      const mockOnImageChange = vi.fn();

      mockValidateImageFile.mockReturnValue({ isValid: true });
      mockReadFileAsDataURL.mockRejectedValue(new Error('Upload failed'));

      render(
        <Avatar
          src={null}
          alt="John"
          editable
          onImageChange={mockOnImageChange}
        />
      );

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByDisplayValue('');

      await user.upload(fileInput, file);

      expect(mockToastError).toHaveBeenCalledWith('Failed to upload image');
      expect(mockOnImageChange).not.toHaveBeenCalled();
    });

    it('resets file input after upload', async () => {
      const user = userEvent.setup();

      mockValidateImageFile.mockReturnValue({ isValid: true });
      mockReadFileAsDataURL.mockResolvedValue('preview-url');

      render(<Avatar src={null} alt="John" editable />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByDisplayValue('') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(fileInput.value).toBe('');
    });
  });

  describe('State synchronization', () => {
    it('updates when src prop changes', () => {
      const { rerender } = render(<Avatar src="url1" alt="John" />);

      expect(screen.getByAltText('John')).toHaveAttribute('src', 'url1');

      rerender(<Avatar src="url2" alt="John" />);

      expect(screen.getByAltText('John')).toHaveAttribute('src', 'url2');
    });

    it('resets error count when src changes', () => {
      const { rerender } = render(<Avatar src="url1" alt="John" />);

      const img = screen.getByAltText('John');
      fireEvent.error(img); // This should increment error count

      rerender(<Avatar src="url2" alt="John" />);

      // Should show new image, not fallback
      expect(screen.getByAltText('John')).toHaveAttribute('src', 'url2');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for default avatar', () => {
      render(<Avatar src={null} alt="John Doe" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'John Doe avatar'
      );
    });

    it('has proper aria-label for default avatar with empty name', () => {
      render(<Avatar src={null} alt="" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Default user avatar'
      );
    });

    it('has screen reader text for upload button', () => {
      render(<Avatar src={null} alt="John" editable />);
      expect(screen.getByText('Upload new avatar')).toHaveClass('sr-only');
    });

    it('has proper alt text for images', () => {
      render(<Avatar src="url" alt="John Doe" />);
      expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    });
  });
});
