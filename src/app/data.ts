export function yearlyRepaymentNew(income: number, cpi: number) {
  // Handle invalid inputs
  if (typeof income !== "number" || isNaN(income) || income <= 0) {
    return 0;
  }

  const adjustedIncome = income * (1 + cpi / 100);

  if (adjustedIncome <= 67000) {
    return 0;
  }

  if (adjustedIncome <= 124999) {
    return (adjustedIncome - 67000) * 0.15;
  }

  return 8700 + (adjustedIncome - 125000) * 0.17;
}

export type RepaymentBand = {
  minIncome: number;
  maxIncome: number | null; // null for the highest band
  rate: number; // Percentage as decimal
};

export function yearlyRepaymentOld(income: number, cpi: number) {
  // Handle invalid inputs
  if (typeof income !== "number" || isNaN(income) || income <= 0) {
    return 0;
  }

  const adjustedIncome = income * (1 + cpi / 100);

  // Sort the scheme by minIncome to ensure correct processing
  const sortedScheme = [...fy2024].sort((a, b) => a.minIncome - b.minIncome);

  for (const band of sortedScheme) {
    if (
      adjustedIncome >= band.minIncome &&
      (band.maxIncome === null || adjustedIncome <= band.maxIncome)
    ) {
      return adjustedIncome * band.rate;
    }
  }
  return 0;
}

export const fy2024: RepaymentBand[] = [
  { minIncome: 0, maxIncome: 54434, rate: 0 },
  { minIncome: 54435, maxIncome: 62850, rate: 0.01 },
  { minIncome: 62851, maxIncome: 66620, rate: 0.02 },
  { minIncome: 66621, maxIncome: 70618, rate: 0.025 },
  { minIncome: 70619, maxIncome: 74855, rate: 0.03 },
  { minIncome: 74856, maxIncome: 79346, rate: 0.035 },
  { minIncome: 79347, maxIncome: 84107, rate: 0.04 },
  { minIncome: 84108, maxIncome: 89154, rate: 0.045 },
  { minIncome: 89155, maxIncome: 94503, rate: 0.05 },
  { minIncome: 94504, maxIncome: 100174, rate: 0.055 },
  { minIncome: 100175, maxIncome: 106185, rate: 0.06 },
  { minIncome: 106186, maxIncome: 112556, rate: 0.065 },
  { minIncome: 112557, maxIncome: 119309, rate: 0.07 },
  { minIncome: 119310, maxIncome: 126467, rate: 0.075 },
  { minIncome: 126468, maxIncome: 134056, rate: 0.08 },
  { minIncome: 134057, maxIncome: 142100, rate: 0.085 },
  { minIncome: 142101, maxIncome: 150626, rate: 0.09 },
  { minIncome: 150627, maxIncome: 159663, rate: 0.095 },
  { minIncome: 159664, maxIncome: null, rate: 0.1 },
];

export type RepaymentData = {
  year: number;
  old: number;
  new: number;
};

export function calculateRepaymentData(
  income: number,
  initialLoan: number,
  twentyPercentCut: boolean,
  cpi: number,
): RepaymentData[] {
  // Validate inputs
  if (income <= 0 || initialLoan <= 0) {
    return Array(30)
      .fill(0)
      .map((_, year) => ({ year, old: initialLoan, new: initialLoan }));
  }

  const data = [];
  let remainingLoanOld = initialLoan;
  let remainingLoanNew = initialLoan;

  const oldRepayment = yearlyRepaymentOld(income, cpi);
  const newRepayment = yearlyRepaymentNew(income, cpi);

  // If no repayment is being made, show flat line
  if (oldRepayment === 0 && newRepayment === 0) {
    return Array(30)
      .fill(0)
      .map((_, year) => ({
        year,
        old: initialLoan,
        new: initialLoan,
      }));
  }

  // Calculate until loan is paid off or 30 years reached
  for (
    let year = 0;
    year < 30 && (remainingLoanOld > 0 || remainingLoanNew > 0);
    year++
  ) {
    // Apply 20% cut at start of year 1 if enabled
    if (year === 1 && twentyPercentCut) {
      remainingLoanNew = remainingLoanNew * 0.8;
    }

    data.push({
      year,
      old: Math.max(0, remainingLoanOld),
      new: Math.max(0, remainingLoanNew),
    });

    remainingLoanOld = Math.max(0, remainingLoanOld - oldRepayment);
    remainingLoanNew = Math.max(0, remainingLoanNew - newRepayment);
  }

  // Add final zero if both loans are paid off
  if (remainingLoanOld === 0 && remainingLoanNew === 0) {
    data.push({ year: data.length, old: 0, new: 0 });
  }

  return data;
}
