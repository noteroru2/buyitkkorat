# 05 — Consent and Cookies

## Components

- `CookieConsent.astro` — banner (accept/deny), localStorage `winner_cookie_consent_v1`, prefs FAB + event `winner_cookie_prefs`
- Page `/นโยบายคุกกี้` — describes only real systems (necessary consent cookie + optional GA4)
- Footer link + privacy policy link

## Consent Mode keys

- `analytics_storage` — granted only on accept
- `ad_storage` / `ad_user_data` / `ad_personalization` — always denied

## Accessibility

- dialog labelling on banner
- keyboard-focusable buttons
- prefs control available after decision
