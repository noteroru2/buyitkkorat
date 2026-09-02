import navigationData from './navigation-architecture.json';

export interface NavigationLink {
  label: string;
  href: string;
  role?: string;
}

export interface PrimaryNavigationItem {
  id: string;
  label: string;
  href: string | null;
  children: NavigationLink[];
}

export const primaryNavigation =
  navigationData.header.primary as PrimaryNavigationItem[];

export const utilityNavigation =
  navigationData.header.utility as NavigationLink[];

export const footerNavigation = navigationData.footer.columns;

export function getHomepageDiscoveryUrls(): string[] {
  return [
    ...navigationData.discovery.homepage.primaryHubs,
    ...navigationData.discovery.homepage.appleDirectOwners,
  ];
}

export function getAllGlobalNavigationUrls(): string[] {
  const urls: string[] = [];

  for (const item of primaryNavigation) {
    if (item.href) urls.push(item.href);
    for (const child of item.children) urls.push(child.href);
  }

  for (const item of utilityNavigation) urls.push(item.href);
  for (const column of navigationData.footer.columns) {
    for (const item of column.links) urls.push(item.href);
  }

  return [...new Set(urls)];
}

/** Candidates from Batches 6–7 are never exposed before release. */
export function canExposeUnreleasedNavigationCandidate(): false {
  return false;
}

/** Virtual architecture nodes may label groups but never become hrefs. */
export function canEmitVirtualNavigationHref(): false {
  return false;
}
