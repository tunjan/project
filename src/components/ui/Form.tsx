import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const InputField: React.FC<InputProps> = ({
  label,
  id,
  className,
  ...props
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-neutral-700"
    >
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${className}`}
    />
  </div>
);

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}

export const TextAreaField: React.FC<TextAreaProps> = ({
  label,
  id,
  className,
  ...props
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-neutral-700"
    >
      {label}
    </label>
    <textarea
      id={id}
      {...props}
      className={`block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:text-sm ${className}`}
    />
  </div>
);

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  className,
  children,
  ...props
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1 block text-sm font-bold text-neutral-700"
    >
      {label}
    </label>
    <select
      id={id}
      {...props}
      className={`block w-full rounded-none border border-neutral-300 bg-white p-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-neutral-200 sm:text-sm ${className}`}
    >
      {children}
    </select>
  </div>
);
