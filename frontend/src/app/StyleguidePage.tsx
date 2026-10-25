import { formatPrice } from '../shared/lib/format';
import { Badge, Button, Card, CarImage, type Category } from '../shared/ui';

// Class names are written out in full so Tailwind can find them.
const swatches = [
  { name: 'canvas', className: 'bg-canvas' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'raised', className: 'bg-raised' },
  { name: 'line', className: 'bg-line' },
  { name: 'ink', className: 'bg-ink' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'accent-fg', className: 'bg-accent-fg' },
  { name: 'night', className: 'bg-night' },
  { name: 'night-fg', className: 'bg-night-fg' },
  { name: 'great', className: 'bg-great' },
  { name: 'above', className: 'bg-above' },
  { name: 'danger', className: 'bg-danger' },
];

const sampleCars: { category: Category; make: string; model: string; price: number }[] = [
  { category: 'SEDAN', make: 'Toyota', model: 'Camry', price: 2849900 },
  { category: 'SUV', make: 'Honda', model: 'CR-V', price: 3299900 },
  { category: 'HATCHBACK', make: 'Volkswagen', model: 'Golf', price: 2450000 },
  { category: 'COUPE', make: 'BMW', model: '4 Series', price: 5100000 },
  { category: 'CONVERTIBLE', make: 'Mazda', model: 'MX-5', price: 3150000 },
  { category: 'PICKUP', make: 'Ford', model: 'F-150', price: 4299900 },
  { category: 'VAN', make: 'Mercedes-Benz', model: 'Sprinter', price: 5490000 },
];

const variants = ['primary', 'dark', 'ghost'] as const;
const tones = ['great', 'fair', 'above', 'neutral'] as const;

/** Dev-only page for checking tokens and primitives by eye. */
export function StyleguidePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
      <h1 className="text-5xl">Style guide</h1>

      <section className="space-y-4">
        <h2 className="text-2xl">Colours</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map((swatch) => (
            <div key={swatch.name} className="space-y-2">
              <div className={`h-16 rounded-card border border-line ${swatch.className}`} />
              <p className="text-sm text-muted">{swatch.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Type</h2>
        <p className="font-display text-7xl font-semibold">Display 72</p>
        <p className="font-display text-5xl font-semibold">Display 48</p>
        <p className="font-display text-3xl font-semibold">Display 30</p>
        <p className="text-base">Body 16: Cars worth the drive.</p>
        <p className="text-sm text-muted">Body 14: Cars worth the drive.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Buttons</h2>
        {variants.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-4">
            <Button variant={variant}>{variant}</Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
            <Button variant={variant} loading>
              Loading
            </Button>
            <Button variant={variant} size="lg">
              Large
            </Button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Badges</h2>
        <div className="flex flex-wrap gap-3">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Cards</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleCars.map((car) => (
            <Card key={car.category}>
              <CarImage
                make={car.make}
                model={car.model}
                category={car.category}
                className="aspect-4/3 w-full"
              />
              <div className="space-y-1 p-5">
                <h3 className="text-xl">
                  {car.make} {car.model}
                </h3>
                <p className="text-muted">{formatPrice(car.price)}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
