---
name: umrah-wizard-builder
description: build and improve multilingual Umrah wizard website screens, step-by-step pilgrimage UI flows, sacred-place guide pages, image prompt packs, audio/listening features, pilgrim voice recording, personal dua management, language switching, and localized content for English, Arabic, Urdu, French, Turkish, Indonesian, Bengali, German, and other requested languages. Use when designing, writing, generating, auditing, or coding Umrah/Hajj-style guide screens, mobile/web onboarding wizards, religious travel checklists, or pilgrim companion features.
---

# Umrah Wizard Builder

Use this skill to create complete product-ready specifications, screen content, prompts, and implementation guidance for a multilingual Umrah wizard website or app.

## Core behavior

When the user asks for Umrah wizard screens, produce outputs that are:

- Respectful, simple, and suitable for first-time pilgrims.
- Structured as app or website screens with step title, explanation, checklist, action button, audio controls, recording controls, and language support.
- Multilingual by design. Default languages: English, Arabic, Urdu, French, Turkish, Indonesian, Bengali, and German. Add or remove languages when the user asks.
- Clear that religious text should be reviewed by a qualified scholar before publication.
- Practical for developers using React, Next.js, Vue, Laravel, WordPress, or no-code builders.

Do not issue religious rulings beyond the included general guidance. If a detail varies by madhhab, local scholar, or authority, mark it as `scholar review required` or `configuration option`.

## Default 15-screen Umrah wizard flow

Use this canonical flow unless the user provides another sequence:

1. Niyyah overview / intention preparation
2. Ihram preparation / state of purity
3. Niyyah at Miqat for Umrah
4. Talbiyah recitation
5. Enter Masjid al-Haram
6. Start Tawaf / begin 7 circles
7. Complete 7 rounds of Tawaf
8. Pray 2 Rak'ahs after Tawaf
9. Go to Safa and start Sa'i
10. Complete Sa'i between Safa and Marwah
11. Trim or shave hair
12. Umrah complete / exit Ihram
13. Optional acts and recommended deeds
14. Final du'a and departure from Makkah
15. Visit Madinah and important places

If the user wants a different number of steps, preserve the same product pattern and renumber consistently.

## Required screen structure

For each screen, include:

- `stepNumber`
- `slug`
- `title`
- `subtitle`
- `heroImagePrompt`
- `shortExplanation`
- `whatToDo` checklist
- `duaOrRecitation` when applicable
- `audioFeature` with listen, pause, repeat, slow playback, and offline cache notes
- `personalRecordingFeature` allowing the pilgrim to record reflections, personal duas, or pronunciation practice
- `languageFeature` with supported languages and RTL support for Arabic/Urdu
- `primaryButton`
- `secondaryButton`
- `validationRule` for wizard completion
- `scholarReviewNotes` for sensitive religious content

Prefer JSON-like or TypeScript-ready structures when the user asks for development files. Prefer plain product copy when the user asks for website content.

## Feature requirements

### Listening feature

Include a listening panel on every step:

- Play step explanation in selected language.
- Play dua/recitation when present.
- Provide slow speed for learning pronunciation.
- Provide replay and loop buttons.
- Cache audio for offline use during travel.
- Allow admin to upload verified audio per language.
- Display transcript while audio plays.

### Personal recording feature

Include a personal recording area on every step:

- Record personal reflection or dua in the pilgrim's own language.
- Record pronunciation practice for Talbiyah and duas.
- Let user name the recording.
- Let user choose private only, family-share, or delete.
- Store metadata: step id, language, duration, created date, and optional tags.
- Never publish or share recordings by default.

### Language management

Design a language manager with:

- Global language selector.
- Per-step fallback language.
- RTL layout for Arabic and Urdu.
- Translation status: draft, reviewed, scholar reviewed, published.
- Admin editor for each language.
- Separate fields for Arabic text, transliteration, and meaning.
- Warning when a translation is missing or unreviewed.

### Personal dua customization

Allow the pilgrim to:

- Save personal duas for each step.
- Choose their own language.
- Add transliteration and meaning.
- Mark duas as private.
- Pin favorite duas.
- Add family names or personal notes.
- Export personal dua list after Umrah.

## Output modes

Select the mode based on the user's request.

### Product specification mode

Use when the user asks for features, screens, requirements, or wizard development planning. Include:

- Feature summary
- Information architecture
- Screen list
- Data model
- Admin panel requirements
- Accessibility and offline notes
- QA checklist

### Screen content mode

Use when the user asks for individual screens. Include one screen with:

- UI copy
- checklists
- multilingual text
- image prompt
- audio script
- recording prompt
- developer notes

### Code scaffold mode

Use when the user asks for code. Provide:

- Recommended stack
- TypeScript interfaces
- sample JSON data
- component structure
- i18n approach
- audio and recording API guidance

### Image prompt mode

Use when the user asks to generate or brief images. Provide:

- One consistent visual style prompt
- Per-step hero prompt
- UI layout prompt
- Negative prompt for avoiding errors
- Text overlay guidance: keep real text minimal and add final text in design/code after generation

## Safety and quality rules

- Do not invent exact religious obligations when unsure.
- Mark hadith references and Arabic duas for review.
- Avoid showing the Prophet Muhammad or companions as figures.
- Avoid disrespectful, cartoonish, or sensational imagery.
- For Arabic/Urdu, prefer storing text as Unicode and set `dir="rtl"`.
- Mention that final religious content should be verified by qualified Islamic scholars before public launch.

## References

Load these only when useful:

- `references/step-content.md` for the complete 15-step content pack.
- `references/data-model.md` for database and TypeScript schema.
- `references/ui-features.md` for audio, recording, language, admin, and accessibility features.
- `references/image-prompts.md` for consistent artistic screen/image prompts.

## Helper script

Use `scripts/generate_step_json.py` when the user wants starter JSON files for all 15 screens. Run it and adapt the generated output to the requested stack or languages.
