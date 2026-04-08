const API_URL =
  "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";

const API_VERSION = "7.2-preview.1";

/** flags: 914 = 0x392 = IncludeStatistics | IncludeVersionProperties | IncludeFiles | IncludeLatestVersionOnly | ExcludeNonValidated */
const DEFAULT_FLAGS = 914;

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
  filterCategory?: string;
  searchText?: string;
}

interface StatisticEntry {
  statisticName: string;
  value: number;
}

interface ExtensionVersion {
  version: string;
  lastUpdated: string;
}

interface Publisher {
  publisherId: string;
  publisherName: string;
  displayName: string;
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
  lastUpdated: string;
}

interface QueryResponse {
  results: Array<{
    extensions: RawExtension[];
    resultMetadata: Array<{
      metadataType: string;
      metadataItems: Array<{ name: string; count: number }>;
    }>;
  }>;
}

function buildFilters(options: QueryOptions) {
  const criteria: Array<{ filterType: number; value: string }> = [
    { filterType: 8, value: "Microsoft.VisualStudio.Code" },
  ];

  if (options.filterCategory) {
    criteria.push({ filterType: 5, value: options.filterCategory });
  }
  if (options.searchText) {
    criteria.push({ filterType: 10, value: options.searchText });
  }

  return [
    {
      criteria,
      pageNumber: options.pageNumber,
      pageSize: options.pageSize,
      sortBy: options.sortBy,
      sortOrder: 0,
    },
  ];
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export async function queryExtensions(
  options: QueryOptions,
): Promise<RawExtension[]> {
  const body = {
    filters: buildFilters(options),
    assetTypes: [],
    flags: DEFAULT_FLAGS,
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json;api-version=${API_VERSION}`,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = (await response.json()) as QueryResponse;
      return data.results[0]?.extensions ?? [];
    }

    console.warn(
      `  API error ${response.status} (attempt ${attempt}/${MAX_RETRIES})`,
    );

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    } else {
      throw new Error(
        `Marketplace API error after ${MAX_RETRIES} retries: ${response.status} ${response.statusText}`,
      );
    }
  }

  return [];
}

export function getStat(
  extension: RawExtension,
  name: string,
): number | undefined {
  return extension.statistics.find((s) => s.statisticName === name)?.value;
}
