export interface SearchData {
    exact_matches: number;
    fuzzy_matches: number;
    client_distribution: Record<string, number>;
    unique_sessions: Set<string>;
  }