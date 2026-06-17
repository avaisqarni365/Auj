import { sceneAlt, sceneSrc, type SceneName } from '../scenes';

export interface SceneProps {
  name: SceneName;
  /** Overrides the manifest alt; pass "" for decorative scenes layered under text. */
  alt?: string;
  className?: string;
  /** Eager-load above-the-fold scenes (the hero); everything else stays lazy. */
  priority?: boolean;
}

/**
 * Renders a scene image from the manifest. Server-safe (plain <img>, no client JS). The
 * committed SVGs always resolve, so there is no broken-image state; any gradient on the
 * parent simply shows through while/if the asset is unavailable. Swap to photography via
 * the scenes manifest — see scenes.ts.
 */
export function Scene({ name, alt, className, priority }: SceneProps) {
  return (
    <img
      src={sceneSrc(name)}
      alt={alt ?? sceneAlt(name)}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );
}
