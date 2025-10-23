# OptimalHouse Architecture

## Component Hierarchy

```
App (Landing.tsx)
│
├── HomePage (when no property selected)
│   ├── ThemeToggle
│   └── InputGroup (x4)
│       └── HTML inputs
│
└── PropertyPage (when property selected)
    ├── Header
    │   ├── Back Button
    │   ├── Property Info Display
    │   ├── "Tweak Assumptions" Button
    │   └── ThemeToggle
    │
    ├── ProformaTabs
    │   ├── Tab Navigation (Rental/Airbnb/Owner)
    │   └── ProformaDisplay
    │       ├── StatCard (x4) - Key metrics
    │       ├── SectionTitle
    │       ├── LineItem (x5) - Main proforma
    │       └── DrillDown (x2-3) - Detailed breakdowns
    │           └── LineItem (x multiple)
    │
    └── AssumptionModal (when "Tweak Assumptions" clicked)
        └── AssumptionEditor
            ├── SectionTitle (x4)
            ├── SliderInput (x multiple)
            └── InputGroup (x multiple)
```

## Data Flow

```
User Input (HomePage)
    ↓
simulatePropertyData() → initialAssumptions
    ↓
PropertyPage state
    ├── assumptions
    ├── personal
    └── scenario
        ↓
useMemo → calculateProforma()
    ↓
ProformaDisplay renders results
```

## State Management

### App-Level State (Landing.tsx)
- `property: Property | null` - Current property being analyzed
- `isDarkMode: boolean` - Theme state
- `initialAssumptions: Assumptions` - Simulated property data

### PropertyPage State
- `assumptions: Assumptions` - User-editable financial assumptions
- `personal: PersonalInfo` - User-editable personal tax info
- `scenario: Scenario` - Current view ('rental' | 'airbnb' | 'owner')
- `showAssumptions: boolean` - Modal visibility

### Computed State
- `proforma: Proforma` - Calculated via `useMemo` from assumptions + personal + scenario

## Key Design Patterns

### 1. Separation of Concerns
- **UI Components** (`/components`) - Pure presentation, receive data via props
- **Business Logic** (`/utils/calculations.ts`) - Pure functions, no UI dependencies
- **Type Definitions** (`/types`) - Shared across entire app
- **Default Values** (`/utils/defaults.ts`) - Configuration & data simulation

### 2. Component Composition
Small, focused components composed together:
```tsx
<PropertyPage>
  <ProformaTabs>
    <ProformaDisplay>
      <StatCard />
      <DrillDown>
        <LineItem />
      </DrillDown>
    </ProformaDisplay>
  </ProformaTabs>
</PropertyPage>
```

### 3. Prop Drilling with TypeScript
Type-safe prop passing through component tree:
```tsx
interface ProformaDisplayProps {
  proforma: Proforma;
  scenario: Scenario;
  personal: PersonalInfo;
}
```

### 4. Memoization for Performance
Heavy calculations memoized to prevent unnecessary re-renders:
```tsx
const proforma = useMemo(() => {
  return calculateProforma(assumptions, personal, scenario);
}, [assumptions, personal, scenario]);
```

### 5. Controlled Components
All inputs are controlled via React state:
```tsx
<input
  value={beds}
  onChange={(e) => setBeds(Number(e.target.value))}
/>
```

## Type System

### Type Hierarchy
```
Property
  └── Used to simulate → Assumptions

Assumptions + PersonalInfo + Scenario
  └── calculateProforma() → Proforma
      ├── RentalProforma (for 'rental' | 'airbnb')
      └── OwnerProforma (for 'owner')
```

### Type Guards
TypeScript discriminated unions used for scenario-specific data:
```tsx
if (scenario === 'rental' || scenario === 'airbnb') {
  const rentalProforma = proforma as RentalProforma;
  // Access rental-specific fields
}
```

## Calculation Engine

### Core Function: `calculateProforma()`

**Input:**
- `assumptions: Assumptions` - All financial parameters
- `personal: PersonalInfo` - Tax rates, opportunity cost
- `scenario: Scenario` - Which analysis to run

**Output:**
- `Proforma` - Complete financial analysis

**Process:**
1. Calculate mortgage (principal, interest, payment)
2. Calculate operating expenses (tax, insurance, HOA, etc.)
3. Branch by scenario:
   - **Rental/Airbnb**: Income → OpEx → NOI → Tax → Cash Flow
   - **Owner**: Avoided Rent → Housing Cost → Tax Savings → Net Benefit
4. Return typed proforma object

### Tax Modeling

**Rental Properties:**
```
Effective Gross Income
- Operating Expenses
- Mortgage Interest
- Depreciation
= Taxable Income

Tax Benefit = (Taxable Income) × (Tax Rate)
```

**Owner-Occupied:**
```
Deductible Mortgage Interest
+ Deductible Property Tax (capped at $10k)
= Total Deductions

Tax Savings = (Total Deductions) × (Tax Rate)
```

## UI Architecture

### Theme System
- Class-based dark mode: `className={isDarkMode ? 'dark' : ''}`
- Tailwind dark variants: `dark:bg-gray-900`
- Toggle persists in component state (could be localStorage in future)

### Form System
- Custom CSS classes injected via `globals.ts`
- Consistent styling across all inputs
- Slider + numeric input synchronization
- Percentage handling (display as %, store as decimal)

### Modal System
- Click-outside to close
- Stop propagation on modal content
- Scrollable content area with fixed header
- Responsive max-width

## Future Architecture Considerations

### API Integration
When adding real property data:
```tsx
// Replace simulatePropertyData with:
const fetchPropertyData = async (address: string): Promise<Assumptions> => {
  const response = await fetch(`/api/property?address=${address}`);
  return response.json();
};
```

### State Management
For more complex state, consider:
- **Zustand** - Lightweight global state
- **React Query** - Server state management
- **Context API** - Avoid prop drilling

### Multi-Property Comparison
Potential structure:
```tsx
interface AnalysisSession {
  properties: Array<{
    property: Property;
    assumptions: Assumptions;
    proforma: Proforma;
  }>;
  selectedPropertyId: string;
}
```

### Export Functionality
Add export utilities:
```tsx
// /utils/export.ts
export const exportToPDF = (proforma: Proforma) => { ... }
export const exportToExcel = (proforma: Proforma) => { ... }
```

## Performance Optimizations

### Current
- `useMemo` for expensive calculations
- Component splitting reduces bundle size
- Lazy loading potential for tabs

### Future
- React.lazy() for code splitting
- Virtual scrolling for long lists
- Debounced input for real-time calculations
- Web Workers for heavy calculations

## Testing Strategy (Future)

### Unit Tests
- `/utils/calculations.ts` - Pure function testing
- `/utils/defaults.ts` - Data generation testing

### Component Tests
- UI components with React Testing Library
- User interaction flows

### Integration Tests
- Full user journeys (input → calculate → display)
- Scenario switching
- Assumption editing

### E2E Tests
- Cypress or Playwright
- Critical user paths
