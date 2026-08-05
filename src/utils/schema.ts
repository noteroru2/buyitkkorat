import { CONTACT_CHANNELS, SERVICE_AREA, SITE, STORE_LOCATION } from "../data/site";
import { absoluteUrl, type BreadcrumbItem } from "./seo";

type FaqItem = { question: string; answer: string };

function sameAsLinks(): string[] {
  const links: string[] = [CONTACT_CHANNELS.lineUrl];
  if (CONTACT_CHANNELS.facebookUrl) links.push(CONTACT_CHANNELS.facebookUrl);
  if (CONTACT_CHANNELS.googleBusinessUrl) links.push(CONTACT_CHANNELS.googleBusinessUrl);
  return links;
}

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": SITE.organizationId,
    name: SITE.brand,
    alternateName: [SITE.tradeName, SITE.name],
    legalName: SITE.legalName,
    url: SITE.url,
    telephone: SITE.phoneTel,
    sameAs: sameAsLinks(),
    location: { "@id": SITE.localBusinessId },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: `จังหวัด${STORE_LOCATION.province}`,
      },
      {
        "@type": "AdministrativeArea",
        name: `จังหวัด${SERVICE_AREA.primaryProvince}`,
      },
    ],
  };
}

/** LocalBusiness for Ubon storefront only — never Korat address */
export function localBusinessSchema() {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    streetAddress: STORE_LOCATION.streetAddress,
    addressLocality: STORE_LOCATION.addressLocality,
    addressRegion: STORE_LOCATION.province,
    postalCode: STORE_LOCATION.postalCode,
    addressCountry: STORE_LOCATION.country,
  };

  return {
    "@type": "LocalBusiness",
    "@id": SITE.localBusinessId,
    name: STORE_LOCATION.tradeName,
    alternateName: STORE_LOCATION.brandName,
    legalName: STORE_LOCATION.legalName,
    url: SITE.url,
    telephone: SITE.phoneTel,
    address,
    hasMap: STORE_LOCATION.mapsUrl,
    openingHours: STORE_LOCATION.openingHoursSchema,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    parentOrganization: { "@id": SITE.organizationId },
    areaServed: {
      "@type": "AdministrativeArea",
      name: `จังหวัด${SERVICE_AREA.primaryProvince}`,
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE.websiteId,
    url: SITE.url,
    name: SITE.name,
    inLanguage: "th-TH",
    publisher: { "@id": SITE.organizationId },
  };
}

export function webpageSchema(opts: {
  type?: string;
  url: string;
  name: string;
  description: string;
  dateModified?: string;
}) {
  return {
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": SITE.websiteId },
    about: { "@id": SITE.organizationId },
    inLanguage: "th-TH",
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  };
}

export function serviceSchema(opts: {
  url: string;
  name: string;
  description: string;
}) {
  return {
    "@type": "Service",
    "@id": `${opts.url}#service`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: { "@id": SITE.organizationId },
    areaServed: {
      "@type": "AdministrativeArea",
      name: `จังหวัด${SERVICE_AREA.primaryProvince}`,
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(items[items.length - 1]?.href ?? "/")}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqSchema(faqs: FaqItem[], pageUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(opts: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author?: string;
}) {
  return {
    "@type": "Article",
    "@id": `${opts.url}#article`,
    headline: opts.headline,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Organization",
      name: opts.author ?? SITE.brand,
    },
    publisher: { "@id": SITE.organizationId },
    mainEntityOfPage: { "@id": `${opts.url}#webpage` },
    inLanguage: "th-TH",
  };
}

export function buildGraph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), localBusinessSchema(), websiteSchema(), ...nodes],
  };
}
