import { useState } from 'react';
import { bodyStyleNames, type Category } from '../lib/categories';

export type { Category };

type CarImageProps = {
  make: string;
  model: string;
  category: Category;
  imageUrl?: string;
  className?: string;
};

/** A car photo: its own image, else its body-style photo, else a labelled placeholder. */
export function CarImage({ make, model, category, imageUrl, className = '' }: CarImageProps) {
  const [failed, setFailed] = useState(false);
  const bodyStyle = bodyStyleNames[category];

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${bodyStyle} photo unavailable`}
        className={`flex items-center justify-center bg-linear-to-b from-raised to-canvas ${className}`}
      >
        <span className="font-display text-2xl font-semibold text-muted">{bodyStyle}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl ?? `/images/${category.toLowerCase()}.jpg`}
      alt={`${make} ${model}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
