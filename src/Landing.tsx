import React, { useState, useMemo } from 'react';
import {
  Home,
  BarChart3,
  ArrowLeft,
  DollarSign,
  Percent,
  TrendingUp,
  Briefcase,
  BedDouble,
  Bath,
  Calendar,
  Settings,
  Calculator,
  Building,
  User,
  Moon,
  Sun,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// --- Type Definitions ---

interface Property {
  address: string;
  beds: number;
  baths: number;
  year: number;
}

interface Assumptions {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  closingCostsPercent: number;
  landValuePercent: number;
  monthlyRent: number;
  vacancyPercent: number;
  avgNightlyRate: number;
  occupancyRate: number;
  airbnbFeePercent: number;
  equivalentRent: number;
  propertyTaxPercent: number;
  homeInsurancePercent: number;
  monthlyHOA: number;
  maintenancePercent: number;
  utilitiesMonthly: number;
  mgmtFeePercent: number;
}

interface PersonalInfo {
  federalTaxRate: number;
  stateTaxRate: number;
  opportunityCostRate: number;
}

type Scenario = 'rental' | 'airbnb' | 'owner';

interface BaseProforma {
  scenario: Scenario;
  totalCashNeeded: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  annualHOA: number;
  annualUtilities: number;
  opportunityCost: number;
  year1Principal: number;
}

interface RentalProforma extends BaseProforma {
  scenario: 'rental' | 'airbnb';
  grossPotentialIncome: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  totalOpEx: number;
  maintenance: number;
  managementFee: number;
  platformFee: number;
  annualMortgagePayment: number;
  totalExpenses: number;
  cashFlowBeforeTax: number;
  year1Interest: number;
  annualDepreciation: number;
  netTaxableIncome: number;
  taxBenefit: number;
  cashFlowAfterTax: number;
  capRate: number;
  cashOnCashReturn: number;
  cashFlowPerMonth: number;
}

interface OwnerProforma extends BaseProforma {
  scenario: 'owner';
  grossAvoidedRent: number;
  totalAnnualCost: number;
  totalExpenses: number;
  annualPITI: number;
  year1Interest: number;
  deductiblePropTax: number;
  totalDeductions: number;
  taxBenefit: number;
  netAnnualCost: number;
  netBenefit: number;
  monthlyTotalCost: number;
  netMonthlyCost: number;
}

type Proforma = RentalProforma | OwnerProforma;

// --- Helper Functions ---

/**
 * Formats a number as USD currency.
 */
const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) amount = 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number as a percentage.
 */
