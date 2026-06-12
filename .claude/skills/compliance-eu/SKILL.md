---
name: compliance-eu
description: "Use this skill to build the EU compliance features for the Lithuanian tour-operator entity: issuing the consumer security/insolvency certificate to each customer, GDPR data handling, and EU Package Travel Directive duties (pre-contract info, refund timelines). Can start anytime; finalize before launch."
---

# EU compliance (Lithuania / Package Travel Directive)

## Scope
Cross-cutting compliance for the EU entity. Mostly in `core-booking` + a small `compliance` lib.
Encodes obligations as features, not legal advice — confirm wording with a Lithuanian adviser.

## Build steps
1. Security certificate: on every package booking, generate and deliver the consumer
   insolvency-protection certificate (PDF) referencing the guarantee/insurer; store proof of delivery.
2. Pre-contractual information: present the mandated package info before payment; record consent.
3. Refund timelines: on operator-insolvency or cancellation, enforce the directive's refund window
   (six months under the revised PTD) in the refund workflow.
4. GDPR: data-processing records, consent, data-subject export/delete, EU data residency for storage.
5. Make the guarantee tier (EUR 20k/50k/200k) a config that affects what the certificate states.

## Acceptance criteria
- Every package booking produces a stored, delivered security certificate.
- GDPR export/delete works; pre-contract info + consent are recorded before any charge.

## Out of scope
Filing the VVTAT certificate, buying the guarantee, MoRA/Saudi licensing (operator guide, not code).
