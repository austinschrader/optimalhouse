import React from 'react';

interface SectionTitleProps {
  icon: React.ReactElement;
  title: string;
}

/**
 * A reusable section title.
 */
export function SectionTitle({ icon, title }: SectionTitleProps) {
  return (
    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 first:pt-0 first:border-t-0">
      <div className="text-gray-500 dark:text-gray-400">{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
  );
}
