# API Contract

## Public Content
GET /api/steps?lang=en
Returns all step content for a language.

GET /api/steps/:stepId?lang=en
Returns one step.

GET /api/scenes/:stepId
Returns 360 scene metadata.

## User Progress
POST /api/progress
Body: { stepId, completed, notes }

GET /api/progress
Returns user progress.

## Personal Dua
POST /api/duas
Body: { stepId, language, text }

GET /api/duas/:stepId
Returns saved personal dua.

## Personal Recording
POST /api/recordings/presign
Body: { stepId, mimeType }
Returns signed upload URL.

POST /api/recordings/confirm
Body: { stepId, storageUrl, durationSeconds, consentToUpload }

## Low-Cost AI Optional
POST /api/ai/translate-dua
Body: { text, fromLanguage, toLanguage }
Rules: only run after explicit user click; show cost notice if needed.

