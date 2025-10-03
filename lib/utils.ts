import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export timezone utilities for backward compatibility
export { 
  formatCT as formatTexasTime,
  formatCTDate as formatTexasDate,
  toCT,
  fromCTToUTC,
  parseAsCentral,
  nowCT
} from './timezone-utils'
