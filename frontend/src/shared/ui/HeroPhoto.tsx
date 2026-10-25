import { useState } from 'react';

/** The decorative hero photo over a soft gradient, which shows on its own if the photo fails. */
export function HeroPhoto({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`bg-linear-to-b from-raised to-canvas ${className}`}>
      {!failed && (
        <img
          src="/images/hero.jpg"
          alt=""
          onError={() => setFailed(true)}
          className="size-full object-cover object-[center_55%]"
        />
      )}
    </div>
  );
}
