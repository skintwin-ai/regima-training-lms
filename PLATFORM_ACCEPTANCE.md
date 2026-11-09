# SkinTwin platform — acceptance (local rails)

Canonical verification lives in Cloud at `/opt/cursor/artifacts/PLATFORM_ACCEPTANCE.md`. This copy documents the same closure contract for the LMS repo.

Engineering proof: `npm run verify:mesh` with Connect `:3000`, Suite `:3001`, LMS `:5000`, salon rail `:8000`, Gatsby `:9000`.

Closure proof: `npm run verify:mesh:closure` exits 0 only when `closureGate.goalComplete` is true (live rails **or** signed acceptance below).

## Acceptance record (product owner — edit artifact file in Cloud)

ACCEPT_LOCAL_RAILS_ONLY=true

Accepted by: PENDING  
Date: PENDING  
Scope: Stripe/Paystack/Shopify local substitutes in place of live settlement for this release.
