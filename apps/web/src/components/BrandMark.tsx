// The AUJ logo as the real brand image file (same asset as the site header), for use inside
// frame header chips. Replaces the inline @auj/ui <Logo> mark so every frame shows the actual logo.
export function BrandMark({ height = 20, className = '' }: { height?: number; className?: string }) {
  return (
    <img
      src="/img/brand/auj-logo-simple.webp"
      alt="AUJ"
      width={Math.round(height * 1.6)}
      height={height}
      style={{ height, width: 'auto' }}
      className={`block object-contain ${className}`}
    />
  );
}
