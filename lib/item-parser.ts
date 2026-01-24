/**
 * Parses spoken item lists into structured format
 * Handles formats like:
 * - "idli two, masala idli four, vada one"
 * - "2 idli, 4 masala idli, 1 vada"
 * - "idli 2 masala idli 4 vada 1"
 */

type ParsedItem = {
  name: string;
  quantity: number;
  originalText: string;
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
};

function parseNumber(text: string): number | null {
  // Try direct number first
  const num = parseInt(text, 10);
  if (!isNaN(num) && num > 0) {
    return num;
  }

  // Try number words
  const lower = text.toLowerCase().trim();
  if (NUMBER_WORDS[lower]) {
    return NUMBER_WORDS[lower];
  }

  return null;
}

function extractQuantity(text: string): { quantity: number | null; remaining: string } {
  const words = text.trim().split(/\s+/);
  let quantity: number | null = null;
  const remainingWords: string[] = [];

  // Check first word for number
  if (words.length > 0) {
    const firstWord = words[0];
    const parsedNum = parseNumber(firstWord);
    if (parsedNum !== null) {
      quantity = parsedNum;
      remainingWords.push(...words.slice(1));
      return { quantity, remaining: remainingWords.join(" ") };
    }
  }

  // Check last word for number
  if (words.length > 1) {
    const lastWord = words[words.length - 1];
    const parsedNum = parseNumber(lastWord);
    if (parsedNum !== null) {
      quantity = parsedNum;
      remainingWords.push(...words.slice(0, -1));
      return { quantity, remaining: remainingWords.join(" ") };
    }
  }

  // Check middle words for numbers
  for (let i = 0; i < words.length; i++) {
    const parsedNum = parseNumber(words[i]);
    if (parsedNum !== null) {
      quantity = parsedNum;
      // Split around the number
      const before = words.slice(0, i).join(" ");
      const after = words.slice(i + 1).join(" ");
      const remaining = [before, after].filter(Boolean).join(" ").trim();
      return { quantity, remaining };
    }
  }

  // No quantity found, default to 1
  return { quantity: 1, remaining: text };
}

export function parseItemList(text: string): ParsedItem[] {
  if (!text || !text.trim()) {
    return [];
  }

  // Split by common separators: comma, "and", "then"
  const separators = /[,;]|\s+and\s+|\s+then\s+/i;
  const parts = text.split(separators).map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return [];
  }

  const parsedItems: ParsedItem[] = [];

  for (const part of parts) {
    if (!part) continue;

    const { quantity, remaining } = extractQuantity(part);
    const itemName = remaining.trim();

    if (itemName) {
      parsedItems.push({
        name: itemName,
        quantity: quantity || 1,
        originalText: part,
      });
    }
  }

  return parsedItems;
}

