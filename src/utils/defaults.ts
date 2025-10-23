import type { Assumptions, PersonalInfo, Property } from '../types';

export const defaultAssumptions: Assumptions = {
  purchasePrice: 500000,
  downPaymentPercent: 0.20,
  interestRate: 0.065,
  loanTerm: 30,
  closingCostsPercent: 0.03,
  landValuePercent: 0.20,
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
  homeInsurancePercent: 0.004,
  monthlyHOA: 50,
  maintenancePercent: 0.08,
  utilitiesMonthly: 200,
  mgmtFeePercent: 0.10,
};

export const defaultPersonal: PersonalInfo = {
  federalTaxRate: 0.24,
  stateTaxRate: 0.05,
  opportunityCostRate: 0.07,
};

/**
 * SIMULATES fetching auto-filled data based on property info.
 * In a real app, this would be an API call based on address/zip.
 */
export const simulatePropertyData = (property: Property): Assumptions => {
  const simulatedPrice = 120000 * property.beds + 50000 * property.baths + (2024 - property.year) * 1000;
  const simulatedRent = 800 * property.beds + 200 * property.baths;
  const simulatedEquivRent = simulatedRent + 200;
  const simulatedTaxes = simulatedPrice * (0.008 + (property.beds / 1000));
  const simulatedInsurance = simulatedPrice * (0.003 + (property.baths / 1000));

  return {
    ...defaultAssumptions,
    purchasePrice: simulatedPrice,
    monthlyRent: simulatedRent,
    equivalentRent: simulatedEquivRent,
    propertyTaxPercent: simulatedTaxes / simulatedPrice,
    homeInsurancePercent: simulatedInsurance / simulatedPrice,
    avgNightlyRate: simulatedRent / 15,
    occupancyRate: 0.5,
  };
};
