import type { Assumptions, PersonalInfo, Property } from '../types';

export const defaultAssumptions: Assumptions = {
  purchasePrice: 425000,
  downPaymentPercent: 0.20,
  interestRate: 0.0675,
  loanTerm: 30,
  closingCostsPercent: 0.03,
  landValuePercent: 0.20,
  // Scenario: Rental
  monthlyRent: 2400,
  vacancyPercent: 0.05,
  // Scenario: Airbnb
  avgNightlyRate: 185,
  occupancyRate: 0.68,
  airbnbFeePercent: 0.03,
  // Scenario: Owner
  equivalentRent: 2650,
  // Common Expenses
  propertyTaxPercent: 0.0115,
  homeInsurancePercent: 0.0038,
  monthlyHOA: 125,
  maintenancePercent: 0.08,
  utilitiesMonthly: 185,
  mgmtFeePercent: 0.10,
};

export const defaultPersonal: PersonalInfo = {
  federalTaxRate: 0.24,
  stateTaxRate: 0.06,
  opportunityCostRate: 0.08,
};

/**
 * Helper to generate consistent randomization with a seed based on property characteristics
 */
const seededRandom = (seed: number, min: number, max: number): number => {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return min + random * (max - min);
};

/**
 * Generate a seed from property characteristics for consistent randomization
 */
const generateSeed = (property: Property): number => {
  const addressHash = property.address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return addressHash + property.beds * 100 + property.baths * 50 + property.year;
};

/**
 * Realistic property pricing based on market data patterns
 */
const calculateRealisticPrice = (property: Property, seed: number): number => {
  // Base price per bedroom and bathroom (realistic market ranges)
  const basePricePerBed = seededRandom(seed + 1, 80000, 120000);
  const basePricePerBath = seededRandom(seed + 2, 35000, 55000);

  // Age depreciation/appreciation factor
  const propertyAge = 2024 - property.year;
  let ageFactor = 1.0;

  if (propertyAge < 5) {
    // New construction premium
    ageFactor = seededRandom(seed + 3, 1.15, 1.25);
  } else if (propertyAge < 15) {
    // Modern home, slight premium
    ageFactor = seededRandom(seed + 4, 1.05, 1.15);
  } else if (propertyAge < 30) {
    // Established home
    ageFactor = seededRandom(seed + 5, 0.95, 1.05);
  } else if (propertyAge < 50) {
    // Older home, needs updates
    ageFactor = seededRandom(seed + 6, 0.80, 0.95);
  } else {
    // Historic or dated
    ageFactor = seededRandom(seed + 7, 0.70, 0.90);
  }

  // Base calculation
  const basePrice = (basePricePerBed * property.beds) + (basePricePerBath * property.baths);

  // Market adjustment (location, condition, features)
  const marketMultiplier = seededRandom(seed + 8, 0.85, 1.35);

  const finalPrice = basePrice * ageFactor * marketMultiplier;

  // Round to nearest $5,000
  return Math.round(finalPrice / 5000) * 5000;
};

/**
 * Calculate realistic rent based on property characteristics and local market ratios
 */
const calculateRealisticRent = (purchasePrice: number, property: Property, seed: number): number => {
  // Typical rent-to-price ratio ranges from 0.4% to 0.8% of purchase price monthly
  const rentRatioBase = seededRandom(seed + 10, 0.0045, 0.0075);

  // Adjust for property size (larger homes often have lower ratio)
  let sizeAdjustment = 1.0;
  if (property.beds >= 4) {
    sizeAdjustment = seededRandom(seed + 11, 0.90, 0.95);
  } else if (property.beds <= 2) {
    sizeAdjustment = seededRandom(seed + 12, 1.05, 1.15);
  }

  const baseRent = purchasePrice * rentRatioBase * sizeAdjustment;

  // Round to nearest $50
  return Math.round(baseRent / 50) * 50;
};

/**
 * Calculate realistic Airbnb nightly rate
 */
