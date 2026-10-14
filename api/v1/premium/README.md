# Premium report payment API

The production API is deployed on Vercel and verifies PortOne V2 payments before generating paid reports.

## Provider

- Orchestration: PortOne V2
- PG channel: NHN KCP
- Product: 사주결 정밀 리포트
- Fixed amount: KRW 5,900
- Browser SDK: `https://cdn.portone.io/v2/browser-sdk.esm.js`
- Server verification: `GET https://api.portone.io/payments/{paymentId}`

The browser result is never trusted as proof of payment. The server releases a report only when the PortOne lookup returns:

- the same signed `paymentId`
- `status === "PAID"`
- `amount.total === 5900`
- `currency === "KRW"`

## Vercel environment variables

Already configured:

- `ALLOWED_ORIGIN=https://saju.everytinytool.com`
- `PREMIUM_SIGNING_SECRET`

Add these after the PortOne/KCP contract and channel setup:

- `PORTONE_STORE_ID` — PortOne Store ID
- `PORTONE_CHANNEL_KEY` — the NHN KCP V2 channel key
- `PORTONE_API_SECRET` — PortOne V2 API Secret; server only

Do not expose `PORTONE_API_SECRET` in the browser.

The public `GET /api/v1/premium/config` endpoint reports `enabled:false` until all three values exist. The storefront therefore stays hidden for ordinary visitors until payment configuration is complete.

## Endpoints

- `GET /api/v1/premium/config`
- `POST /api/v1/premium/order`
- `POST /api/v1/premium/confirm`
- `POST /api/v1/premium/report`

`order` creates a signed, 30-minute payment intent bound to the Saju input and fixed price. `confirm` performs the PortOne server lookup and returns a 30-day report access token only after successful verification.
