import React, { useState, useMemo } from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import type { Property, Assumptions, PersonalInfo, Scenario } from '../types';
import { defaultPersonal } from '../utils/defaults';
import { calculateProforma } from '../utils/calculations';
import { ThemeToggle } from './ui/ThemeToggle';
import { AssumptionModal } from './AssumptionModal';
import { ProformaTabs } from './ProformaTabs';

interface PropertyPageProps {
  property: Property;
  initialAssumptions: Assumptions;
  onBack: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * The main analysis page with assumptions and proforma.
 */
export function PropertyPage({ property, initialAssumptions, onBack, isDarkMode, toggleDarkMode }: PropertyPageProps) {
  const [assumptions, setAssumptions] = useState<Assumptions>(initialAssumptions);
  const [personal, setPersonal] = useState<PersonalInfo>(defaultPersonal);
  const [scenario, setScenario] = useState<Scenario>('rental');
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  const proforma = useMemo(() => {
    return calculateProforma(assumptions, personal, scenario);
  }, [assumptions, personal, scenario]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-md dark:shadow-none dark:border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side: Back Button & Property Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">{property.address}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {property.beds} beds | {property.baths} baths | Built {property.year}
                </p>
              </div>
            </div>

            {/* Right Side: Tweak Button & Theme Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAssumptions(true)}
                className="flex items-center py-2 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Settings className="w-4 h-4 mr-1.5" />
                Tweak Assumptions
              </button>
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <ProformaTabs
            scenario={scenario}
            setScenario={setScenario}
            proforma={proforma}
            personal={personal}
          />
        </div>
      </main>

      {/* Assumptions Modal */}
      {showAssumptions && (
        <AssumptionModal
          assumptions={assumptions}
          setAssumptions={setAssumptions}
          personal={personal}
          setPersonal={setPersonal}
          onClose={() => setShowAssumptions(false)}
        />
      )}
    </div>
  );
}
