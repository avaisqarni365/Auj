# Database Design

## Cheapest MVP
Use static JSON files and local browser storage.

## Tables for Practical Version

### users
- id
- name
- email
- preferred_language
- created_at

### user_progress
- id
- user_id
- step_id
- completed
- completed_at
- notes

### personal_duas
- id
- user_id
- step_id
- language
- text
- created_at

### personal_recordings
- id
- user_id
- step_id
- storage_url
- duration_seconds
- consent_to_upload
- created_at

### step_content
- id
- step_id
- language
- title
- subtitle
- explanation
- audio_script
- dua
- tip
- updated_at

### scenes
- id
- step_id
- scene_type: image | 360 | video
- asset_url
- thumbnail_url
- hotspot_json

