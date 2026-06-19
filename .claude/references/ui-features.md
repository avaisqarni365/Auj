# UI, Audio, Recording, Language, and Admin Features

## Website/app navigation

- Top progress bar: 1 to 15 step circles.
- Current step highlighted in deep green.
- Completed steps show checkmarks.
- Main content on left, multilingual explanation on right for desktop.
- On mobile, show hero image first, then action cards, then language panel.
- Bottom navigation: Back, Save, Continue.

## Audio/listening module

Controls:
- Play/pause
- Replay
- Speed: 0.75x, 1x, 1.25x
- Loop recitation
- Download/offline indicator
- Transcript toggle

Admin fields:
- language
- audio file URL
- speaker name
- verified by
- pronunciation notes
- review status

## Personal recording module

Controls:
- Record
- Pause
- Stop
- Save
- Rename
- Delete
- Export

Use cases:
- Personal dua in own language
- Step reflection
- Pronunciation practice
- Family dua list

Privacy rule:
- Default to private.
- Require explicit user action before sharing.

## Language manager

Frontend:
- Global selector
- Step-specific selector
- Show missing translation warning
- RTL layout for Arabic and Urdu
- Font fallback for Arabic, Urdu, Bengali, and Turkish

Admin:
- Translation editor per field
- Status workflow: draft -> translated -> reviewed -> scholar reviewed -> published
- Separate Arabic, transliteration, and meaning fields
- Version history
- Export/import CSV or JSON

## Accessibility

- Large buttons for pilgrims walking in crowds.
- High contrast mode.
- Offline mode.
- Audio transcript.
- Screen reader labels.
- No tiny text in critical instructions.
- Avoid forcing user to watch animation before proceeding.

## Suggested feature roadmap

MVP:
- 15 steps
- language selector
- manual progress
- audio playback
- personal dua text notes

Version 2:
- voice recording
- offline caching
- admin translation workflow
- Tawaf and Sa'i counters

Version 3:
- family sharing
- scholar review dashboard
- trip timeline
- Madinah ziyarat map
