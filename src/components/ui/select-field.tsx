import React from 'react';

import { Label } from './label';
import { Select, SelectContent, SelectTrigger, SelectValue } from './select';

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  value,
  onChange,
  children,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
};

export { SelectField };
