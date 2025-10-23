import React, { useState } from 'react';
import { Home, BarChart3, BedDouble, Bath, Calendar } from 'lucide-react';
import type { Property } from '../types';
import { InputGroup } from './ui/InputGroup';

interface HomePageProps {
  onAnalyze: (property: Property) => void;
}

/**
 * The initial landing page to enter property details.
 */
export function HomePage({ onAnalyze }: HomePageProps) {
  const [address, setAddress] = useState<string>('1247 Maple Grove Avenue, Portland, OR 97214');
  const [beds, setBeds] = useState<number>(3);
  const [baths, setBaths] = useState<number>(2);
  const [year, setYear] = useState<number>(2006);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAnalyze({ address, beds, baths, year });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="p-3 bg-blue-600 rounded-full">
          <Home className="w-10 h-10 text-white" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-center tracking-tight dark:text-white">
          OptimalHouse
        </h1>
        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
          Analyze any property. Instantly.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <InputGroup label="Property Address" id="address">
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-input"
            required
            placeholder="1247 Maple Grove Avenue, Portland, OR 97214"
          />
        </InputGroup>

        <div className="grid grid-cols-3 gap-4">
          <InputGroup label="Beds" id="beds" icon={<BedDouble className="icon-sm" />}>
            <input
              id="beds"
              type="number"
              value={beds}
              onChange={(e) => setBeds(Number(e.target.value))}
              className="form-input"
              required
              min="0"
            />
          </InputGroup>
          <InputGroup label="Baths" id="baths" icon={<Bath className="icon-sm" />}>
            <input
              id="baths"
              type="number"
              value={baths}
              onChange={(e) => setBaths(Number(e.target.value))}
              className="form-input"
              required
              step="0.5"
              min="0"
            />
          </InputGroup>
          <InputGroup label="Year" id="year" icon={<Calendar className="icon-sm" />}>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="form-input"
              required
              min="1800"
              max={new Date().getFullYear()}
            />
          </InputGroup>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all transform hover:scale-105"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Analyze Property
        </button>
      </form>
    </div>
  );
}
