import React from 'react';

interface SliderInputProps {
  label: string;
  id: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
  isPercent?: boolean;
  tooltip?: string;
}

/**
 * A reusable styled slider input component.
 */
export function SliderInput({ label, id, value, onChange, min, max, step, isPercent, tooltip }: SliderInputProps) {
  const numberValue = isPercent ? (value * 100) : value;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val: number = parseFloat(e.target.value) || 0;
    if (isPercent) {
        val = val / 100;
    }
    onChange({ target: { value: val.toString() }} as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
         <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300" title={tooltip}>
          {label} {tooltip && <span className="text-gray-400">(?)</span>}
        </label>
        <input
          type="number"
          value={numberValue.toFixed(step.toString().split('.')[1]?.length || 0)}
          onChange={handleTextChange}
          min={isPercent ? min : undefined}
          max={isPercent ? max : undefined}
          step={step}
          className="form-input w-28 text-right"
        />
      </div>
      <input
        id={id}
        type="range"
        value={isPercent ? value * 100 : value}
        onChange={isPercent ? e => onChange({ target: { value: (parseFloat(e.target.value) / 100).toString() }} as React.ChangeEvent<HTMLInputElement>) : onChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer range-thumb-blue"
      />
    </div>
  );
}
