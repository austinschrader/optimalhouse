// --- Type Definitions ---

export interface Property {
  address: string;
  beds: number;
  baths: number;
  year: number;
}

export interface Assumptions {
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

export interface PersonalInfo {
  federalTaxRate: number;
  stateTaxRate: number;
  opportunityCostRate: number;
}

export type Scenario = 'rental' | 'airbnb' | 'owner';

export interface BaseProforma {
  scenario: Scenario;
  totalCashNeeded: number;
  annualPropertyTax: number;
  annualHomeInsurance: number;
  annualHOA: number;
  annualUtilities: number;
  opportunityCost: number;
  year1Principal: number;
}

export interface RentalProforma extends BaseProforma {
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

export interface OwnerProforma extends BaseProforma {
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

export type Proforma = RentalProforma | OwnerProforma;
