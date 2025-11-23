export interface NewsSource {
  title: string;
  uri: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  sourceName?: string;
  sourceUrl?: string;
  imageUrl: string;
}

export type Topic = 'Top Stories' | 'Technology' | 'World';

export interface FetchNewsResponse {
  articles: NewsItem[];
  sources: NewsSource[];
}