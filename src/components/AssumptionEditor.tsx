import React from 'react';
import { Settings, User, Building, TrendingUp, Calculator, DollarSign, Calendar } from 'lucide-react';
import type { Assumptions, PersonalInfo } from '../types';
import { InputGroup } from './ui/InputGroup';
import { SliderInput } from './ui/SliderInput';
import { SectionTitle } from './ui/SectionTitle';

interface AssumptionEditorProps {
  assumptions: Assumptions;
  setAssumptions: React.Dispatch<React.SetStateAction<Assumptions>>;
  personal: PersonalInfo;
  setPersonal: React.Dispatch<React.SetStateAction<PersonalInfo>>;
}

/**
 * The editor for all financial assumptions.
 */
export function AssumptionEditor({ assumptions, setAssumptions, personal, setPersonal }: AssumptionEditorProps) {
  const handleAssumptionChange = (key: keyof Assumptions, value: string | number) => {
    let processedValue: number = 0;
    if (key.includes('Percent') || key.includes('Rate')) {
      if (value === '') {
        processedValue = 0;
      } else {
        processedValue = parseFloat(value.toString()) / 100;
      }
    } else {
      processedValue = Number(value);
    }
    setAssumptions((prev) => ({ ...prev, [key]: processedValue }));
  };

  const handleSliderChange = (key: keyof Assumptions, value: number) => {
     setAssumptions((prev) => ({ ...prev, [key]: value }));
  };

  const handlePersonalChange = (key: keyof PersonalInfo, value: string | number) => {
    let processedValue: number = 0;
    if (value === '') {
      processedValue = 0;
    } else {
      processedValue = parseFloat(value.toString()) / 100;
    }
    setPersonal((prev) => ({ ...prev, [key]: processedValue }));
  };

  return (
    <div className="overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Assumptions</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tweak every variable to match your scenario.
        </p>
      </div>

      {/* Scrollable content area */}
      <div className="p-5 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {/* Personal Section */}
        <SectionTitle icon={<User />} title="Personal" />
        <SliderInput
          label="Federal Tax Rate"
          id="federalTaxRate"
          value={personal.federalTaxRate}
          onChange={(e) => handlePersonalChange('federalTaxRate', e.target.value)}
          min={0}
          max={50}
          step={1}
          isPercent
        />
        <SliderInput
          label="State Tax Rate"
          id="stateTaxRate"
          value={personal.stateTaxRate}
          onChange={(e) => handlePersonalChange('stateTaxRate', e.target.value)}
          min={0}
          max={15}
          step={0.5}
          isPercent
        />
        <SliderInput
          label="Opportunity Cost Rate"
          id="opportunityCostRate"
          value={personal.opportunityCostRate}
          onChange={(e) => handlePersonalChange('opportunityCostRate', e.target.value)}
          min={0}
          max={15}
          step={0.1}
          isPercent
          tooltip="Expected return if your cash was invested elsewhere (e.g., S&P 500)"
        />

        {/* Purchase Section */}
        <SectionTitle icon={<Building />} title="Purchase & Loan" />
        <InputGroup label="Purchase Price" id="purchasePrice" icon={<DollarSign className="icon-sm" />}>
          <input
            id="purchasePrice"
            type="number"
            value={assumptions.purchasePrice}
            onChange={(e) => handleAssumptionChange('purchasePrice', e.target.value)}
            className="form-input"
            step="1000"
          />
        </InputGroup>
        <SliderInput
          label="Down Payment"
          id="downPaymentPercent"
          value={assumptions.downPaymentPercent}
          onChange={(e) => handleSliderChange('downPaymentPercent', Number(e.target.value))}
          min={0}
          max={100}
          step={1}
          isPercent
        />
        <SliderInput
          label="Interest Rate"
          id="interestRate"
          value={assumptions.interestRate}
          onChange={(e) => handleSliderChange('interestRate', Number(e.target.value))}
          min={1}
          max={15}
          step={0.125}
          isPercent
        />
        <InputGroup label="Loan Term (Years)" id="loanTerm" icon={<Calendar className="icon-sm" />}>
          <input
            id="loanTerm"
            type="number"
            value={assumptions.loanTerm}
            onChange={(e) => handleAssumptionChange('loanTerm', e.target.value)}
            className="form-input"
            step="1"
            min="1"
          />
        </InputGroup>
        <SliderInput
          label="Closing Costs"
          id="closingCostsPercent"
          value={assumptions.closingCostsPercent}
          onChange={(e) => handleSliderChange('closingCostsPercent', Number(e.target.value))}
          min={0}
          max={10}
          step={0.1}
          isPercent
        />

        {/* Income Section */}
        <SectionTitle icon={<TrendingUp />} title="Income Scenarios" />
        <InputGroup label="Monthly Rent (LTR)" id="monthlyRent" icon={<DollarSign className="icon-sm" />}>
          <input
            id="monthlyRent"
            type="number"
            value={assumptions.monthlyRent}
            onChange={(e) => handleAssumptionChange('monthlyRent', e.target.value)}
            className="form-input"
            step="25"
          />
        </InputGroup>
        <InputGroup label="Avg. Nightly Rate (STR)" id="avgNightlyRate" icon={<DollarSign className="icon-sm" />}>
          <input
            id="avgNightlyRate"
            type="number"
            value={assumptions.avgNightlyRate}
            onChange={(e) => handleAssumptionChange('avgNightlyRate', e.target.value)}
            className="form-input"
            step="5"
          />
        </InputGroup>
        <SliderInput
          label="Occupancy Rate (STR)"
          id="occupancyRate"
          value={assumptions.occupancyRate}
          onChange={(e) => handleSliderChange('occupancyRate', Number(e.target.value))}
          min={0}
          max={100}
          step={1}
          isPercent
        />
        <InputGroup label="Equivalent Rent (Owner)" id="equivalentRent" icon={<DollarSign className="icon-sm" />}>
          <input
            id="equivalentRent"
            type="number"
            value={assumptions.equivalentRent}
            onChange={(e) => handleAssumptionChange('equivalentRent', e.target.value)}
            className="form-input"
            step="25"
          />
        </InputGroup>

        {/* Expenses Section */}
        <SectionTitle icon={<Calculator />} title="Operating Expenses" />
        <SliderInput
          label="Property Tax"
          id="propertyTaxPercent"
          value={assumptions.propertyTaxPercent}
          onChange={(e) => handleSliderChange('propertyTaxPercent', Number(e.target.value))}
          min={0}
          max={5}
          step={0.05}
          isPercent
          tooltip="(as % of Purchase Price)"
        />
        <SliderInput
          label="Home Insurance"
          id="homeInsurancePercent"
          value={assumptions.homeInsurancePercent}
          onChange={(e) => handleSliderChange('homeInsurancePercent', Number(e.target.value))}
          min={0}
          max={2}
          step={0.01}
          isPercent
          tooltip="(as % of Purchase Price)"
        />
        <InputGroup label="Monthly HOA" id="monthlyHOA" icon={<DollarSign className="icon-sm" />}>
          <input
            id="monthlyHOA"
            type="number"
            value={assumptions.monthlyHOA}
            onChange={(e) => handleAssumptionChange('monthlyHOA', e.target.value)}
            className="form-input"
            step="5"
          />
        </InputGroup>
        <InputGroup label="Utilities (Monthly)" id="utilitiesMonthly" icon={<DollarSign className="icon-sm" />}>
          <input
            id="utilitiesMonthly"
            type="number"
            value={assumptions.utilitiesMonthly}
            onChange={(e) => handleAssumptionChange('utilitiesMonthly', e.target.value)}
            className="form-input"
            step="10"
          />
        </InputGroup>
        <SliderInput
          label="Maintenance"
          id="maintenancePercent"
          value={assumptions.maintenancePercent}
          onChange={(e) => handleSliderChange('maintenancePercent', Number(e.target.value))}
          min={0}
          max={20}
          step={0.5}
          isPercent
          tooltip="(as % of Gross Income)"
        />
        <SliderInput
          label="Vacancy (LTR)"
          id="vacancyPercent"
          value={assumptions.vacancyPercent}
          onChange={(e) => handleSliderChange('vacancyPercent', Number(e.target.value))}
          min={0}
          max={20}
          step={0.5}
          isPercent
          tooltip="(as % of LTR Gross Income)"
        />
        <SliderInput
          label="Management Fee"
          id="mgmtFeePercent"
          value={assumptions.mgmtFeePercent}
          onChange={(e) => handleSliderChange('mgmtFeePercent', Number(e.target.value))}
          min={0}
          max={20}
          step={0.5}
          isPercent
          tooltip="(as % of Gross Income)"
        />
        <SliderInput
          label="STR Platform Fee"
          id="airbnbFeePercent"
          value={assumptions.airbnbFeePercent}
          onChange={(e) => handleSliderChange('airbnbFeePercent', Number(e.target.value))}
          min={0}
          max={20}
          step={0.1}
          isPercent
          tooltip="(as % of STR Gross Income)"
        />
        <SliderInput
          label="Land Value"
          id="landValuePercent"
          value={assumptions.landValuePercent}
          onChange={(e) => handleSliderChange('landValuePercent', Number(e.target.value))}
          min={0}
          max={50}
          step={1}
          isPercent
          tooltip="(as % of Purchase Price, for depreciation)"
        />
      </div>
    </div>
  );
}