const calculateAirbnbRate = (monthlyRent: number, property: Property, seed: number): number => {
  // Airbnb typically commands 2.5x - 3.5x monthly rent if annualized at 100% occupancy
  // This translates to roughly 2.3x - 3.2x the daily equivalent of monthly rent
  const dailyRentEquivalent = monthlyRent / 30;
  const airbnbMultiplier = seededRandom(seed + 20, 2.3, 3.2);

  // Adjust for property features (more beds = higher multiplier potential)
  const bedroomBonus = property.beds >= 3 ? seededRandom(seed + 21, 1.05, 1.15) : 1.0;

  const nightlyRate = dailyRentEquivalent * airbnbMultiplier * bedroomBonus;

  // Round to nearest $5
  return Math.round(nightlyRate / 5) * 5;
};

/**
 * Calculate realistic occupancy rate for Airbnb
 */
const calculateOccupancyRate = (seed: number): number => {
  // Realistic occupancy ranges: 55% - 75% for most markets
  return seededRandom(seed + 25, 0.55, 0.75);
};

/**
 * Calculate realistic property tax percentage based on typical US ranges
 */
const calculatePropertyTax = (seed: number): number => {
  // US property tax ranges: 0.3% - 2.5% annually
  // Most common: 0.8% - 1.5%
  return seededRandom(seed + 30, 0.008, 0.015);
};

/**
 * Calculate realistic home insurance
 */
const calculateHomeInsurance = (purchasePrice: number, seed: number): number => {
  // Typical home insurance: $800 - $2500 annually for most homes
  // As percentage of home value: 0.2% - 0.6%
  const baseRate = seededRandom(seed + 35, 0.002, 0.006);

  // More expensive homes often have lower percentage
  let priceAdjustment = 1.0;
  if (purchasePrice > 600000) {
    priceAdjustment = seededRandom(seed + 36, 0.85, 0.95);
  } else if (purchasePrice < 250000) {
    priceAdjustment = seededRandom(seed + 37, 1.05, 1.20);
  }

  return baseRate * priceAdjustment;
};

/**
 * Calculate realistic HOA fees
 */
const calculateHOA = (property: Property, seed: number): number => {
  // 60% chance of having HOA
  const hasHOA = seededRandom(seed + 40, 0, 1) > 0.4;

  if (!hasHOA) {
    return 0;
  }

  // HOA ranges: $50 - $500/month for single family
  // Newer properties tend to have higher HOA
  const propertyAge = 2024 - property.year;
  let hoaRange: [number, number] = [75, 250];

  if (propertyAge < 10) {
    hoaRange = [150, 400];
  } else if (propertyAge < 20) {
    hoaRange = [100, 300];
  } else {
    hoaRange = [50, 200];
  }

  const monthlyHOA = seededRandom(seed + 41, hoaRange[0], hoaRange[1]);

  // Round to nearest $25
  return Math.round(monthlyHOA / 25) * 25;
};

/**
 * Calculate realistic monthly utilities
 */
const calculateUtilities = (property: Property, seed: number): number => {
  // Base utilities: $100 - $150 for 2-bed
  const baseUtilities = seededRandom(seed + 45, 100, 150);

  // Add per bedroom/bathroom
  const bedroomCost = property.beds * seededRandom(seed + 46, 25, 40);
  const bathroomCost = property.baths * seededRandom(seed + 47, 15, 25);

  const totalUtilities = baseUtilities + bedroomCost + bathroomCost;

  // Round to nearest $10
  return Math.round(totalUtilities / 10) * 10;
};

/**
 * Calculate realistic current mortgage interest rate
 */
const calculateInterestRate = (seed: number): number => {
  // Current market rates (2024): 6.5% - 7.5% for 30-year fixed
  const rate = seededRandom(seed + 50, 0.0625, 0.0750);

  // Round to nearest 1/8 point (0.125%)
  return Math.round(rate / 0.00125) * 0.00125;
};

