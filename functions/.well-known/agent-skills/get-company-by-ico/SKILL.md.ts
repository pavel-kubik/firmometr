const CONTENT = `---
name: get-company-by-ico
description: Get full Czech company profile by IČO (8-digit business ID) aggregating ARES registry, ISIR insolvency register, VAT reliability database, and commercial register.
---

# Get Company by IČO

Retrieve comprehensive company data from Firmometr for a Czech entity identified by its IČO.

## Endpoint

\`GET https://firmometr.cz/api/v1/search/ico/{ico}\`

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| \`ico\` | string | 8-digit Czech business ID (IČO), zero-padded |

## Response

Aggregated profile from multiple Czech registries:

- **ARES**: Legal name, form, registered address, statutory officers, date of incorporation
- **ISIR**: Active insolvency proceedings flag
- **DPH**: VAT payer status and payment reliability rating
- **OR**: Commercial register entry links

## Example

\`\`\`
GET https://firmometr.cz/api/v1/search/ico/26168685
\`\`\`
`;

export const onRequest = (): Response =>
  new Response(CONTENT, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
