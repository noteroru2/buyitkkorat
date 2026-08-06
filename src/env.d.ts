/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_GSC_VERIFICATION?: string;
  readonly PUBLIC_FACEBOOK_URL?: string;
  readonly PUBLIC_GOOGLE_MAPS_URL?: string;
  readonly PUBLIC_GBP_URL?: string;
  readonly PUBLIC_STORE_STREET_ADDRESS?: string;
  readonly PUBLIC_STORE_SUBDISTRICT?: string;
  readonly PUBLIC_STORE_DISTRICT?: string;
  readonly PUBLIC_STORE_PROVINCE?: string;
  readonly PUBLIC_STORE_POSTAL_CODE?: string;
  readonly PUBLIC_STORE_COUNTRY?: string;
  readonly PUBLIC_STORE_HOURS_TEXT?: string;
  readonly PUBLIC_STORE_OPENING_HOURS?: string;
  readonly PUBLIC_STORE_HOURS?: string;
  /** Future lead capture endpoint — leave blank until verified backend exists */
  readonly PUBLIC_LEAD_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