/**
 * Calculate realistic down payment based on property characteristics
 */
const calculateDownPayment = (property: Property, seed: number): number => {
  // First-time buyers: 3-10%
  // Conventional: 10-20%
  // Investor standard: 20-25%
  // Cash buyers: 100%

  // Most common: 15-20% for owner-occupied, 20-25% for investment
  const downPayment = seededRandom(seed + 55, 0.15, 0.25);

  // Round to nearest 5%
  return Math.round(downPayment / 0.05) * 0.05;
};

/**
 * SIMULATES fetching auto-filled data based on property info.
 * In a real app, this would be an API call based on address/zip.
 *
 * This generates realistic, consistent data that varies based on property characteristics.
 */
export const simulatePropertyData = (property: Property): Assumptions => {
  const seed = generateSeed(property);

  // Generate realistic price
  const purchasePrice = calculateRealisticPrice(property, seed);

  // Generate realistic rent
  const monthlyRent = calculateRealisticRent(purchasePrice, property, seed);

  // Equivalent rent should be similar but slightly different
  const equivalentRent = Math.round(monthlyRent * seededRandom(seed + 60, 1.05, 1.15) / 50) * 50;

  // Generate realistic Airbnb metrics
  const avgNightlyRate = calculateAirbnbRate(monthlyRent, property, seed);
  const occupancyRate = calculateOccupancyRate(seed);

  // Generate realistic expenses
  const propertyTaxPercent = calculatePropertyTax(seed);
  const homeInsurancePercent = calculateHomeInsurance(purchasePrice, seed);
  const monthlyHOA = calculateHOA(property, seed);
  const utilitiesMonthly = calculateUtilities(property, seed);

  // Generate realistic loan terms
  const interestRate = calculateInterestRate(seed);
  const downPaymentPercent = calculateDownPayment(property, seed);

  // Realistic closing costs: 2.5% - 4%
  const closingCostsPercent = seededRandom(seed + 65, 0.025, 0.040);

  // Land value: typically 20% - 35% for residential
  const landValuePercent = seededRandom(seed + 70, 0.20, 0.35);

  // Vacancy rate varies by market: 4% - 8%
  const vacancyPercent = seededRandom(seed + 75, 0.04, 0.08);

  // Maintenance: 0.5% - 1.5% of property value annually (as % of rent: varies)
  // For rental income: typically 6% - 12% of gross rent
  const maintenancePercent = seededRandom(seed + 80, 0.06, 0.12);

  // Property management: 8% - 12% of gross rent
  const mgmtFeePercent = seededRandom(seed + 85, 0.08, 0.12);

  // Airbnb/VRBO fees: 3% - 5%
  const airbnbFeePercent = seededRandom(seed + 90, 0.03, 0.05);

  return {
    ...defaultAssumptions,
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTerm: 30, // Standard
    closingCostsPercent,
    landValuePercent,
    monthlyRent,
    vacancyPercent,
    avgNightlyRate,
    occupancyRate,
    airbnbFeePercent,
    equivalentRent,
    propertyTaxPercent,
    homeInsurancePercent,
    monthlyHOA,
    maintenancePercent,
    utilitiesMonthly,
    mgmtFeePercent,
  };
};

/**
 * Generate realistic market comparisons (for future use)
 */
export const generateMarketContext = (property: Property): {
  medianHomePrice: number;
  avgRentInArea: number;
  marketAppreciation: number;
  daysOnMarket: number;
} => {
  const seed = generateSeed(property);

  return {
    medianHomePrice: Math.round(seededRandom(seed + 100, 300000, 600000) / 10000) * 10000,
    avgRentInArea: Math.round(seededRandom(seed + 105, 1500, 3000) / 50) * 50,
    marketAppreciation: seededRandom(seed + 110, 0.02, 0.08), // 2-8% annually
    daysOnMarket: Math.round(seededRandom(seed + 115, 15, 60)),
  };
};
