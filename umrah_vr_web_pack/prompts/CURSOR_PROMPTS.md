# Cursor / Claude / Codex Prompts

## Prompt 1: Create Static Wizard
Build a Next.js Umrah wizard at `/umrah-guide`. Use content from `content/steps.en.json`. Create components: StepProgressBar, LanguageSwitcher, StepHeroMedia, ChecklistCard, AudioGuide, PersonalDuaEditor, and StepNavigation. Store progress in localStorage. Use Tailwind CSS. Acceptance: user can navigate all 15 steps and mark each step complete.

## Prompt 2: Add Multilingual Support
Add language support using JSON files per language. Implement RTL layout for Arabic and Urdu. Add fallback to English when a field is missing. Acceptance: language switch changes all visible step text without page reload.

## Prompt 3: Add Listening Mode
Add audio playback per step. If no audio file exists, use browser SpeechSynthesis with the step audioScript. Add play, pause, speed 0.75/1/1.25, and captions. Acceptance: every step can be listened to.

## Prompt 4: Add Personal Recording
Use the browser MediaRecorder API to record a personal dua/reflection per step. Save recordings locally with IndexedDB. Add delete and replay buttons. Acceptance: user can record, replay, and delete recording for each step without backend.

## Prompt 5: Add 360 Scene Viewer
Integrate a lightweight 360 image viewer. Add hotspots that show step guidance. Fallback to normal image if WebGL fails. Acceptance: step can display 360 scene and clickable hotspots.

## Prompt 6: Add Optional MCP Server
Create a TypeScript MCP server named `umrah-wizard-mcp` with tools: get_umrah_steps, get_step_content, update_step_translation, validate_language_pack, export_language_pack, generate_audio_script. Tools must be allowlisted, authenticated, and log changes. No shell execution. Acceptance: developer can inspect and update content safely through MCP client.

