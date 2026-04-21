---
name: stripe-best-practices
description: Guides Stripe integration decisions — API selection (Checkout Sessions vs PaymentIntents), Connect platform setup (Accounts v2, controller properties), billing/subscriptions, Treasury financial accounts, integration surfaces (Checkout, Payment Element), and migrating from deprecated Stripe APIs. Use when building, modifying, or reviewing any Stripe integration — including accepting payments, building marketplaces, integrating Stripe, processing payments, setting up subscriptions, or creating connected accounts.
---

## Pre-Run Checklist (always execute before Step 1)
1. Check if ./learnings.md exists → if yes, READ it now and apply ALL "Non-Negotiable Rules" for this entire session.
2. Check if ../brand-context/voice-profile.md exists → if this skill produces any written output (posts, emails, reports, copy) → load it.
3. Check if ../brand-context/icp.md exists → if this skill involves audience targeting, research, or content → load it.

Latest Stripe API version: **2026-03-25.dahlia**. Always use the latest API version and SDK unless the user specifies otherwise.

## Integration routing

| Building…                             | Recommended API                     | Details                  |
| ------------------------------------- | ----------------------------------- | ------------------------ |
| One-time payments                     | Checkout Sessions                   | <references/payments.md> |
| Custom payment form with embedded UI  | Checkout Sessions + Payment Element | <references/payments.md> |
| Saving a payment method for later     | Setup Intents                       | <references/payments.md> |
| Connect platform or marketplace       | Accounts v2 (`/v2/core/accounts`)   | <references/connect.md>  |
| Subscriptions or recurring billing    | Billing APIs + Checkout Sessions    | <references/billing.md>  |
| Embedded financial accounts / banking | v2 Financial Accounts               | <references/treasury.md> |

Read the relevant reference file before answering any integration question or writing code.

## Key documentation

When the user's request does not clearly fit a single domain above, consult:

- [Integration Options](https://docs.stripe.com/payments/payment-methods/integration-options.md) — Start here when designing any integration.
- [API Tour](https://docs.stripe.com/payments-api/tour.md) — Overview of Stripe's API surface.
- [Go Live Checklist](https://docs.stripe.com/get-started/checklist/go-live.md) — Review before launching.

## Feedback Loop & Self-Improvement

After delivering the final output:
1. Ask the user exactly this: "Rate this output 1–5. What should I do differently next time? (press Enter to skip)"
2. If the user provides feedback:
   a. Open ./learnings.md
   b. Under "Patterns Observed" → append: `- [today's date] [feedback summary]`
   c. Check "Patterns Observed" — if the same type of correction appears 2 or more times → add it as a new rule under "Non-Negotiable Rules"
   d. Save learnings.md
3. On next run: Pre-Run Checklist (top of this file) ensures rules are loaded first.
