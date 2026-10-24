/** Fuzzy token search with a small edit-distance budget for typo tolerance. */
export function matchesFuzzyQuery(text: string, query: string): boolean {
  const normalizedText = text.toLocaleLowerCase()
  const queryWords = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  if (queryWords.length === 0) return true
  const candidates = normalizedText.split(/[^\p{L}\p{N}]+/u).filter(Boolean)

  return queryWords.every((word) => candidates.some((candidate) => {
    if (candidate.includes(word) || word.includes(candidate)) return true
    const maxDistance = word.length > 6 ? 2 : 1
    if (Math.abs(candidate.length - word.length) > maxDistance) return false
    let previous = Array.from({ length: candidate.length + 1 }, (_, index) => index)
    for (let row = 1; row <= word.length; row += 1) {
      const current = [row]
      let rowMinimum = row
      for (let column = 1; column <= candidate.length; column += 1) {
        const cost = word[row - 1] === candidate[column - 1] ? 0 : 1
        const value = Math.min(
          (previous[column] ?? Number.POSITIVE_INFINITY) + 1,
          (current[column - 1] ?? Number.POSITIVE_INFINITY) + 1,
          (previous[column - 1] ?? Number.POSITIVE_INFINITY) + cost
        )
        current.push(value)
        rowMinimum = Math.min(rowMinimum, value)
      }
      if (rowMinimum > maxDistance) return false
      previous = current
    }
    return (previous[candidate.length] ?? Number.POSITIVE_INFINITY) <= maxDistance
  }))
}
