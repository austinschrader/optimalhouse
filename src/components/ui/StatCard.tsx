import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  good?: boolean;
  bad?: boolean;
  tooltip?: string;
}

/**
 * A card for displaying a key metric.
 */
export function StatCard({ label, value, good, bad, tooltip }: StatCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner" title={tooltip}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
      <p className={`
        text-2xl font-semibold mt-1
        ${good ? 'text-green-600 dark:text-green-400' : ''}
        ${bad ? 'text-red-600 dark:text-red-400' : ''}
      `}>
        {value}
      </p>
    </div>
  );
}
