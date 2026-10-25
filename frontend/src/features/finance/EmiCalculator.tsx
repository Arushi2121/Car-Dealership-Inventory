import { useState } from 'react';
import { formatPrice } from '../../shared/lib/format';
import { DEFAULT_TERMS, monthlyPayment } from './emi';

const TERM_OPTIONS = [24, 36, 48, 60, 72];

const fieldClasses = 'flex items-center justify-between text-sm font-medium text-ink';

export function EmiCalculator({ price }: { price: number }) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULT_TERMS.downPaymentPercent);
  const [annualRatePercent, setAnnualRatePercent] = useState(DEFAULT_TERMS.annualRatePercent);
  const [months, setMonths] = useState(DEFAULT_TERMS.months);

  const payment = monthlyPayment({ price, downPaymentPercent, annualRatePercent, months });

  return (
    <section aria-labelledby="emi-heading" className="space-y-5 rounded-card bg-canvas p-6">
      <div>
        <h3 id="emi-heading" className="text-lg">
          Monthly payment
        </h3>
        <p className="mt-2 font-display text-4xl font-semibold">{formatPrice(payment)}/mo</p>
      </div>

      <label className="block space-y-2">
        <span className={fieldClasses}>
          Down payment <span className="text-muted">{downPaymentPercent}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={50}
          step={5}
          value={downPaymentPercent}
          onChange={(event) => setDownPaymentPercent(Number(event.target.value))}
          className="w-full accent-accent"
        />
      </label>

      <label className="block space-y-2">
        <span className={fieldClasses}>
          APR <span className="text-muted">{annualRatePercent}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={annualRatePercent}
          onChange={(event) => setAnnualRatePercent(Number(event.target.value))}
          className="w-full accent-accent"
        />
      </label>

      <label className="block space-y-2">
        <span className={fieldClasses}>Term</span>
        <select
          value={months}
          onChange={(event) => setMonths(Number(event.target.value))}
          className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-ink"
        >
          {TERM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} months
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-muted">Illustrative estimate, not a finance offer.</p>
    </section>
  );
}
