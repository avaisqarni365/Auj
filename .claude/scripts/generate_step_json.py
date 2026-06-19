#!/usr/bin/env python3
"""Generate starter JSON for a 15-step multilingual Umrah wizard."""
import json
from pathlib import Path

LANGUAGES = [
    {"code": "en", "name": "English", "dir": "ltr"},
    {"code": "ar", "name": "Arabic", "dir": "rtl"},
    {"code": "ur", "name": "Urdu", "dir": "rtl"},
    {"code": "fr", "name": "French", "dir": "ltr"},
    {"code": "tr", "name": "Turkish", "dir": "ltr"},
    {"code": "id", "name": "Indonesian", "dir": "ltr"},
    {"code": "bn", "name": "Bengali", "dir": "ltr"},
    {"code": "de", "name": "German", "dir": "ltr"},
]

STEPS = [
    (1, "niyyah-overview", "Niyyah Overview", "Understand sincere intention before starting Umrah.", "before_makkah"),
    (2, "ihram-preparation", "Ihram Preparation", "Prepare body, clothing, and behavior for Ihram.", "before_makkah"),
    (3, "niyyah-at-miqat", "Niyyah at Miqat", "Make intention for Umrah before crossing Miqat.", "before_makkah"),
    (4, "talbiyah", "Talbiyah", "Recite Talbiyah after entering Ihram.", "before_makkah"),
    (5, "enter-masjid-al-haram", "Enter Masjid al-Haram", "Enter respectfully and make dua when seeing the Kaaba.", "makkah"),
    (6, "start-tawaf", "Start Tawaf", "Begin seven anti-clockwise circuits around the Kaaba.", "tawaf"),
    (7, "complete-tawaf", "Complete 7 Rounds of Tawaf", "Track and complete all seven Tawaf rounds.", "tawaf"),
    (8, "pray-two-rakahs", "Pray 2 Rak'ahs", "Offer two units of prayer after Tawaf where possible.", "tawaf"),
    (9, "start-sai", "Start Sa'i at Safa", "Begin Sa'i from Safa toward Marwah.", "sai"),
    (10, "complete-sai", "Complete Sa'i", "Complete seven passages between Safa and Marwah.", "sai"),
    (11, "trim-or-shave-hair", "Trim or Shave Hair", "Complete the final required act of Umrah.", "completion"),
    (12, "umrah-complete", "Umrah Complete", "Confirm completion and exit Ihram.", "completion"),
    (13, "optional-acts", "Optional Acts", "Continue with recommended deeds and worship.", "optional"),
    (14, "final-dua-depart", "Final Du'a and Depart", "Make farewell dua before leaving Makkah.", "optional"),
    (15, "visit-madinah", "Visit Madinah", "Optional Madinah guide and important places.", "madinah"),
]


def localized_content(title, explanation):
    return [
        {
            "language": lang["code"],
            "dir": lang["dir"],
            "title": title if lang["code"] == "en" else "",
            "subtitle": "",
            "explanation": explanation if lang["code"] == "en" else "",
            "checklist": [],
            "duaArabic": "",
            "transliteration": "",
            "meaning": "",
            "audioUrl": "",
            "reviewStatus": "draft" if lang["code"] != "en" else "reviewed",
        }
        for lang in LANGUAGES
    ]


def main():
    steps = []
    for number, slug, title, explanation, phase in STEPS:
        steps.append(
            {
                "id": number,
                "slug": slug,
                "phase": phase,
                "isRequired": number <= 12,
                "heroImagePrompt": f"Premium Umrah wizard screen hero image for step {number}: {title}.",
                "icon": "kaaba" if phase in {"makkah", "tawaf", "completion"} else "guide",
                "content": localized_content(title, explanation),
                "actions": [
                    {"id": "listen", "labelKey": "listen_to_step", "type": "audio", "required": False},
                    {"id": "record", "labelKey": "record_personal_dua", "type": "recording", "required": False},
                    {"id": "confirm", "labelKey": "mark_step_complete", "type": "button", "required": True},
                ],
                "completionRule": {"mode": "manual_confirm", "confirmationTextKey": "mark_step_complete"},
                "audioConfig": {
                    "enabled": True,
                    "playbackSpeeds": [0.75, 1, 1.25],
                    "allowLoop": True,
                    "allowDownloadOffline": True,
                    "transcriptEnabled": True,
                    "verifiedAudioRequired": True,
                },
                "recordingConfig": {
                    "enabled": True,
                    "maxDurationSeconds": 180,
                    "allowedTypes": ["reflection", "personal_dua", "pronunciation_practice"],
                    "privacyDefault": "private",
                    "allowDelete": True,
                    "allowExport": True,
                },
                "scholarReviewRequired": True,
            }
        )
    output = {"languages": LANGUAGES, "steps": steps}
    out_path = Path.cwd() / "umrah_wizard_steps.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(out_path)


if __name__ == "__main__":
    main()
