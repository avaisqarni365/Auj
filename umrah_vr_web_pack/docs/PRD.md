# PRD: Umrah Virtual Trip and Wizard

## Goal
Create a website-integrated virtual Umrah experience that teaches pilgrims the full journey step by step using visual screens, 360 scenes, audio guidance, multilingual explanations, and personal dua/voice recording. Keep AI usage minimal to control cost.

## Target Users
- First-time Umrah pilgrims
- Families preparing together
- Travel agency customers
- Mosque or Islamic school learners
- Elderly pilgrims who need simple audio guidance

## MVP Scope
1. 15-step Umrah wizard.
2. Each step has image/360 scene, explanation, audio play button, language selector, checklist button, and personal note/dua area.
3. Pilgrim can record a personal voice note or dua for each step.
4. Admin can manage content in JSON or database.
5. Optional 360 mode for major locations: Miqat, Masjid al-Haram entry, Kaaba/Tawaf, Maqam Ibrahim, Zamzam, Safa, Marwa, haircut/completion, Madinah visit.
6. No real-time AI required in MVP.

## Out of MVP
- Highly realistic multiplayer VR.
- Live crowd simulation.
- AI voice agent always running.
- Religious fatwa engine.
- Automated location guidance inside Haram.

## Success Metrics
- User completes all 15 steps.
- User listens to at least 70% of audio guidance.
- User saves at least one personal dua or recording.
- Travel agency can embed it in website without custom development.

## Languages for MVP
English, Urdu, Arabic, German. Add French, Turkish, Indonesian, Bengali later.

## Key Features
### Step Wizard
- Progress bar 1 to 15.
- Current step highlight.
- Back/Next navigation.
- “I have completed this step” checkbox.
- Save progress locally and optionally to user account.

### Listening Mode
- Play pre-recorded step audio.
- Browser text-to-speech fallback.
- Separate audio per language where available.
- Slow speed mode for elderly users.

### Personal Pilgrim Recording
- Record personal dua or reflection per step.
- Store in browser IndexedDB for privacy by default.
- Optional upload if user has account and accepts consent.

### Personal Dua Translation
- User writes dua in their own language.
- MVP: save text only.
- Optional low-cost AI: translate only on demand, not automatically.

### 360 / Virtual Trip
- Use 360 image viewer in browser.
- Hotspots show step information.
- Basic click navigation between scenes.
- Optional WebXR mode later.

### Admin Content Management
- Manage steps, translations, audio URLs, scene URLs, warnings, tips, and checklists.
- Start with JSON files; later move to database.

## Compliance and Religious Safety
- Clearly state: “Educational guide only. For detailed rulings, consult a qualified scholar or official Umrah guide.”
- Avoid claiming one single opinion for disputed matters.
- Allow admin to review all religious text before publishing.

