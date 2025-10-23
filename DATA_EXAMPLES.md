# Realistic Data Generation Examples

This document shows example outputs from the data simulation system to demonstrate how realistic and varied the generated data is.

## Example 1: Modern 3BR Home in Portland, OR

**Input:**
- Address: 1247 Maple Grove Avenue, Portland, OR 97214
- Bedrooms: 3
- Bathrooms: 2
- Year Built: 2006

**Generated Data:**
- Purchase Price: ~$380,000 - $420,000
- Monthly Rent: ~$2,100 - $2,600
- Airbnb Nightly Rate: ~$165 - $225
- Occupancy Rate: ~60% - 70%
- Property Tax: ~1.0% - 1.3%
- HOA: ~$100 - $250/month (if applicable)
- Interest Rate: ~6.5% - 7.3%
- Down Payment: ~18% - 23%

## Example 2: Older 4BR Home

**Input:**
- Address: 456 Oak Street, Austin, TX 78704
- Bedrooms: 4
- Bathrooms: 3
- Year Built: 1978

**Generated Data:**
- Purchase Price: ~$425,000 - $510,000
- Monthly Rent: ~$2,400 - $3,200
- Airbnb Nightly Rate: ~$195 - $280
- Occupancy Rate: ~58% - 72%
- Property Tax: ~0.9% - 1.4%
- HOA: ~$50 - $150/month
- Interest Rate: ~6.4% - 7.4%
- Down Payment: ~17% - 24%

## Example 3: New Construction 2BR Condo

**Input:**
- Address: 789 Modern Lane, Denver, CO 80202
- Bedrooms: 2
- Bathrooms: 2
- Year Built: 2022

**Generated Data:**
- Purchase Price: ~$340,000 - $410,000 (with new construction premium)
- Monthly Rent: ~$1,900 - $2,500
- Airbnb Nightly Rate: ~$150 - $215
- Occupancy Rate: ~61% - 73%
- Property Tax: ~0.85% - 1.35%
- HOA: ~$200 - $350/month (higher for new construction)
- Interest Rate: ~6.6% - 7.2%
- Down Payment: ~16% - 25%

## Example 4: Large Historic Home

**Input:**
- Address: 321 Victorian Street, San Francisco, CA 94102
- Bedrooms: 5
- Bathrooms: 3.5
- Year Built: 1895

**Generated Data:**
- Purchase Price: ~$520,000 - $680,000 (with historic discount)
- Monthly Rent: ~$2,800 - $4,200
- Airbnb Nightly Rate: ~$240 - $380
- Occupancy Rate: ~57% - 71%
- Property Tax: ~0.95% - 1.45%
- HOA: ~$0 - $125/month (lower probability for historic)
- Interest Rate: ~6.5% - 7.4%
- Down Payment: ~19% - 25%

## Key Features of the Data Generation

### 1. Consistency
The same property inputs always generate the same data (seeded randomization), which is perfect for:
- Demo presentations
- Screenshots and marketing materials
- A/B testing
- Reproducible analysis

### 2. Realistic Relationships
All values maintain realistic market relationships:
- Rent correlates with purchase price (0.45%-0.75% rule)
- Airbnb rates are 2.3x-3.2x higher than equivalent daily rent
- Property taxes vary by realistic US market ranges
- Insurance costs scale appropriately with home value
- HOA fees correlate with property age and type

### 3. Age-Based Adjustments
Properties are priced according to realistic age depreciation curves:
- **Brand new (0-5 years)**: Premium pricing (+15% to +25%)
- **Modern (5-15 years)**: Slight premium (+5% to +15%)
- **Established (15-30 years)**: Neutral pricing (±5%)
- **Older (30-50 years)**: Moderate discount (-10% to -20%)
- **Historic (50+ years)**: Significant discount (-20% to -30%)

### 4. Property Size Effects
Larger properties show realistic market patterns:
- Lower rent-to-price ratios (harder to rent at same yield)
- Higher absolute rent values
- Higher Airbnb premiums (more bedrooms = better vacation rental)
- Lower per-square-foot pricing (economies of scale)

### 5. Market Variance
Random variations simulate different locations, conditions, and features:
- Market multiplier: 0.85x - 1.35x (simulates neighborhood quality)
- Occupancy rates: 55% - 75% (simulates market demand)
- Management fees: 8% - 12% (simulates competitive market)
- Maintenance costs: 6% - 12% (simulates property condition)

## Testing Different Scenarios

Try these property combinations to see varied data:

**Affordable starter home:**
- 2 beds, 1.5 baths, built 1985
- Expected price: $220k - $280k

**Mid-market family home:**
- 3 beds, 2 baths, built 2005
- Expected price: $350k - $450k

**Luxury investment:**
- 4 beds, 3.5 baths, built 2018
- Expected price: $550k - $720k

**Vacation rental special:**
- 4+ beds, 3+ baths, any age
- Higher Airbnb multipliers apply

## Data Validation

All generated values fall within realistic market ranges:
- ✅ Prices rounded to nearest $5,000
- ✅ Rents rounded to nearest $50
- ✅ Airbnb rates rounded to nearest $5
- ✅ Interest rates in 1/8 point increments (0.125%)
- ✅ Down payments in 5% increments
- ✅ HOA fees in $25 increments
- ✅ Utilities in $10 increments

## Future Enhancements

When real API data is integrated, this simulation system can serve as:
- **Fallback data** when API is unavailable
- **Testing data** for development and QA
- **Comparison data** to validate API responses
- **Demo mode** for presentations without API calls
