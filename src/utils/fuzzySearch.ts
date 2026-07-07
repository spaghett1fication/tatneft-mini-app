// utils/fuzzySearch.ts

// Расстояние Левенштейна
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Поиск похожих имён (порог 75%)
export function findSimilarNames(input: string, names: string[]): { name: string; similarity: number }[] {
  const inputLower = input.toLowerCase().trim();
  const results: { name: string; similarity: number }[] = [];

  names.forEach(name => {
    const nameLower = name.toLowerCase();
    const distance = levenshteinDistance(inputLower, nameLower);
    const maxLen = Math.max(inputLower.length, nameLower.length);
    const similarity = maxLen > 0 ? 1 - (distance / maxLen) : 0;

    if (similarity > 0.75 && inputLower !== nameLower) {
      results.push({ name, similarity });
    }
  });

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}