# Assumptions (review before launch)

Append a row whenever you proceed on something unverified. Resolve before the relevant wave ships.

| #  | Assumption | Area | Confidence | Verify by | Status |
|----|------------|------|-----------|-----------|--------|
| A1 | Maqam/Nusuk payload shapes match our mocked types | Saudi connector | low | partner sandbox (Wave C) | open |
| A2 | e-visa eligible nationality list is current | visa-router | med | Saudi official source | open |
| A3 | PKR acquiring works with chosen gateway | payments | low | gateway sandbox (Wave A) | open |
| A4 | Nusuk-approved-hotel rule blocks visa if unmet | Saudi connector | med | partner docs | open |
| A5 | EUR 20k/50k/200k guarantee tier as config is sufficient | compliance | med | VVTAT confirmation | open |
| A6 | Umrah Guide ritual text, duas (Arabic + transliteration + translation) and step order are accurate | umrah-ritual-wizard | med | qualified scholar sign-off | open |
| A7 | Umrah Guide content is EN-only for v1; LT/UR/AR translation pending (Arabic dua text shown verbatim) | umrah-ritual-wizard | med | translator + scholar | open |
| A8 | Day-planner jamaat times + hourly temperatures are a static hot-season approximation (Makkah; Madinah ~2°C cooler), not live data | day-planner | med | prayer-times service + local verification | open |
| A9 | Airport/Luggage/Ziyarat wizard step content + EN/UR/AR/DE translations (and Saudi customs allowed/declare/prohibited rules) are accurate | step-video-wizards | med | qualified scholar + translator + current customs source | open |
| A10 | Companion-guide + step-wizard LT/TR translations are machine-drafted (EN is the reviewed base; UI falls back to EN) | guides, step-video-wizards | med | native LT/TR reviewer | open |
| A11 | Makkah/Madina Ziyarat UR/DE site descriptions are machine-translated DRAFTS (src/ritual/wizard-steps-drafts.ts; flagged "under review" in the wizard UI; EN/AR are the reviewed base) | step-video-wizards | med | native UR/DE reviewer + scholar | open |
| A12 | Smart Planner LT/UR/AR UI strings (messages/{lt,ur,ar}.json → `smartPlanner`) are machine-drafted; EN is the reviewed base. Canonical option values stay English internally; only display is translated | smart-planner | med | native LT/UR/AR reviewer | open |
| A13 | Companion-guide overlay locales now mirror the app (lt/ur/ar; dead `tr` removed). UR/AR **category** name/desc/noun are machine-drafted (guide-i18n.ts); UR/AR **item notes** currently fall back to EN (LT has them). EN is the reviewed base | companion-guides | med | native UR/AR reviewer | open |
