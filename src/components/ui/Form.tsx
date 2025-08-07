import React from "react";

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
    <label htmlFor={id} className="block text-sm font-bold text-black mb-1">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm ${className}`}
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
    <label htmlFor={id} className="block text-sm font-bold text-black mb-1">
      {label}
    </label>
    <textarea
      id={id}
      {...props}
      className={`block w-full border border-black bg-white p-2 text-black placeholder:text-neutral-500 focus:ring-0 sm:text-sm ${className}`}
    />
  </div>
);
