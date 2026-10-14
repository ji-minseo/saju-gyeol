# Saju Gyeol premium API

This Worker keeps paid report generation out of the public browser bundle.

## Flow

1. Browser sends the already-normalized Saju input to `POST /v1/premium/order`.
2. Worker validates the input with the same calculator, fixes the product amount at KRW 5,900, and returns a signed short-lived order token.
3. Browser requests Toss Payments authentication.
4. Toss redirects back with `paymentKey`, `orderId`, and `amount`.
5. Browser sends those values plus the signed order token to `POST /v1/premium/confirm`.
6. Worker verifies the fixed amount and signed order data, then calls Toss Payments `POST /v1/payments/confirm` with the secret key.
7. Only after approval does the Worker run `buildPremiumReportV1()` and return the report plus a signed access token.
8. `POST /v1/premium/report` can regenerate the same purchased report for 30 days from that access token.

Birth data is not placed in the Toss order name or order ID and does not need to be persisted in a database for this MVP. It is bound to the signed token.

## Required secrets

- `TOSS_CLIENT_KEY`
- `TOSS_SECRET_KEY`
- `PREMIUM_SIGNING_SECRET` — long random value used only by the Worker.

Never commit the Toss secret key or signing secret.

## Site launch

After deploying the Worker, set `apiBase`, `tossClientKey`, and `checkoutEnabled:true` in `src/premium/config.mjs`, then rebuild/deploy the site.

The current storefront can be reviewed before launch by adding `?premiumPreview=1` to the Saju result URL.
