import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { Scenario, Proforma, RentalProforma, OwnerProforma, PersonalInfo } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { StatCard } from './ui/StatCard';
import { SectionTitle } from './ui/SectionTitle';
import { DrillDown } from './ui/DrillDown';
import { LineItem } from './ui/LineItem';

interface ProformaDisplayProps {
  proforma: Proforma;
  scenario: Scenario;
  personal: PersonalInfo;
}

/**
 * The main display for the proforma income statement.
 */
export function ProformaDisplay({ proforma, scenario, personal }: ProformaDisplayProps) {
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