const formatPercent = (value: number): string => {
  if (isNaN(value)) value = 0;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Calculates the monthly principal and interest payment for a loan.
 */
const calculateMonthlyPI = (principal: number, annualRate: number, loanTermYears: number): number => {
  if (principal <= 0 || annualRate <= 0 || loanTermYears <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const numberOfPayments = loanTermYears * 12;

  if (monthlyRate === 0) return principal / numberOfPayments;

  const payment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return payment;
};

/**
 * SIMULATES fetching auto-filled data based on property info.
 * In a real app, this would be an API call based on address/zip.
 */
const simulatePropertyData = (property: Property): Assumptions => {
  // Simulate values based on beds/baths
  const simulatedPrice = 120000 * property.beds + 50000 * property.baths + (2024 - property.year) * 1000;
  const simulatedRent = 800 * property.beds + 200 * property.baths;
  const simulatedEquivRent = simulatedRent + 200;
  const simulatedTaxes = simulatedPrice * (0.008 + (property.beds / 1000)); // Varies by "location"
  const simulatedInsurance = simulatedPrice * (0.003 + (property.baths / 1000));

  return {
    ...defaultAssumptions, // Start with defaults
    purchasePrice: simulatedPrice,
    monthlyRent: simulatedRent,
    equivalentRent: simulatedEquivRent,
    propertyTaxPercent: simulatedTaxes / simulatedPrice,
    homeInsurancePercent: simulatedInsurance / simulatedPrice,
    // Simulate other values
    avgNightlyRate: simulatedRent / 15, // 50% occupancy to match rent
    occupancyRate: 0.5,
  };
};

/**
 * Calculates the full proforma based on assumptions and scenario.
 * This is the core logic engine.
 */
const calculateProforma = (assumptions: Assumptions, personal: PersonalInfo, scenario: Scenario): Proforma => {
  const {
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTerm,
    closingCostsPercent,
    landValuePercent,
    monthlyRent,
    avgNightlyRate,
    occupancyRate,
    propertyTaxPercent,
    homeInsurancePercent,
    monthlyHOA,
    maintenancePercent,
    vacancyPercent,
    utilitiesMonthly,
    mgmtFeePercent,
    airbnbFeePercent,
    equivalentRent,
  } = assumptions;

  const { federalTaxRate, stateTaxRate, opportunityCostRate } = personal;

  // --- Core Purchase & Loan Calculations ---
  const downPaymentAmount = purchasePrice * downPaymentPercent;
  const loanAmount = purchasePrice - downPaymentAmount;
  const totalCashNeeded = downPaymentAmount + (purchasePrice * closingCostsPercent);
  const monthlyPI = calculateMonthlyPI(loanAmount, interestRate, loanTerm);
  const annualMortgagePayment = monthlyPI * 12; // Renamed from annualDebtService

  // Year 1 Interest (Approximation)
  const year1Interest = loanAmount * interestRate;
  const year1Principal = annualMortgagePayment - year1Interest; // <--- NEW: Calculate Principal

  // --- Core Operating Expenses (OpEx) ---
  const annualPropertyTax = purchasePrice * propertyTaxPercent;
  const annualHomeInsurance = purchasePrice * homeInsurancePercent;
  const annualHOA = monthlyHOA * 12;
  const annualUtilities = utilitiesMonthly * 12;

  // Depreciation Basis
  const depreciationBasis = purchasePrice * (1 - landValuePercent);
  const annualDepreciation = depreciationBasis / 27.5; // Standard residential

  const combinedTaxRate = federalTaxRate + stateTaxRate;

  const opportunityCost = totalCashNeeded * opportunityCostRate; // <--- NEW: Calculate Opp Cost

  let proforma: BaseProforma = {
    scenario,
    totalCashNeeded,
    annualPropertyTax,
    annualHomeInsurance,
    annualHOA,
    annualUtilities,
    opportunityCost, // <--- NEW
    year1Principal, // <--- NEW
  };

  // --- Scenario-Specific Logic ---

  if (scenario === 'rental' || scenario === 'airbnb') {
    // --- Income ---
    const grossPotentialIncome = scenario === 'rental'
      ? monthlyRent * 12
      : avgNightlyRate * 365 * occupancyRate;

    const vacancyLoss = scenario === 'rental'
      ? grossPotentialIncome * vacancyPercent
      : 0; // Vacancy is built into occupancy for Airbnb

    const effectiveGrossIncome = grossPotentialIncome - vacancyLoss;

    // --- Scenario-Specific OpEx ---
    const maintenance = effectiveGrossIncome * maintenancePercent;
    const managementFee = effectiveGrossIncome * mgmtFeePercent;
    const platformFee = scenario === 'airbnb' ? effectiveGrossIncome * airbnbFeePercent : 0;

    const totalOpEx =
      annualPropertyTax +
      annualHomeInsurance +
      annualHOA +
      annualUtilities +
      maintenance +
      managementFee +
      platformFee;

    // Total Expenses (User's definition: all cash out + opportunity cost)
    const totalExpenses = totalOpEx + annualMortgagePayment + opportunityCost; // <--- ADDED Opp Cost

    // --- Investment Calculations ---
    const netOperatingIncome = effectiveGrossIncome - totalOpEx;
    const cashFlowBeforeTax = netOperatingIncome - annualMortgagePayment; // Uses cash payment

    // --- Tax Calculations ---
    const deductibleExpenses =
      totalOpEx +
      year1Interest +
      annualDepreciation;

    const netTaxableIncome = effectiveGrossIncome - deductibleExpenses;
    const taxSavings = netTaxableIncome < 0
      ? Math.abs(netTaxableIncome) * combinedTaxRate
      : 0; // Assumes passive loss rules, simplified
    const taxesOwed = netTaxableIncome > 0
      ? netTaxableIncome * combinedTaxRate
      : 0;

    const taxBenefit = taxSavings - taxesOwed; // Renamed from taxImpact
    const cashFlowAfterTax = cashFlowBeforeTax + taxBenefit;

    // --- Key Metrics ---
    const capRate = netOperatingIncome / purchasePrice;
    const cashOnCashReturn = cashFlowAfterTax / totalCashNeeded;
    const cashFlowPerMonth = cashFlowAfterTax / 12;

    return {
      ...proforma,
      scenario,
      // Income
      grossPotentialIncome,
      vacancyLoss,
      effectiveGrossIncome,
      // Expenses
      totalOpEx,
      maintenance,
      managementFee,
      platformFee,
      annualMortgagePayment, // Renamed
      totalExpenses, // Simplified for UI
      // Profit
      cashFlowBeforeTax,
      // Taxes
      year1Interest,
      annualDepreciation,
      netTaxableIncome,
      taxBenefit, // Renamed
      // Final
      cashFlowAfterTax,
      // Metrics
      capRate,
      cashOnCashReturn,
      cashFlowPerMonth,
    } as RentalProforma;
  } else if (scenario === 'owner') {
    // --- Owner-Occupied Logic ---
    // "Income" is the rent saved
    const grossAvoidedRent = equivalentRent * 12;

    // Total Housing Cost (PITI + HOA + Utils)
    const annualPITI = annualMortgagePayment + annualPropertyTax + annualHomeInsurance;
    const totalAnnualCost = annualPITI + annualHOA + annualUtilities;

    // Total "Expense" including opportunity cost
    const totalExpenses = totalAnnualCost + opportunityCost; // <--- NEW

    // Tax Savings (Simplified Itemized Deduction)
    const deductiblePropTax = Math.min(annualPropertyTax, 10000); // Capped
    const deductibleInterest = year1Interest;

    const totalDeductions = deductiblePropTax + deductibleInterest;
    const taxSavings = totalDeductions * combinedTaxRate;

    const netAnnualCost = totalAnnualCost - taxSavings;
    const netBenefit = grossAvoidedRent - netAnnualCost; // "Profit"

    // Monthly costs
    const monthlyTotalCost = totalAnnualCost / 12;
    const netMonthlyCost = netAnnualCost / 12;

    return {
      ...proforma,
      scenario,
      grossAvoidedRent,
      totalAnnualCost,
      totalExpenses, // <--- NEW
      annualPITI,
      year1Interest,
      deductiblePropTax,
      totalDeductions,
      taxBenefit: taxSavings, // Renamed
      netAnnualCost,
      netBenefit,
      monthlyTotalCost,
      netMonthlyCost,
    } as OwnerProforma;
  }

  // Fallback (should never reach here)
  return proforma as Proforma;
};

// --- Default State ---
const defaultAssumptions: Assumptions = {
  purchasePrice: 500000,
  downPaymentPercent: 0.20,
  interestRate: 0.065,
  loanTerm: 30,
  closingCostsPercent: 0.03,
  landValuePercent: 0.20, // For depreciation
  // Scenario: Rental
  monthlyRent: 3000,
  vacancyPercent: 0.05,
  // Scenario: Airbnb
  avgNightlyRate: 250,
  occupancyRate: 0.65,
  airbnbFeePercent: 0.03,
  // Scenario: Owner
  equivalentRent: 3200,
  // Common Expenses
  propertyTaxPercent: 0.012,
  homeInsurancePercent: 0.004, // $2000 on $500k
  monthlyHOA: 50,
  maintenancePercent: 0.08,
  utilitiesMonthly: 200, // Water, trash, etc. (often paid by owner)
  mgmtFeePercent: 0.10, // For LTR
};

const defaultPersonal: PersonalInfo = {
  federalTaxRate: 0.24,
  stateTaxRate: 0.05,
  opportunityCostRate: 0.07, // <--- NEW
};

// --- Main App Component ---

export default function App() {
  const [property, setProperty] = useState<Property | null>(null); // { address, beds, baths, year }
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // NEW: Store the auto-generated assumptions
  const [initialAssumptions, setInitialAssumptions] = useState<Assumptions>(defaultAssumptions);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAnalyze = (propertyData: Property) => {
    // Simulate fetching data and set it as the initial state
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
          initialAssumptions={initialAssumptions} // Pass simulated data
          onBack={() => setProperty(null)}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
    </div>
  );
}

// --- Page Components ---

interface HomePageProps {
  onAnalyze: (property: Property) => void;
}

/**
 * The initial landing page to enter property details.
 */
function HomePage({ onAnalyze }: HomePageProps) {
  const [address, setAddress] = useState<string>('123 Main St, Anytown, USA');
  const [beds, setBeds] = useState<number>(3);
  const [baths, setBaths] = useState<number>(2);
  const [year, setYear] = useState<number>(1995);

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
            placeholder="123 Main St, Anytown, USA"
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
function PropertyPage({ property, initialAssumptions, onBack, isDarkMode, toggleDarkMode }: PropertyPageProps) {
  // Assumptions state starts with the simulated data
  const [assumptions, setAssumptions] = useState<Assumptions>(initialAssumptions);
  const [personal, setPersonal] = useState<PersonalInfo>(defaultPersonal);
  const [scenario, setScenario] = useState<Scenario>('rental'); // 'rental', 'airbnb', 'owner'

  // NEW: State to control assumption modal
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  // Core calculation logic, memoized for performance
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
          {/* Proforma is now the main content */}
          <ProformaTabs
            scenario={scenario}
            setScenario={setScenario}
            proforma={proforma}
            personal={personal} // <--- ADDED THIS PROP
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

// --- UI/Logic Components ---

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
function AssumptionModal({ assumptions, setAssumptions, personal, setPersonal, onClose }: AssumptionModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto bg-black/30 dark:bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent click-through
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

interface AssumptionEditorProps {
  assumptions: Assumptions;
  setAssumptions: React.Dispatch<React.SetStateAction<Assumptions>>;
  personal: PersonalInfo;
  setPersonal: React.Dispatch<React.SetStateAction<PersonalInfo>>;
}

/**
 * The editor for all financial assumptions.
 */
function AssumptionEditor({ assumptions, setAssumptions, personal, setPersonal }: AssumptionEditorProps) {
  const handleAssumptionChange = (key: keyof Assumptions, value: string | number) => {
    // Handle percentages
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

interface ProformaTabsProps {
  scenario: Scenario;
  setScenario: React.Dispatch<React.SetStateAction<Scenario>>;
  proforma: Proforma;
  personal: PersonalInfo;
}

/**
 * The tabbed interface for switching scenarios.
 */
function ProformaTabs({ scenario, setScenario, proforma, personal }: ProformaTabsProps) {
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
        <ProformaDisplay proforma={proforma} scenario={scenario} personal={personal} /> {/* <--- PASSED personal PROP */}
      </div>
    </div>
  );
}

interface ProformaDisplayProps {
  proforma: Proforma;
  scenario: Scenario;
  personal: PersonalInfo;
}

/**
 * The main display for the proforma income statement.
 * REBUILT to be simpler and use drill-downs.
 */
function ProformaDisplay({ proforma, scenario, personal }: ProformaDisplayProps) {
  if (scenario === 'rental' || scenario === 'airbnb') {
    const rentalProforma = proforma as RentalProforma;
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Cap Rate"
            value={formatPercent(rentalProforma.capRate)}
            good
          />
          <StatCard
            label="Cash on Cash (ROI)"
            value={formatPercent(rentalProforma.cashOnCashReturn)}
            good
          />
          <StatCard
            label="Monthly Cash Flow"
            value={formatCurrency(rentalProforma.cashFlowPerMonth)}
            good={rentalProforma.cashFlowPerMonth > 0}
            bad={rentalProforma.cashFlowPerMonth < 0}
          />
          <StatCard
            label="Total Cash Needed"
            value={formatCurrency(rentalProforma.totalCashNeeded)}
          />
        </div>

        {/* Simplified Proforma Statement */}
        <div className="space-y-2">
          <SectionTitle icon={<BarChart3 />} title="Simplified Proforma (Year 1)" />

          <div className="text-lg dark:text-gray-300 space-y-2">
            <LineItem label="Total Annual Income" value={formatCurrency(rentalProforma.effectiveGrossIncome)} />
            <LineItem label="Total Annual Expenses" value={formatCurrency(rentalProforma.totalExpenses)} isNegative parens />
            <LineItem label="Net Cash Flow (Before Tax)" value={formatCurrency(rentalProforma.cashFlowBeforeTax)} isBold />
            <LineItem label="Tax Benefit (Savings / Owed)" value={formatCurrency(rentalProforma.taxBenefit)} isNegative={rentalProforma.taxBenefit < 0} parens />
            <LineItem label="Net Cash Flow (After Tax)" value={formatCurrency(rentalProforma.cashFlowAfterTax)} isBold isFinal />
          </div>
        </div>

        {/* Drill-Downs */}
        <div className="space-y-2">
          <DrillDown title="Income Breakdown">
            <LineItem label="Gross Potential Income" value={formatCurrency(rentalProforma.grossPotentialIncome)} />
            <LineItem label="Vacancy Loss" value={formatCurrency(rentalProforma.vacancyLoss)} isNegative parens />
            <LineItem label="Effective Gross Income" value={formatCurrency(rentalProforma.effectiveGrossIncome)} isBold />
          </DrillDown>

          <DrillDown title="Expense Breakdown">
            <LineItem label="Property Tax" value={formatCurrency(rentalProforma.annualPropertyTax)} isNegative parens />
            <LineItem label="Home Insurance" value={formatCurrency(rentalProforma.annualHomeInsurance)} isNegative parens />
            <LineItem label="HOA" value={formatCurrency(rentalProforma.annualHOA)} isNegative parens />
            <LineItem label="Utilities" value={formatCurrency(rentalProforma.annualUtilities)} isNegative parens />
            <LineItem label="Maintenance" value={formatCurrency(rentalProforma.maintenance)} isNegative parens />
            <LineItem label="Management Fee" value={formatCurrency(rentalProforma.managementFee)} isNegative parens />
            {scenario === 'airbnb' && (
              <LineItem label="Platform Fees" value={formatCurrency(rentalProforma.platformFee)} isNegative parens />
            )}
            <LineItem label="Mortgage Interest (Expense)" value={formatCurrency(rentalProforma.year1Interest)} isNegative parens />
            <LineItem label="Mortgage Principal (Equity)" value={formatCurrency(rentalProforma.year1Principal)} isNegative parens />
            <LineItem label="Opportunity Cost" value={formatCurrency(rentalProforma.opportunityCost)} isNegative parens />
            <LineItem label="Total Expenses" value={formatCurrency(rentalProforma.totalExpenses)} isBold />
          </DrillDown>

          <DrillDown title="Tax Calculation Breakdown">
            <LineItem label="Effective Gross Income" value={formatCurrency(rentalProforma.effectiveGrossIncome)} />
            <LineItem label="Total Operating Expenses" value={formatCurrency(rentalProforma.totalOpEx)} isNegative parens />
            <LineItem label="Net Operating Income (NOI)" value={formatCurrency(rentalProforma.effectiveGrossIncome - rentalProforma.totalOpEx)} isBold />
            <LineItem label="Interest Expense" value={formatCurrency(rentalProforma.year1Interest)} isNegative parens />
            <LineItem label="Depreciation" value={formatCurrency(rentalProforma.annualDepreciation)} isNegative parens />
            <LineItem label="Net Taxable Income / (Loss)" value={formatCurrency(rentalProforma.netTaxableIncome)} isBold />
            <LineItem label="Tax Benefit (Savings / Owed)" value={formatCurrency(rentalProforma.taxBenefit)} isBold />
          </DrillDown>
        </div>
      </div>
    );
  }

  if (scenario === 'owner') {
    const ownerProforma = proforma as OwnerProforma;
    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Net Monthly Cost"
            value={formatCurrency(ownerProforma.netMonthlyCost)}
            bad
          />
          <StatCard
            label="vs. Renting"
            value={formatCurrency(ownerProforma.netBenefit / 12)}
            good={ownerProforma.netBenefit > 0}
            bad={ownerProforma.netBenefit < 0}
            tooltip="Monthly benefit (or cost) vs. paying equivalent rent."
          />
          <StatCard
            label="Monthly Cost (No Tax)"
            value={formatCurrency(ownerProforma.monthlyTotalCost)}
            bad
          />
          <StatCard
            label="Total Cash Needed"
            value={formatCurrency(ownerProforma.totalCashNeeded)}
          />
        </div>

        {/* Simplified Proforma Statement */}
        <div className="space-y-2">
          <SectionTitle icon={<BarChart3 />} title="Owner-Occupied Analysis (Year 1)" />

          <div className="text-lg dark:text-gray-300 space-y-2">
            <LineItem label="Annual Avoided Rent (Income)" value={formatCurrency(ownerProforma.grossAvoidedRent)} />
            <LineItem label="Total Annual Housing Cost (Expense)" value={formatCurrency(ownerProforma.totalExpenses)} isNegative parens />
            <LineItem label="Net Position (Before Tax)" value={formatCurrency(ownerProforma.grossAvoidedRent - ownerProforma.totalAnnualCost)} isBold />
            <LineItem label="Tax Benefit (Savings)" value={formatCurrency(ownerProforma.taxBenefit)} />
            <LineItem label="Net Benefit vs. Renting" value={formatCurrency(ownerProforma.netBenefit)} isBold isFinal />
          </div>
        </div>

        {/* Drill-Downs */}
        <div className="space-y-2">
          <DrillDown title="Housing Cost Breakdown">
            <LineItem label="Mortgage Interest (Expense)" value={formatCurrency(ownerProforma.year1Interest)} isNegative parens />
            <LineItem label="Mortgage Principal (Equity)" value={formatCurrency(ownerProforma.year1Principal)} isNegative parens />
            <LineItem label="Property Tax" value={formatCurrency(ownerProforma.annualPropertyTax)} isNegative parens />
            <LineItem label="Home Insurance" value={formatCurrency(ownerProforma.annualHomeInsurance)} isNegative parens />
            <LineItem label="HOA" value={formatCurrency(ownerProforma.annualHOA)} isNegative parens />
            <LineItem label="Utilities" value={formatCurrency(ownerProforma.annualUtilities)} isNegative parens />
            <LineItem label="Opportunity Cost" value={formatCurrency(ownerProforma.opportunityCost)} isNegative parens />
            <LineItem label="Total Annual Cost" value={formatCurrency(ownerProforma.totalExpenses)} isBold />
          </DrillDown>

          <DrillDown title="Tax Savings Breakdown">
            <LineItem label="Mortgage Interest" value={formatCurrency(ownerProforma.year1Interest)} />
            <LineItem label="Property Tax (Capped)" value={formatCurrency(ownerProforma.deductiblePropTax)} />
            <LineItem label="Total Deductions" value={formatCurrency(ownerProforma.totalDeductions)} isBold />
            <LineItem label="x Combined Tax Rate" value={formatPercent(personal.federalTaxRate + personal.stateTaxRate)} />
            <LineItem label="Total Tax Savings" value={formatCurrency(ownerProforma.taxBenefit)} isBold />
          </DrillDown>
        </div>
      </div>
    );
  }

  return null;
}


// --- UI Primitives ---

interface InputGroupProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A reusable styled input component.
 */
function InputGroup({ label, id, icon, children }: InputGroupProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

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
function SliderInput({ label, id, value, onChange, min, max, step, isPercent, tooltip }: SliderInputProps) {
  const numberValue = isPercent ? (value * 100) : value;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val: number = parseFloat(e.target.value) || 0;
    if (isPercent) {
        val = val / 100;
    }
    onChange({ target: { value: val.toString() }} as React.ChangeEvent<HTMLInputElement>); // Mock event
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
function StatCard({ label, value, good, bad, tooltip }: StatCardProps) {
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

interface SectionTitleProps {
  icon: React.ReactElement;
  title: string;
}

/**
 * A reusable section title.
 */
function SectionTitle({ icon, title }: SectionTitleProps) {
  return (
    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700 first:pt-0 first:border-t-0">
      <div className="text-gray-500 dark:text-gray-400">{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
  );
}

interface DrillDownProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A collapsible drill-down component.
 */
function DrillDown({ title, children }: DrillDownProps) {
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

interface LineItemProps {
  label: string;
  value: string;
  isBold?: boolean;
  isFinal?: boolean;
  isNegative?: boolean;
  parens?: boolean;
}

/**
 * A single line item for the proforma.
 */
function LineItem({ label, value, isBold, isFinal, isNegative, parens }: LineItemProps) {
  return (
    <div className={`
      flex justify-between items-center py-2
      ${isFinal ? 'border-t-2 border-gray-900 dark:border-gray-300 mt-2' : ''}
      ${isBold ? 'font-semibold dark:text-white' : ''}
      ${isFinal ? 'text-xl font-bold' : ''}
      ${!isFinal ? 'border-t border-dashed border-gray-200 dark:border-gray-700 first:border-t-0' : ''}
    `}>
      <span>{label}</span>
      <span className={isNegative ? 'text-red-600 dark:text-red-400' : ''}>
        {parens && isNegative ? `(${value.replace('-', '')})` : value}
      </span>
    </div>
  );
}

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

/**
 * A toggle for light/dark mode.
 */
function ThemeToggle({ isDarkMode, toggleDarkMode }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  );
}


// --- Add global styles for form elements and icons ---
(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    .form-input {
      display: block;
      width: 100%;
      border-radius: 0.375rem; /* rounded-md */
      border: 1px solid #D1D5DB; /* border-gray-300 */
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .dark .form-input {
      background-color: #374151; /* dark:bg-gray-700 */
      border-color: #4B5563; /* dark:border-gray-600 */
      color: #F9FAFB; /* dark:text-gray-100 */
      placeholder-color: #9CA3AF; /* dark:placeholder-gray-400 */
    }

    .form-input:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-color: #3B82F6; /* focus:border-blue-500 */
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* focus:ring-blue-500 */
    }

    .dark .form-input:focus {
      border-color: #3B82F6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }

    .icon-sm {
      width: 1.25rem; /* w-5 */
      height: 1.25rem; /* h-5 */
      color: #9CA3AF; /* text-gray-400 */
    }

    /* Custom slider thumb */
    .range-thumb-blue::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 1rem;
      height: 1rem;
      background: #3B82F6; /* bg-blue-600 */
      border-radius: 9999px; /* rounded-full */
      cursor: pointer;
      margin-top: -4px; /* Center thumb on track */
    }

    .range-thumb-blue::-moz-range-thumb {
      width: 1rem;
      height: 1rem;
      background: #3B82F6;
      border-radius: 9999px;
      cursor: pointer;
      border: none;
    }

    /* Icon padding */
    input[type="text"][id="beds"],
    input[type="number"][id="beds"],
    input[type="text"][id="baths"],
    input[type="number"][id="baths"],
    input[type="text"][id="year"],
    input[type="number"][id="year"] {
       padding-left: 2.5rem; /* pl-10 for icon */
    }

    /* No icon padding */
    #address, #purchasePrice, #monthlyRent, #avgNightlyRate, #equivalentRent, #monthlyHOA, #utilitiesMonthly, #loanTerm {
      padding-left: 0.75rem; /* pl-3 */
    }

    /* Fix number input alignment */
    input[type="number"].text-right {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }

    /* Remove number input spinners */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }

  `;
  document.head.appendChild(style);
})();
