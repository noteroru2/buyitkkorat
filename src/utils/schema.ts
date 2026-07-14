import { SITE } from "../data/site";
import { absoluteUrl, type BreadcrumbItem } from "./seo";

type FaqItem = { question: string; answer: string };

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": SITE.organizationId,
    name: SITE.brand,
    legalName: SITE.legalName,
    url: SITE.url,
    telephone: SITE.phoneTel,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "จังหวัดนครราชสีมา",
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
      name: "จังหวัดนครราชสีมา",
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
    "@graph": [organizationSchema(), websiteSchema(), ...nodes],
  };
}
