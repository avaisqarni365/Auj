// Packing list engine (migration 07). Pure + unit-tested. Quantities scale with stay length;
// profile gates which items appear (Diabetic adds health supplies).
export type PackingProfile = 'Men' | 'Women' | 'Kids' | 'Family' | 'Diabetic';
export const PACKING_PROFILES: PackingProfile[] = ['Men', 'Women', 'Kids', 'Family', 'Diabetic'];
export const PACKING_DAYS = [11, 21, 30] as const;

export interface Def {
  id: string;
  label: string;
  per?: number; // days-per-unit → qty = ceil(days / per)
  profiles?: PackingProfile[]; // restrict to these profiles
}
export interface SectionDef {
  title: string;
  items: Def[];
}

const SECTIONS: SectionDef[] = [
  {
    title: 'Ihram & clothing',
    items: [
      { id: 'ihram', label: 'Ihram garments (2 sets)', profiles: ['Men', 'Family', 'Diabetic'] },
      { id: 'abaya', label: 'Modest dress / abaya', per: 7, profiles: ['Women', 'Family', 'Diabetic'] },
      { id: 'kids', label: "Children's outfits", per: 2, profiles: ['Kids', 'Family'] },
      { id: 'tops', label: 'Tops / shirts', per: 3 },
      { id: 'underwear', label: 'Underwear', per: 1 },
      { id: 'socks', label: 'Socks', per: 2 },
      { id: 'prayer', label: 'Prayer mat & cap / scarf' },
      { id: 'sandals', label: 'Comfortable sandals' },
    ],
  },
  {
    title: 'Toiletries (unscented in Ihram)',
    items: [
      { id: 'soap', label: 'Unscented soap & shampoo' },
      { id: 'toothbrush', label: 'Toothbrush & paste' },
      { id: 'towel', label: 'Quick-dry towel' },
      { id: 'nailclip', label: 'Nail clippers (use before Ihram)' },
    ],
  },
  {
    title: 'Documents',
    items: [
      { id: 'passport', label: 'Passport + visa printout' },
      { id: 'tickets', label: 'Flight tickets / boarding passes' },
      { id: 'idcopies', label: 'ID & passport photocopies' },
      { id: 'vax', label: 'Vaccination certificate' },
      { id: 'insurance', label: 'Insurance documents' },
    ],
  },
  {
    title: 'Health',
    items: [
      { id: 'meds', label: 'Personal medication' },
      { id: 'masks', label: 'Face masks', per: 5 },
      { id: 'sanitizer', label: 'Hand sanitizer' },
      { id: 'plasters', label: 'Plasters / blister care' },
      { id: 'glucometer', label: 'Glucose meter + lancets', profiles: ['Diabetic'] },
      { id: 'insulin', label: 'Insulin + cool pouch', profiles: ['Diabetic'] },
      { id: 'strips', label: 'Extra test strips', per: 7, profiles: ['Diabetic'] },
      { id: 'glucotabs', label: 'Glucose tablets / snacks', profiles: ['Diabetic'] },
    ],
  },
  {
    title: 'Essentials',
    items: [
      { id: 'bag', label: 'Day bag / backpack' },
      { id: 'bottle', label: 'Refillable water bottle' },
      { id: 'powerbank', label: 'Power bank + travel adapter' },
      { id: 'sim', label: 'Saudi SIM / eSIM' },
      { id: 'sun', label: 'Umbrella / sun protection' },
    ],
  },
];

// The shared default template seed. DB-backed + admin-editable; this is the fallback.
export const PACKING_TEMPLATE_SEED: SectionDef[] = SECTIONS;

export interface PackItem {
  id: string;
  label: string;
  qty?: number;
}
export interface PackSection {
  title: string;
  items: PackItem[];
}

export function buildFrom(sections: SectionDef[], profile: PackingProfile, days: number): PackSection[] {
  const d = Math.max(1, Math.trunc(days) || 1);
  return sections.map((s) => ({
    title: s.title,
    items: s.items
      .filter((it) => !it.profiles || it.profiles.includes(profile))
      .map((it) => ({ id: it.id, label: it.label, qty: it.per ? Math.max(1, Math.ceil(d / it.per)) : undefined })),
  })).filter((s) => s.items.length > 0);
}

export function build(profile: PackingProfile, days: number): PackSection[] {
  return buildFrom(PACKING_TEMPLATE_SEED, profile, days);
}

export function totalItems(sections: PackSection[]): number {
  return sections.reduce((n, s) => n + s.items.length, 0);
}
