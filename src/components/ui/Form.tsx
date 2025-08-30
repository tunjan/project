import React from 'react';

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
      <div className="relative">
        <label htmlFor={id} className="mb-1 block text-sm font-bold text-black">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          {...props}
          className={`block w-full border-2 bg-white p-2 pr-10 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${
            error ? 'border-danger' : 'border-black'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : successId}
        />

        {error && (
          <p id={errorId} className="mt-1 text-xs font-semibold text-danger">
            {error}
          </p>
        )}
      </div>
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
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-black">
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        {...props}
        className={`block w-full border-2 bg-white p-2 pr-10 text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${
          error ? 'border-danger' : 'border-black'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : successId}
      />

      {error && (
        <p id={errorId} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
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
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-black">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        {...props}
        className={`block w-full border-2 bg-white p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm ${
          error ? 'border-danger' : 'border-black'
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : successId}
      >
        {children}
      </select>

      {error && (
        <p id={errorId} className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
SelectField.displayName = 'SelectField';
