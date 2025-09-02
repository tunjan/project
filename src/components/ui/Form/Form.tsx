import React from 'react';

import { cn } from '@/utils';

// Shared base styles for form inputs
const baseInputStyles =
  'block w-full bg-white p-2 pr-10 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm md:border-2 dark:bg-black dark:text-white dark:placeholder:text-neutral-400';

// --- FormFieldWrapper ---
interface FormFieldWrapperProps {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  id,
  error,
  children,
}) => {
  const errorId = `${id}-error`;

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-black">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

// --- InputField ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string; // Add error prop
}

export const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, ...props }, ref) => {
    const errorId = `${id}-error`;
    const successId = `${id}-success`;

    return (
      <FormFieldWrapper label={label} id={id} error={error}>
        <input
          id={id}
          ref={ref}
          {...props}
          className={cn(
            baseInputStyles,
            error ? 'border-danger' : 'border-black dark:border-white',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : successId}
        />
      </FormFieldWrapper>
    );
  }
);
InputField.displayName = 'InputField';

// --- TextAreaField ---
interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string; // Add error prop
}

export const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>(({ label, id, className, error, ...props }, ref) => {
  const errorId = `${id}-error`;
  const successId = `${id}-success`;

  return (
    <FormFieldWrapper label={label} id={id} error={error}>
      <textarea
        id={id}
        ref={ref}
        {...props}
        className={cn(
          baseInputStyles,
          error ? 'border-danger' : 'border-black dark:border-white',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : successId}
      />
    </FormFieldWrapper>
  );
});
TextAreaField.displayName = 'TextAreaField';

// --- SelectField ---
interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string; // Add error prop
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, id, className, children, error, ...props }, ref) => {
  const errorId = `${id}-error`;
  const successId = `${id}-success`;

  return (
    <FormFieldWrapper label={label} id={id} error={error}>
      <select
        id={id}
        ref={ref}
        {...props}
        className={cn(
          baseInputStyles,
          'disabled:bg-white dark:disabled:bg-black',
          error ? 'border-danger' : 'border-black dark:border-white',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : successId}
      >
        {children}
      </select>
    </FormFieldWrapper>
  );
});
SelectField.displayName = 'SelectField';
