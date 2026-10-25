export type LoanTerms = {
  downPaymentPercent: number;
  annualRatePercent: number;
  months: number;
};

/** Illustrative only: shown on every card, and the calculator's starting point. */
export const DEFAULT_TERMS: LoanTerms = {
  downPaymentPercent: 10,
  annualRatePercent: 7.5,
  months: 60,
};

/** Monthly payment in cents, rounded to the nearest cent, from standard amortization. */
export function monthlyPayment({
  price,
  downPaymentPercent,
  annualRatePercent,
  months,
}: LoanTerms & { price: number }): number {
  const financed = price * (1 - downPaymentPercent / 100);
  if (financed <= 0) return 0;

  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return Math.round(financed / months);
  return Math.round((financed * monthlyRate) / (1 - (1 + monthlyRate) ** -months));
}
