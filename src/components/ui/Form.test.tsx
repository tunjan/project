import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InputField, SelectField, TextAreaField } from './Form';

describe('Form Components', () => {
  describe('<InputField />', () => {
    const defaultProps = {
      label: 'Test Input',
      id: 'test-input',
    };

    it('renders label and input correctly', () => {
      render(<InputField {...defaultProps} />);

      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test-input');
    });

    it('forwards input props correctly', () => {
      render(
        <InputField
          {...defaultProps}
          type="email"
          placeholder="Enter email"
          required
          disabled
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).toBeRequired();
      expect(input).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<InputField {...defaultProps} className="custom-class" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<InputField {...defaultProps} ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });

    it('shows error message when error prop is provided', () => {
      render(<InputField {...defaultProps} error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('has correct aria-describedby when error is present', () => {
      render(<InputField {...defaultProps} error="Error message" />);

      const input = screen.getByRole('textbox');
      const errorElement = screen.getByText('Error message');

      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
      expect(errorElement).toHaveAttribute('id', 'test-input-error');
    });

    it('has correct aria-describedby when no error', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-success');
    });

    it('applies error styling when error is present', () => {
      render(<InputField {...defaultProps} error="Error" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-danger');
    });

    it('applies default styling when no error', () => {
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-black');
    });

    it('handles user input correctly', async () => {
      const user = userEvent.setup();
      render(<InputField {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');

      expect(input).toHaveValue('test value');
    });

    it('has correct display name', () => {
      expect(InputField.displayName).toBe('InputField');
    });
  });

  describe('<TextAreaField />', () => {
    const defaultProps = {
      label: 'Test TextArea',
      id: 'test-textarea',
    };

    it('renders label and textarea correctly', () => {
      render(<TextAreaField {...defaultProps} />);

      expect(screen.getByLabelText('Test TextArea')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'id',
        'test-textarea'
      );
    });

    it('forwards textarea props correctly', () => {
      render(
        <TextAreaField
          {...defaultProps}
          placeholder="Enter text"
          rows={5}
          required
          disabled
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Enter text');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toBeRequired();
      expect(textarea).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<TextAreaField {...defaultProps} className="custom-class" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<TextAreaField {...defaultProps} ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
    });

    it('shows error message when error prop is provided', () => {
      render(
        <TextAreaField {...defaultProps} error="This field is required" />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('has correct aria-describedby when error is present', () => {
      render(<TextAreaField {...defaultProps} error="Error message" />);

      const textarea = screen.getByRole('textbox');
      const errorElement = screen.getByText('Error message');

      expect(textarea).toHaveAttribute(
        'aria-describedby',
        'test-textarea-error'
      );
      expect(errorElement).toHaveAttribute('id', 'test-textarea-error');
    });

    it('applies error styling when error is present', () => {
      render(<TextAreaField {...defaultProps} error="Error" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-danger');
    });

    it('handles user input correctly', async () => {
      const user = userEvent.setup();
      render(<TextAreaField {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test value');

      expect(textarea).toHaveValue('test value');
    });

    it('has correct display name', () => {
      expect(TextAreaField.displayName).toBe('TextAreaField');
    });
  });

  describe('<SelectField />', () => {
    const defaultProps = {
      label: 'Test Select',
      id: 'test-select',
      children: (
        <>
          <option value="">Select an option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </>
      ),
    };

    it('renders label and select correctly', () => {
      render(<SelectField {...defaultProps} />);

      expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('id', 'test-select');
    });

    it('renders children options correctly', () => {
      render(<SelectField {...defaultProps} />);

      expect(
        screen.getByRole('option', { name: 'Select an option' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Option 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Option 2' })
      ).toBeInTheDocument();
    });

    it('forwards select props correctly', () => {
      render(
        <SelectField {...defaultProps} value="option1" required disabled />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('option1');
      expect(select).toBeRequired();
      expect(select).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<SelectField {...defaultProps} className="custom-class" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<SelectField {...defaultProps} ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement));
    });

    it('shows error message when error prop is provided', () => {
      render(<SelectField {...defaultProps} error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('has correct aria-describedby when error is present', () => {
      render(<SelectField {...defaultProps} error="Error message" />);

      const select = screen.getByRole('combobox');
      const errorElement = screen.getByText('Error message');

      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
      expect(errorElement).toHaveAttribute('id', 'test-select-error');
    });

    it('applies error styling when error is present', () => {
      render(<SelectField {...defaultProps} error="Error" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-danger');
    });

    it('handles user selection correctly', async () => {
      const user = userEvent.setup();
      render(<SelectField {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option1');

      expect(select).toHaveValue('option1');
    });

    it('has correct display name', () => {
      expect(SelectField.displayName).toBe('SelectField');
    });
  });

  describe('Common styling', () => {
    it('applies consistent base styling across all form components', () => {
      render(
        <>
          <InputField label="Input" id="input" />
          <TextAreaField label="Textarea" id="textarea" />
          <SelectField label="Select" id="select">
            <option value="">Select</option>
          </SelectField>
        </>
      );

      const input = screen.getByLabelText('Input');
      const textarea = screen.getByLabelText('Textarea');
      const select = screen.getByLabelText('Select');

      // Input and textarea should have placeholder class
      expect(input).toHaveClass('placeholder:text-neutral-500');
      expect(textarea).toHaveClass('placeholder:text-neutral-500');

      // All should have consistent base classes (except placeholder for select)
      [input, textarea, select].forEach((element) => {
        expect(element).toHaveClass(
          'block',
          'w-full',
          'border-2',
          'bg-white',
          'p-2',
          'pr-10',
          'text-black',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary',
          'focus:ring-offset-2',
          'sm:text-sm'
        );
      });
    });

    it('applies consistent label styling', () => {
      render(
        <>
          <InputField label="Input Label" id="input" />
          <TextAreaField label="Textarea Label" id="textarea" />
          <SelectField label="Select Label" id="select">
            <option value="">Select</option>
          </SelectField>
        </>
      );

      const inputLabel = screen.getByText('Input Label');
      const textareaLabel = screen.getByText('Textarea Label');
      const selectLabel = screen.getByText('Select Label');

      [inputLabel, textareaLabel, selectLabel].forEach((label) => {
        expect(label).toHaveClass(
          'mb-1',
          'block',
          'text-sm',
          'font-bold',
          'text-black'
        );
      });
    });

    it('applies consistent error styling', () => {
      render(
        <>
          <InputField label="Input" id="input" error="Error" />
          <TextAreaField label="Textarea" id="textarea" error="Error" />
          <SelectField label="Select" id="select" error="Error">
            <option value="">Select</option>
          </SelectField>
        </>
      );

      const errors = screen.getAllByText('Error');

      errors.forEach((error) => {
        expect(error).toHaveClass(
          'mt-1',
          'text-xs',
          'font-semibold',
          'text-danger'
        );
      });
    });
  });
});
