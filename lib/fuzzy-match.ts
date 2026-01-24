/**
 * Fuzzy matching utility for menu items
 * Handles variations in spelling, spacing, and case
 */

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

type MatchResult = {
  item: MenuItem;
  score: number;
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score (0-1, where 1 is exact match)
 */
function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

/**
 * Normalize string for matching
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s]/g, ""); // Remove special characters
}

/**
 * Find best match for a spoken item name in menu items
 */
export function findBestMatch(
  spokenName: string,
  menuItems: MenuItem[],
  threshold: number = 0.7
): MenuItem | null {
  if (!spokenName || menuItems.length === 0) {
    return null;
  }

  const normalizedSpoken = normalize(spokenName);
  const matches: MatchResult[] = [];

  for (const item of menuItems) {
    const normalizedItem = normalize(item.name);
    let score = 0;

    // 1. Exact match (case-insensitive)
    if (normalizedSpoken === normalizedItem) {
      score = 1.0;
    }
    // 2. Contains match (spoken name contains item name or vice versa)
    else if (normalizedItem.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedItem)) {
      score = 0.9;
    }
    // 3. Fuzzy match
    else {
      score = similarity(normalizedSpoken, normalizedItem);
    }

    if (score > 0) {
      matches.push({ item, score });
    }
  }

  if (matches.length === 0) {
    return null;
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  const bestMatch = matches[0];
  return bestMatch.score >= threshold ? bestMatch.item : null;
}

/**
 * Find top N matches for a spoken item name
 */
export function findTopMatches(
  spokenName: string,
  menuItems: MenuItem[],
  topN: number = 3
): MatchResult[] {
  if (!spokenName || menuItems.length === 0) {
    return [];
  }

  const normalizedSpoken = normalize(spokenName);
  const matches: MatchResult[] = [];

  for (const item of menuItems) {
    const normalizedItem = normalize(item.name);
    let score = 0;

    if (normalizedSpoken === normalizedItem) {
      score = 1.0;
    } else if (normalizedItem.includes(normalizedSpoken) || normalizedSpoken.includes(normalizedItem)) {
      score = 0.9;
    } else {
      score = similarity(normalizedSpoken, normalizedItem);
    }

    if (score > 0) {
      matches.push({ item, score });
    }
  }

  // Sort by score and return top N
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, topN);
}

