import React from 'react';
import { CheckIcon } from '@/icons';

// --- InputField ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string; // Add error prop
  isValid?: boolean; // Add isValid prop for success state
}

export const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, isValid, ...props }, ref) => (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-bold text-black"
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        {...props}
        className={`block w-full border-2 bg-white p-2 pr-10 text-black placeholder:text-red focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${
          error ? 'border-danger' : isValid ? 'border-success' : 'border-black'
        } ${className}`}
        aria-invalid={!!error}
      />
      {isValid && !error && (
        <div className="absolute right-2 top-8 text-success">
          <CheckIcon className="h-5 w-5" />
        </div>
      )}
      {error && (
        <p className="text-danger mt-1 text-xs font-semibold">{error}</p>
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
  isValid?: boolean; // Add isValid prop for success state
}

export const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>(({ label, id, className, error, isValid, ...props }, ref) => (
  <div className="relative">
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-black"
    >
      {label}
    </label>
    <textarea
      id={id}
      ref={ref}
      {...props}
      className={`block w-full border-2 bg-white p-2 pr-10 text-black placeholder:text-red focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${
        error ? 'border-danger' : isValid ? 'border-success' : 'border-black'
      } ${className}`}
      aria-invalid={!!error}
    />
    {isValid && !error && (
      <div className="absolute right-2 top-8 text-success">
        <CheckIcon className="h-5 w-5" />
      </div>
    )}
    {error && <p className="text-danger mt-1 text-xs font-semibold">{error}</p>}
  </div>
));
TextAreaField.displayName = 'TextAreaField';

// --- SelectField ---
interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string; // Add error prop
  isValid?: boolean; // Add isValid prop for success state
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, id, className, children, error, isValid, ...props }, ref) => (
  <div className="relative">
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-black"
    >
      {label}
    </label>
    <select
      id={id}
      ref={ref}
      {...props}
      className={`block w-full border-2 bg-white p-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-white sm:text-sm ${
        error ? 'border-danger' : isValid ? 'border-success' : 'border-black'
      } ${className}`}
      aria-invalid={!!error}
    >
      {children}
    </select>
    {isValid && !error && (
      <div className="absolute right-2 top-8 text-success">
        <CheckIcon className="h-5 w-5" />
      </div>
    )}
    {error && (
      <p className="text-danger mt-1 text-xs font-semibold">{error}</p>
    )}
  </div>
));
SelectField.displayName = 'SelectField';
