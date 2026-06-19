# Optional MCP Server Specification

## Purpose
Use MCP for developer/admin operations, not for every pilgrim interaction. MCP can help AI tools manage content, validate language packs, and prepare audio scripts without expensive custom admin workflows.

## Server Name
umrah-wizard-mcp

## Tools
### get_umrah_steps
Input: { language?: string }
Output: list of step ids, titles, status.

### get_step_content
Input: { stepId: string, language: string }
Output: full step content.

### update_step_translation
Input: { stepId: string, language: string, title?: string, subtitle?: string, explanation?: string, audioScript?: string, dua?: string, tip?: string }
Output: updated content plus validation result.

### validate_language_pack
Input: { language: string }
Output: missing fields, text length warnings, religious-review flags.

### export_language_pack
Input: { language: string, format: "json" | "csv" }
Output: file path or text payload.

### generate_audio_script
Input: { stepId: string, language: string, tone: "simple" | "children" | "elderly" }
Output: audio script draft requiring human review.

## Security Rules
- Authentication required.
- Admin-only.
- Deny by default.
- No shell command tool.
- No arbitrary file read/write.
- Log all content changes.
- Human review required before publishing religious content.

## When MCP Fits
Use it when the website owner or developer asks AI to:
- Add German translations for all steps.
- Find missing Urdu audio scripts.
- Export all step content to JSON.
- Prepare a review checklist.

Do not require MCP for ordinary pilgrims using the wizard.

