// types.ts
export interface JournalEntry {
    id?: string;
    date: string; // ISO format
    title: string;
    summary: string;
    tags: string[];
    people?: string[];
    sentiment?: string;
    relatedTo?: string[];
    body?: string;
  }
  