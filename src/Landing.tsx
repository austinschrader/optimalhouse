import React, { useState } from 'react';
import type { Property, Assumptions } from './types';
import { defaultAssumptions, simulatePropertyData } from './utils/defaults';
import { HomePage } from './components/HomePage';
import { PropertyPage } from './components/PropertyPage';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { injectGlobalStyles } from './styles/globals';

// Inject global styles on component mount
injectGlobalStyles();

/**
 * Main App Component
 */
export default function App() {
  const [property, setProperty] = useState<Property | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [initialAssumptions, setInitialAssumptions] = useState<Assumptions>(defaultAssumptions);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAnalyze = (propertyData: Property) => {
    const simulatedData = simulatePropertyData(propertyData);
    setInitialAssumptions(simulatedData);
    setProperty(propertyData);
  };

  if (!property) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          <HomePage onAnalyze={handleAnalyze} />
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <PropertyPage
          property={property}
          initialAssumptions={initialAssumptions}
          onBack={() => setProperty(null)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
    </div>
  );
}
