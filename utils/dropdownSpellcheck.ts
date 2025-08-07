import { useMemo } from 'react'

interface SpellcheckOptions {
  threshold?: number
  maxSuggestions?: number
}

interface SpellcheckResult {
  hasSuggestions: boolean
  bestSuggestion: string | null
  suggestions: string[]
  shouldShowAddAnyway: boolean
}

export function useDropdownSpellcheck(
  options: string[],
  config: SpellcheckOptions = {}
) {
  const { threshold = 0.6, maxSuggestions = 3 } = config

  const checkSpelling = useMemo(() => {
    return (input: string): SpellcheckResult => {
      const normalizedInput = input.toLowerCase().trim()
      
      if (!normalizedInput) {
        return {
          hasSuggestions: false,
          bestSuggestion: null,
          suggestions: [],
          shouldShowAddAnyway: false
        }
      }

      // Calculate similarity scores for all options
      const scoredOptions = options.map(option => {
        const normalizedOption = option.toLowerCase()
        const score = calculateSimilarity(normalizedInput, normalizedOption)
        return { option, score }
      })

      // Sort by score and filter by threshold
      const suggestions = scoredOptions
        .filter(item => item.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSuggestions)
        .map(item => item.option)

      const hasSuggestions = suggestions.length > 0
      const bestSuggestion = suggestions[0] || null

      return {
        hasSuggestions,
        bestSuggestion,
        suggestions,
        shouldShowAddAnyway: !hasSuggestions && normalizedInput.length >= 2
      }
    }
  }, [options, threshold, maxSuggestions])

  const getSpellcheckMessage = (input: string, result: SpellcheckResult): string => {
    if (result.hasSuggestions && result.bestSuggestion) {
      return `Did you mean "${result.bestSuggestion}"?`
    }
    return 'No close matches found'
  }

  const handleUseSuggestion = (
    suggestion: string,
    currentValues: string[],
    updateFn: (values: string[]) => void
  ) => {
    if (!currentValues.includes(suggestion)) {
      updateFn([...currentValues, suggestion])
    }
  }

  const handleAddAnyway = (
    value: string,
    currentValues: string[],
    updateFn: (values: string[]) => void
  ) => {
    const trimmedValue = value.trim()
    if (trimmedValue && !currentValues.includes(trimmedValue)) {
      updateFn([...currentValues, trimmedValue])
    }
  }

  return {
    checkSpelling,
    getSpellcheckMessage,
    handleUseSuggestion,
    handleAddAnyway
  }
}

// Helper function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) {
    return 1.0
  }
  
  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

// Levenshtein distance algorithm
function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}