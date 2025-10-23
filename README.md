# OptimalHouse

A real estate investment analysis tool that helps you compare different property strategies: Long-Term Rental (LTR), Short-Term Rental (Airbnb), and Owner-Occupied scenarios.

## Features

- **Multi-Scenario Analysis**: Compare rental income, Airbnb income, and owner-occupied costs side-by-side
- **Comprehensive Financial Modeling**:
  - Cap Rate & Cash-on-Cash ROI calculations
  - Tax benefit analysis with depreciation
  - Opportunity cost modeling
  - Monthly cash flow projections
- **Interactive Assumptions**: Adjust all financial parameters with real-time recalculation
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deployment

Push a new branch to the repository and it will be automatically deployed.

## Project Structure

```
src/
├── Landing.tsx                         # Main app component & routing logic
├── App.tsx                             # App entry point
├── types/
│   └── index.ts                        # TypeScript type definitions
│       ├── Property                    # Property details (address, beds, baths, year)
│       ├── Assumptions                 # All financial assumptions
│       ├── PersonalInfo                # Personal tax & investment info
│       ├── Scenario                    # 'rental' | 'airbnb' | 'owner'
│       ├── Proforma types              # RentalProforma, OwnerProforma, etc.
│       └── Component prop types
│
├── utils/
│   ├── calculations.ts                 # Core financial calculation engine
│   │   ├── formatCurrency()            # Currency formatting
│   │   ├── formatPercent()             # Percentage formatting
│   │   ├── calculateMonthlyPI()        # Mortgage payment calculation
│   │   └── calculateProforma()         # Main proforma calculation logic
│   │
│   └── defaults.ts                     # Default values & data simulation
│       ├── defaultAssumptions          # Default financial assumptions
│       ├── defaultPersonal             # Default personal info
│       └── simulatePropertyData()      # Property data simulation (placeholder for API)
│
├── styles/
│   └── globals.ts                      # Global CSS injection for form styles
│
└── components/
    ├── HomePage.tsx                    # Landing page with property input form
    ├── PropertyPage.tsx                # Main analysis page with header & tabs
    ├── AssumptionModal.tsx             # Modal wrapper for assumption editor
    ├── AssumptionEditor.tsx            # Comprehensive financial assumption editor
    ├── ProformaTabs.tsx                # Tab interface for scenario switching
    ├── ProformaDisplay.tsx             # Proforma statement display & breakdowns
    │
    └── ui/                             # Reusable UI components
        ├── InputGroup.tsx              # Labeled input field wrapper
        ├── SliderInput.tsx             # Slider with synchronized numeric input
        ├── StatCard.tsx                # Metric display card (Cap Rate, ROI, etc.)
        ├── SectionTitle.tsx            # Section header with icon
        ├── DrillDown.tsx               # Collapsible breakdown section
        ├── LineItem.tsx                # Proforma line item (label + value)
        └── ThemeToggle.tsx             # Light/dark mode toggle button
```

## How It Works

### 1. Property Input
Users enter basic property details (address, bedrooms, bathrooms, year built) on the home page. The app generates realistic market data based on these inputs using a sophisticated simulation system.

#### Realistic Data Simulation
The app uses **seeded randomization** to generate consistent, realistic property data:

- **Property Pricing**: Based on realistic market ratios ($80k-$120k per bedroom, $35k-$55k per bathroom) with age-based adjustments
  - New construction (< 5 years): 15-25% premium
  - Modern homes (5-15 years): 5-15% premium
  - Established homes (15-30 years): Neutral to slight discount
  - Older homes (30-50+ years): 10-30% discount

- **Rental Income**: Uses realistic rent-to-price ratios (0.45%-0.75% monthly), adjusted for property size

- **Airbnb Rates**: Calculated at 2.3x-3.2x daily rental equivalent with bedroom premiums

- **Operating Costs**:
  - Property taxes: 0.8%-1.5% annually (typical US range)
  - Home insurance: 0.2%-0.6% of home value
  - HOA fees: $0-$400/month (60% of properties have HOA)
  - Utilities: $100-$350/month based on size

- **Market Interest Rates**: Current 2024 rates (6.25%-7.5%)

