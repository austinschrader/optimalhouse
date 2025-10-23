import React from 'react';
import { Briefcase, Home, User } from 'lucide-react';
import type { Scenario, Proforma, PersonalInfo } from '../types';
import { ProformaDisplay } from './ProformaDisplay';

interface ProformaTabsProps {
  scenario: Scenario;
  setScenario: React.Dispatch<React.SetStateAction<Scenario>>;
  proforma: Proforma;
  personal: PersonalInfo;
}

/**
 * The tabbed interface for switching scenarios.
 */
export function ProformaTabs({ scenario, setScenario, proforma, personal }: ProformaTabsProps) {
  const tabs = [
    { id: 'rental' as Scenario, name: 'Long-Term Rental', icon: <Briefcase /> },
    { id: 'airbnb' as Scenario, name: 'Short-Term (Airbnb)', icon: <Home /> },
    { id: 'owner' as Scenario, name: 'Owner-Occupied', icon: <User /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-1 sm:space-x-4 p-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setScenario(tab.id)}
              className={`
                flex items-center justify-center text-sm sm:text-base font-medium py-3 px-3 sm:px-5 rounded-lg transition-all
                ${
                  scenario === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              aria-current={scenario === tab.id ? 'page' : undefined}
            >
              <div className="w-5 h-5 sm:mr-2">{tab.icon}</div>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6">
        <ProformaDisplay proforma={proforma} scenario={scenario} personal={personal} />
      </div>
    </div>
  );
}
