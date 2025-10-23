import React from 'react';

interface InputGroupProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A reusable styled input component.
 */
export function InputGroup({ label, id, icon, children }: InputGroupProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
