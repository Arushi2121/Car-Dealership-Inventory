import { monthlyPayment } from '../emi';

/** Standard amortization: P * r / (1 - (1 + r)^-n), with r the monthly rate. */
function amortizedPayment(principal: number, annualRatePercent: number, months: number): number {
  const monthlyRate = annualRatePercent / 100 / 12;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

describe('monthlyPayment', () => {
  it('amortizes the financed amount at the annual rate, in cents', () => {
    const expected = amortizedPayment(2500000 * 0.9, 7.5, 60);

    const payment = monthlyPayment({
      price: 2500000,
      downPaymentPercent: 10,
      annualRatePercent: 7.5,
      months: 60,
    });

    expect(Number.isInteger(payment)).toBe(true);
    expect(Math.abs(payment - expected)).toBeLessThanOrEqual(1);
  });

  it('splits the financed amount evenly at a 0% rate', () => {
    expect(
      monthlyPayment({ price: 1200000, downPaymentPercent: 0, annualRatePercent: 0, months: 12 }),
    ).toBe(100000);
  });

  it('is 0 with 100% down', () => {
    expect(
      monthlyPayment({
        price: 2500000,
        downPaymentPercent: 100,
        annualRatePercent: 7.5,
        months: 60,
      }),
    ).toBe(0);
  });
});
