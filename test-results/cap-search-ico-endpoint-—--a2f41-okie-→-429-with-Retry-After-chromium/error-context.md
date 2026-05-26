# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cap.spec.ts >> search-ico endpoint — rate cap >> over-cap cookie → 429 with Retry-After
- Location: e2e/cap.spec.ts:193:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8889
Call log:
  - → GET http://localhost:8889/api/v1/search/ico/27082440
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.96 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - cookie: srch_cnt=20|1779820772284

```