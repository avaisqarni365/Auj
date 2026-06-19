# Architecture

## Recommended Low-Cost Architecture

Existing Website
-> Embedded Umrah Wizard route or iframe
-> Next.js frontend
-> Static multilingual JSON content
-> 360 scene assets on CDN/storage
-> Optional Supabase/Firebase backend for accounts and recordings
-> Optional MCP server for admin/content tooling only

## Frontend
- Next.js or React.
- Tailwind CSS.
- React i18next or next-intl for language.
- Pannellum, Marzipano, A-Frame, or React Three Fiber for 360 scenes.
- Web Audio API / MediaRecorder API for personal recordings.
- IndexedDB for local recordings.

## Backend Options
### Cheapest MVP
- No backend for anonymous mode.
- JSON content files in `/content`.
- Recordings stored locally in browser only.

### Practical Version
- Supabase or Firebase Auth.
- PostgreSQL/Firestore for user progress.
- Object storage for optional voice uploads.

### Advanced Version
- Node.js/NestJS backend.
- PostgreSQL + S3 compatible storage.
- Admin panel for travel agencies.

## Minimal AI Strategy
Use AI only when the user clicks a paid feature:
1. Translate my personal dua.
2. Simplify explanation for children.
3. Ask a general educational question.

Do not use AI for every page load, every step, or every audio playback.

## MCP Usage
Use MCP if you want AI developer/admin tools to update content, validate translations, generate missing audio scripts, or export screens. Do not put MCP directly in the public pilgrim flow unless there is a strong reason.

Recommended MCP tools:
- get_umrah_steps
- update_step_translation
- validate_step_content
- generate_audio_script
- export_language_pack
- list_recording_policy

## Security Notes
- Personal recordings are private data.
- Default to local-only storage.
- Require consent for cloud upload.
- Never expose MCP server publicly without authentication and allowlisted tools.
- Do not allow MCP tools to run shell commands or access arbitrary files.

