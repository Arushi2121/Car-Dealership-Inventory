import { Link } from 'react-router';
import { bodyStyleNames, categories } from '../../shared/lib/categories';
import { Badge, buttonClasses, CarImage, HeroPhoto } from '../../shared/ui';
import { useAuth } from '../auth';

const ratings = [
  { tone: 'great', label: 'Great price', line: 'At least 10% below similar cars.' },
  { tone: 'fair', label: 'Fair price', line: 'Within 10% of similar cars.' },
  { tone: 'above', label: 'Above market', line: 'At least 10% above similar cars.' },
] as const;

/** Public marketing page. Static content only: it makes no API calls. */
export function LandingPage() {
  const { user } = useAuth();

  return (
    <>
      {/* Text sits above and below the photo, never on it, so it stays readable at every width. */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-4xl px-6 pt-28 text-center motion-safe:animate-rise-in md:pt-36">
          <p className="text-sm font-medium text-ink/70">Marque · Curated cars, fairly priced</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink md:text-7xl">
            Cars worth the drive.
          </h1>
        </div>

        <div className="relative mt-8 aspect-4/3 w-full overflow-hidden motion-safe:animate-fade-in md:aspect-21/9">
          <HeroPhoto className="absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-canvas to-canvas/0"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/5 bg-linear-to-b from-canvas/0 to-canvas"
          />
        </div>

        <div className="mx-auto max-w-2xl px-6 pb-20 text-center">
          <p className="text-lg text-muted md:text-xl">
            Every car rated against its market, so you know a good deal when you see one.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/showroom" className={buttonClasses('primary', 'lg')}>
              Browse the showroom
            </Link>
            <a href="#deals" className={buttonClasses('ghost', 'lg')}>
              How we rate deals
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl md:text-4xl">Browse by body style</h2>
        <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <li key={category} className="w-64 shrink-0 snap-start">
              <Link
                to={`/showroom?category=${category}`}
                className="group block overflow-hidden rounded-card border border-line bg-surface motion-safe:animate-fade-in"
              >
                <CarImage
                  make={bodyStyleNames[category]}
                  model="body style"
                  category={category}
                  className="aspect-4/3 w-full transition-transform duration-300 group-hover:scale-105"
                />
                <span className="flex items-center justify-between p-5">
                  <span className="font-display text-lg font-semibold">
                    {bodyStyleNames[category]}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-muted transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="deals" className="scroll-mt-20 bg-night text-night-fg">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="max-w-2xl text-4xl md:text-5xl">Every car, rated against its market.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {ratings.map((rating) => (
              <div key={rating.tone} className="space-y-3 border-t border-night-fg/15 pt-6">
                <Badge tone={rating.tone}>{rating.label}</Badge>
                <p className="text-lg">{rating.line}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 max-w-2xl text-sm text-night-fg/60">
            Ratings compare each car with the median price of its body style in our inventory.
            Categories need at least 3 cars to be rated.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-28 text-center">
        <p className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
          Find yours.
        </p>
        <Link
          to="/showroom"
          aria-label="Find yours: browse the showroom"
          className={`mt-8 ${buttonClasses('primary', 'lg')}`}
        >
          Browse the showroom
        </Link>
        {!user && (
          <p className="mt-6 text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-ink underline underline-offset-4">
              Sign in
            </Link>
          </p>
        )}
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <span className="font-display text-xl font-semibold">Marque</span>
          <p className="text-sm text-muted">
            A demo dealership built for a coding kata. Vehicle data is sample data.
          </p>
          <a
            href="/images/CREDITS.md"
            className="text-sm font-medium text-ink underline underline-offset-4"
          >
            Photo credits
          </a>
        </div>
      </footer>
    </>
  );
}
