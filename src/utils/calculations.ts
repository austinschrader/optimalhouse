import type { Assumptions, PersonalInfo, Scenario, Proforma, RentalProforma, OwnerProforma, BaseProforma } from '../types';

/**
 * Formats a number as USD currency.
 */
export const formatCurrency = (amount: number): string => {
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
export const formatPercent = (value: number): string => {
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
export const calculateMonthlyPI = (principal: number, annualRate: number, loanTermYears: number): number => {
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
 * Calculates the full proforma based on assumptions and scenario.
 * This is the core logic engine.
 */
export const calculateProforma = (assumptions: Assumptions, personal: PersonalInfo, scenario: Scenario): Proforma => {
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
  const annualMortgagePayment = monthlyPI * 12;

  // Year 1 Interest (Approximation)
  const year1Interest = loanAmount * interestRate;
  const year1Principal = annualMortgagePayment - year1Interest;

  // --- Core Operating Expenses (OpEx) ---
  const annualPropertyTax = purchasePrice * propertyTaxPercent;
  const annualHomeInsurance = purchasePrice * homeInsurancePercent;
  const annualHOA = monthlyHOA * 12;
  const annualUtilities = utilitiesMonthly * 12;

  // Depreciation Basis
  const depreciationBasis = purchasePrice * (1 - landValuePercent);
  const annualDepreciation = depreciationBasis / 27.5; // Standard residential

  const combinedTaxRate = federalTaxRate + stateTaxRate;

  const opportunityCost = totalCashNeeded * opportunityCostRate;

  let proforma: BaseProforma = {
    scenario,
    totalCashNeeded,
    annualPropertyTax,
    annualHomeInsurance,
    annualHOA,
    annualUtilities,
    opportunityCost,
    year1Principal,
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
    const totalExpenses = totalOpEx + annualMortgagePayment + opportunityCost;

    // --- Investment Calculations ---
    const netOperatingIncome = effectiveGrossIncome - totalOpEx;
    const cashFlowBeforeTax = netOperatingIncome - annualMortgagePayment;

    // --- Tax Calculations ---
    const deductibleExpenses =
      totalOpEx +
      year1Interest +
      annualDepreciation;

    const netTaxableIncome = effectiveGrossIncome - deductibleExpenses;
    const taxSavings = netTaxableIncome < 0
      ? Math.abs(netTaxableIncome) * combinedTaxRate
      : 0;
    const taxesOwed = netTaxableIncome > 0
      ? netTaxableIncome * combinedTaxRate
      : 0;

    const taxBenefit = taxSavings - taxesOwed;
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
      annualMortgagePayment,
      totalExpenses,
      // Profit
      cashFlowBeforeTax,
      // Taxes
      year1Interest,
      annualDepreciation,
      netTaxableIncome,
      taxBenefit,
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
    const totalExpenses = totalAnnualCost + opportunityCost;

    // Tax Savings (Simplified Itemized Deduction)
    const deductiblePropTax = Math.min(annualPropertyTax, 10000); // Capped
    const deductibleInterest = year1Interest;

    const totalDeductions = deductiblePropTax + deductibleInterest;
    const taxSavings = totalDeductions * combinedTaxRate;

    const netAnnualCost = totalAnnualCost - taxSavings;
    const netBenefit = grossAvoidedRent - netAnnualCost;

    // Monthly costs
    const monthlyTotalCost = totalAnnualCost / 12;
    const netMonthlyCost = netAnnualCost / 12;

    return {
      ...proforma,
      scenario,
      grossAvoidedRent,
      totalAnnualCost,
      totalExpenses,
      annualPITI,
      year1Interest,
      deductiblePropTax,
      totalDeductions,
      taxBenefit: taxSavings,
      netAnnualCost,
      netBenefit,
      monthlyTotalCost,
      netMonthlyCost,
    } as OwnerProforma;
  }

  // Fallback (should never reach here)
  return proforma as Proforma;
};
