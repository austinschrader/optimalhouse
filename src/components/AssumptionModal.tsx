import React from 'react';
import { X } from 'lucide-react';
import type { Assumptions, PersonalInfo } from '../types';
import { AssumptionEditor } from './AssumptionEditor';

interface AssumptionModalProps {
  assumptions: Assumptions;
  setAssumptions: React.Dispatch<React.SetStateAction<Assumptions>>;
  personal: PersonalInfo;
  setPersonal: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  onClose: () => void;
}

/**
 * A modal to hold the AssumptionEditor.
 */
export function AssumptionModal({ assumptions, setAssumptions, personal, setPersonal, onClose }: AssumptionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto bg-black/30 dark:bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <AssumptionEditor
          assumptions={assumptions}
          setAssumptions={setAssumptions}
          personal={personal}
          setPersonal={setPersonal}
        />
      </div>
    </div>
  );
}
