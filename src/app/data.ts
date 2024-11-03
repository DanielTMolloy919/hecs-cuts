export type RepaymentBand = {
  minIncome: number;
  maxIncome: number | null; // null for the highest band
  rate: number; // Percentage as decimal
};

export type RepaymentScheme = RepaymentBand[];

export function calculateRepayment(income: number, scheme: RepaymentScheme) {
  for (const band of scheme) {
    if (
      income >= band.minIncome &&
      (band.maxIncome === null || income <= band.maxIncome)
    ) {
      return income * band.rate;
    }
  }
  return 0;
}

export const fy2024: RepaymentScheme = [
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
