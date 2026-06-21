// Client-safe types for the step-video wizards (migration 11). No pg here.

export type WizardSlug = 'airport' | 'luggage' | 'makkah-ziyarat' | 'madina-ziyarat';

// A localized text block: locale code ('en' | 'ar' | 'ur' | 'de' | …) → title + body.
export type LocalizedText = Record<string, { t: string; b: string }>;

// Checklist items are either a plain string, or a customs-style rule with a status.
export type WizItem = string | { label: string; status: 'ok' | 'permit' | 'prohibited' };

export interface WizStep {
  short: string; // rail label
  label: string; // small mono caption (the prototype's `sub` / `kind`)
  text: LocalizedText;
  items: WizItem[];
  tip?: string;
  videoUrl?: string; // optional seed video (YouTube/Vimeo/MP4)
}

export interface WizardDef {
  slug: WizardSlug;
  title: string;
  subtitle: string;
  icon: string;
  steps: WizStep[];
}
