import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DrillDownProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A collapsible drill-down component.
 */
export function DrillDown({ title, children }: DrillDownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-3 text-left"
      >
        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{title}</span>
        {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-sm dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}
