# Data Model and TypeScript Schema

Use this structure for Next.js, React, Vue, Laravel API, WordPress custom plugin, Firebase, Supabase, or MySQL-backed apps.

## Core entities

```ts
export type LanguageCode = 'en' | 'ar' | 'ur' | 'fr' | 'tr' | 'id' | 'bn' | 'de' | string;

export interface LocalizedText {
  language: LanguageCode;
  dir: 'ltr' | 'rtl';
  title?: string;
  subtitle?: string;
  explanation: string;
  checklist?: string[];
  duaArabic?: string;
  transliteration?: string;
  meaning?: string;
  audioUrl?: string;
  reviewStatus: 'draft' | 'translated' | 'reviewed' | 'scholar_reviewed' | 'published';
}

export interface UmrahStep {
  id: number;
  slug: string;
  titleKey: string;
  phase: 'before_makkah' | 'makkah' | 'tawaf' | 'sai' | 'completion' | 'optional' | 'madinah';
  isRequired: boolean;
  heroImagePrompt: string;
  icon: string;
  content: LocalizedText[];
  actions: WizardAction[];
  completionRule: CompletionRule;
  audioConfig: AudioConfig;
  recordingConfig: RecordingConfig;
  scholarReviewRequired: boolean;
}

export interface WizardAction {
  id: string;
  labelKey: string;
  type: 'checkbox' | 'counter' | 'button' | 'audio' | 'recording' | 'note' | 'dua';
  required: boolean;
}

export interface CompletionRule {
  mode: 'manual_confirm' | 'all_required_checked' | 'counter_target';
  target?: number;
  confirmationTextKey: string;
}

export interface AudioConfig {
  enabled: boolean;
  playbackSpeeds: number[];
  allowLoop: boolean;
  allowDownloadOffline: boolean;
  transcriptEnabled: boolean;
  verifiedAudioRequired: boolean;
}

export interface RecordingConfig {
  enabled: boolean;
  maxDurationSeconds: number;
  allowedTypes: Array<'reflection' | 'personal_dua' | 'pronunciation_practice'>;
  privacyDefault: 'private';
  allowDelete: boolean;
  allowExport: boolean;
}

export interface PersonalRecording {
  id: string;
  userId: string;
  stepId: number;
  language: LanguageCode;
  type: 'reflection' | 'personal_dua' | 'pronunciation_practice';
  title: string;
  audioUrl: string;
  transcript?: string;
  durationSeconds: number;
  privacy: 'private' | 'family_share';
  createdAt: string;
}

export interface PersonalDua {
  id: string;
  userId: string;
  stepId?: number;
  language: LanguageCode;
  text: string;
  transliteration?: string;
  meaning?: string;
  tags?: string[];
  isPinned: boolean;
  isPrivate: boolean;
  createdAt: string;
}
```

## Suggested database tables

- `umrah_steps`
- `umrah_step_translations`
- `umrah_step_audio`
- `pilgrim_progress`
- `personal_recordings`
- `personal_duas`
- `language_settings`
- `translation_reviews`
- `admin_content_versions`

## Progress logic

- Step 6 and Step 7 can share a Tawaf counter but should save separate progress events.
- Step 9 and Step 10 can share a Sa'i counter but should save separate progress events.
- Always allow manual correction because pilgrims may forget to tap during crowded movement.
- Store progress locally first and sync later for offline reliability.
