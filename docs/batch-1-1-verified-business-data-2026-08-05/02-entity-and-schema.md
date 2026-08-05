# 02 — Entity and Schema

## Central entity

- `STORE_LOCATION` — full NAP + hours
- `CONTACT_CHANNELS` — phone, LINE, Facebook, Maps
- `SERVICE_AREA` — Korat as non-branch service area
- `formatStoreFullAddress()` — single formatter for pages/footer

## LocalBusiness

- `streetAddress`: 740/8 ถนนชยางกูร
- `addressLocality`: ตำบลในเมือง อำเภอเมืองอุบลราชธานี
- `addressRegion`: อุบลราชธานี
- `postalCode`: 34000
- `addressCountry`: TH
- `hasMap`: verified Maps URL
- `openingHours`: Mo-Su 09:00-21:00
- `openingHoursSpecification`: Mon–Sun 09:00–21:00
- `areaServed`: จังหวัดนครราชสีมา (service, not store address)

## Organization

- `location` → `#localbusiness`
- `sameAs`: LINE + Facebook (+ GBP if env set)
- No fake Review / AggregateRating
