import React from 'react';

// --- InputField ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string; // Add error prop
}

export const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, ...props }, ref) => (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-bold text-neutral-700"
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        {...props}
        className={`block w-full border bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${
          error ? 'border-primary' : 'border-neutral-300'
        } ${className}`}
        aria-invalid={!!error}
      />
      {error && (
        <p className="mt-1 text-xs font-semibold text-primary">{error}</p>
      )}
    </div>
  )
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
>(({ label, id, className, error, ...props }, ref) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-neutral-700"
    >
      {label}
    </label>
    <textarea
      id={id}
      ref={ref}
      {...props}
      className={`block w-full border bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${
        error ? 'border-primary' : 'border-neutral-300'
      } ${className}`}
      aria-invalid={!!error}
    />
    {error && (
      <p className="mt-1 text-xs font-semibold text-primary">{error}</p>
    )}
  </div>
));
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
>(({ label, id, className, children, error, ...props }, ref) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-neutral-700"
    >
      {label}
    </label>
    <select
      id={id}
      ref={ref}
      {...props}
      className={`block w-full border bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-neutral-200 sm:text-sm ${
        error ? 'border-primary' : 'border-neutral-300'
      } ${className}`}
      aria-invalid={!!error}
    >
      {children}
    </select>
    {error && (
      <p className="mt-1 text-xs font-semibold text-primary">{error}</p>
    )}
  </div>
));
SelectField.displayName = 'SelectField';
