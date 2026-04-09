const MARKETPLACE_API_URL =
  'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';
const API_VERSION = '7.2-preview.1';

/**
 * flags = 950 = 0x3B6
 *   IncludeFiles (2)
 *   IncludeCategoryAndTags (4)
 *   IncludeVersionProperties (64)
 *   ExcludeNonValidated (128)
 *   IncludeStatistics (256)
 *   IncludeLatestVersionOnly (512)
 */
const FLAGS = 950;

export const SortBy = {
  Installs: 4,
  TrendingDaily: 7,
  TrendingWeekly: 8,
  TrendingMonthly: 9,
} as const;
export type SortByValue = (typeof SortBy)[keyof typeof SortBy];

export interface QueryOptions {
  sortBy: SortByValue;
  pageSize: number;
  pageNumber: number;
}

// ----------------------------------------------------------------
// Raw API types (Gallery API response shape)
// ----------------------------------------------------------------

interface StatisticEntry {
  statisticName: string;
  value: number;
}

interface VersionProperty {
  key: string;
  value: string;
}

interface ExtensionVersion {
  version: string;
  lastUpdated: string;
  targetPlatform?: string | null;
  properties?: VersionProperty[];
}

interface Publisher {
  publisherId: string;
  publisherName: string;
  displayName: string;
  domain: string | null;
  isDomainVerified: boolean;
  publisherFlags: string | null;
}

export interface RawExtension {
  extensionId: string;
  extensionName: string;
  displayName: string;
  shortDescription: string;
  publisher: Publisher;
  versions: ExtensionVersion[];
  statistics: StatisticEntry[];
  categories: string[];
  tags: string[];
  publishedDate: string;
  releaseDate: string;
  lastUpdated: string;
  pricing?: string | null;
}

interface QueryResponse {
  results: Array<{
    extensions: RawExtension[];
  }>;
}

// ----------------------------------------------------------------
// Query
// ----------------------------------------------------------------

const MAX_RETRIES = 5;

export async function queryExtensions(options: QueryOptions): Promise<RawExtension[]> {
  const body = {
    filters: [
      {
        criteria: [{ filterType: 8, value: 'Microsoft.VisualStudio.Code' }],
        pageNumber: options.pageNumber,
        pageSize: options.pageSize,
        sortBy: options.sortBy,
        sortOrder: 0,
      },
    ],
    assetTypes: [],
    flags: FLAGS,
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(MARKETPLACE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: `application/json;api-version=${API_VERSION}`,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = (await response.json()) as QueryResponse;
      return data.results[0]?.extensions ?? [];
    }

    const status = response.status;
    console.warn(
      `Marketplace API error ${status} (attempt ${attempt}/${MAX_RETRIES}), page ${options.pageNumber}`,
    );

    if (attempt < MAX_RETRIES) {
      // Exponential backoff: 1s, 2s, 4s, 8s (skipped on last attempt)
      const delay = 2 ** (attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      throw new Error(
        `Marketplace API failed after ${MAX_RETRIES} retries on page ${options.pageNumber}: ${status}`,
      );
    }
  }

  return [];
}

// ----------------------------------------------------------------
// Stat helper
// ----------------------------------------------------------------

export function getStat(ext: RawExtension, name: string): number | null {
  return ext.statistics?.find((s) => s.statisticName === name)?.value ?? null;
}

// ----------------------------------------------------------------
// Mapping: RawExtension → ExtensionSnapshot
// ----------------------------------------------------------------

import type { ExtensionSnapshot } from '@meguru/types';

function getVersionProp(ext: RawExtension, key: string): string | undefined {
  return ext.versions[0]?.properties?.find((p) => p.key === key)?.value;
}

function splitProp(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toExtensionSnapshot(ext: RawExtension, snapshotDate: string): ExtensionSnapshot {
  const latestVersion = ext.versions[0];

  return {
    extension_id: ext.extensionId,
    name: `${ext.publisher.publisherName}.${ext.extensionName}`,
    display_name: ext.displayName,
    snapshot_date: snapshotDate,

    publisher_id: ext.publisher.publisherId,
    publisher_name: ext.publisher.publisherName,
    publisher_display_name: ext.publisher.displayName,
    publisher_domain: ext.publisher.domain ?? null,
    publisher_domain_verified: ext.publisher.isDomainVerified ?? false,
    publisher_verified: ext.publisher.publisherFlags === 'verified',

    short_description: ext.shortDescription ?? null,
    categories: ext.categories ?? [],
    tags: ext.tags ?? [],
    published_date: ext.publishedDate,
    release_date: ext.releaseDate ?? ext.publishedDate,
    last_updated: ext.lastUpdated,

    install_count: getStat(ext, 'install'),
    download_count: getStat(ext, 'downloadCount'),
    average_rating: getStat(ext, 'averagerating'),
    rating_count: getStat(ext, 'ratingcount'),
    weighted_rating: getStat(ext, 'weightedRating'),
    trending_daily: getStat(ext, 'trendingdaily'),
    trending_weekly: getStat(ext, 'trendingweekly'),
    trending_monthly: getStat(ext, 'trendingmonthly'),
    update_count: getStat(ext, 'updateCount'),

    latest_version: latestVersion?.version ?? null,
    target_platform: latestVersion?.targetPlatform ?? null,
    engine: getVersionProp(ext, 'Microsoft.VisualStudio.Code.Engine') ?? null,
    is_pre_release: getVersionProp(ext, 'Microsoft.VisualStudio.Code.PreRelease') === 'true',
    pricing: ext.pricing ?? null,
    executes_code: getVersionProp(ext, 'Microsoft.VisualStudio.Code.ExecutesCode') === '1',
    extension_dependencies: splitProp(
      getVersionProp(ext, 'Microsoft.VisualStudio.Code.ExtensionDependencies'),
    ),
    extension_pack: splitProp(getVersionProp(ext, 'Microsoft.VisualStudio.Code.ExtensionPack')),
    extension_kind: splitProp(getVersionProp(ext, 'Microsoft.VisualStudio.Code.ExtensionKind')),
  };
}
