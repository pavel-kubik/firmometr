const CONTENT = `---
name: search-companies
description: Search Czech companies by name using the Firmometr API backed by the ARES business registry. Returns up to 20 results per page with IČO, name, and address.
---

# Search Companies

Search for Czech companies by name via Firmometr, which aggregates the official ARES business registry.

## Endpoint

\`GET https://firmometr.cz/api/v1/search?q={query}&page={page}\`

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`q\` | string | Yes | Company name or partial name |
| \`page\` | number | No | Page number, default 1 |

## Response

JSON array of company summaries, each with \`ico\` (8-digit business ID), \`name\`, and \`address\`.

## Example

\`\`\`
GET https://firmometr.cz/api/v1/search?q=škoda
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
