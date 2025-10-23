import React from 'react';

interface LineItemProps {
  label: string;
  value: string;
  isBold?: boolean;
  isFinal?: boolean;
  isNegative?: boolean;
  parens?: boolean;
}

/**
 * A single line item for the proforma.
 */
export function LineItem({ label, value, isBold, isFinal, isNegative, parens }: LineItemProps) {
  return (
    <div className={`
      flex justify-between items-center py-2
      ${isFinal ? 'border-t-2 border-gray-900 dark:border-gray-300 mt-2' : ''}
      ${isBold ? 'font-semibold dark:text-white' : ''}
      ${isFinal ? 'text-xl font-bold' : ''}
      ${!isFinal ? 'border-t border-dashed border-gray-200 dark:border-gray-700 first:border-t-0' : ''}
    `}>
      <span>{label}</span>
      <span className={isNegative ? 'text-red-600 dark:text-red-400' : ''}>
        {parens && isNegative ? `(${value.replace('-', '')})` : value}
      </span>
    </div>
  );
}