- **Down Payments**: 15%-25% (reflecting realistic buyer profiles)

All values are rounded to realistic increments ($5k for prices, $50 for rent, etc.) and remain **consistent** for the same property inputs, making the mockup data perfect for demos and presentations.

### 2. Scenario Selection
Users can switch between three investment scenarios:
- **Long-Term Rental (LTR)**: Traditional rental property
- **Short-Term Rental (Airbnb)**: Vacation rental strategy
- **Owner-Occupied**: Buying to live in vs. renting

### 3. Financial Assumptions
All assumptions are customizable via the "Tweak Assumptions" modal:

#### Personal
- Federal Tax Rate
- State Tax Rate
- Opportunity Cost Rate (expected return if cash invested elsewhere)

#### Purchase & Loan
- Purchase Price
- Down Payment %
- Interest Rate
- Loan Term
- Closing Costs %

#### Income Scenarios
- Monthly Rent (LTR)
- Average Nightly Rate (STR)
- Occupancy Rate (STR)
- Equivalent Rent (Owner-Occupied)

#### Operating Expenses
- Property Tax %
- Home Insurance %
- Monthly HOA
- Monthly Utilities
- Maintenance %
- Vacancy %
- Management Fee %
- STR Platform Fee %
- Land Value % (for depreciation)

### 4. Proforma Analysis

The app calculates a complete Year 1 proforma including:

#### For Rental/Airbnb:
- **Income**: Gross Potential Income → Vacancy Loss → Effective Gross Income
- **Expenses**: Property Tax, Insurance, HOA, Utilities, Maintenance, Management Fees, Mortgage Payment, Opportunity Cost
- **Profit**: Net Cash Flow (Before Tax) → Tax Benefit → Net Cash Flow (After Tax)
- **Metrics**: Cap Rate, Cash-on-Cash ROI, Monthly Cash Flow, Total Cash Needed

#### For Owner-Occupied:
- **Income**: Annual Avoided Rent (savings from not renting)
- **Expenses**: PITI (Principal, Interest, Tax, Insurance), HOA, Utilities, Opportunity Cost
- **Analysis**: Net Monthly Cost, Cost vs. Renting, Tax Savings Breakdown

### 5. Tax Calculations

The app models realistic tax implications:
- **Rental Properties**: Includes depreciation (27.5 year straight-line), mortgage interest deduction, operating expense deductions
- **Owner-Occupied**: Models itemized deductions with property tax cap ($10k), mortgage interest deduction
- **Tax Benefit**: Calculates actual tax savings or owed based on combined federal + state rates

### 6. Interactive Drill-Downs

Users can expand detailed breakdowns:
- Income Breakdown
- Expense Breakdown
- Tax Calculation Breakdown
- Housing Cost Breakdown (Owner)
- Tax Savings Breakdown (Owner)

## Key Calculations

### Monthly Principal & Interest (P&I)
```
monthlyPayment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
where:
  P = loan amount
  r = monthly interest rate
  n = total number of payments
```

### Cap Rate
```
capRate = Net Operating Income / Purchase Price
```

### Cash-on-Cash Return
```
cashOnCashReturn = Net Cash Flow (After Tax) / Total Cash Needed
```

### Opportunity Cost
```
opportunityCost = Total Cash Needed * Opportunity Cost Rate
```

## Type Safety

The entire application is fully typed with TypeScript, providing:
- Compile-time error checking
- IntelliSense support in IDEs
- Self-documenting code
- Safer refactoring

All types are centralized in `src/types/index.ts` for easy reference and maintenance.

## Styling

The app uses **Tailwind CSS** for styling with:
- Responsive design breakpoints
- Dark mode support via class-based theming
- Custom form input styles (injected via `globals.ts`)
- Consistent spacing and color system

## Future Enhancements

- [ ] Real property data API integration (Zillow, Redfin, etc.)
- [ ] Multi-year projections with appreciation modeling
- [ ] Refinancing scenarios
- [ ] Property comparison (analyze multiple properties side-by-side)
- [ ] Export to PDF/Excel
- [ ] Save/load property analyses
- [ ] Advanced tax scenarios (1031 exchanges, depreciation recapture)
- [ ] Local market data integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
