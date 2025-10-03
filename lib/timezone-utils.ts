import { DateTime } from 'luxon'

/**
 * Centralized timezone utilities for the Creative Review Yield application
 * All time handling must use America/Chicago (Central Time)
 * 
 * Global Time Policy:
 * - Storage: UTC in Firebase/DB
 * - Display: Always Central Time (CT) with DST handling
 * - Boundaries: Use Central midnight for "Today", "This Week", etc.
 */

export const CENTRAL_TIMEZONE = 'America/Chicago'

// ============================================================================
// CORE UTILITIES
// ============================================================================

/**
 * Convert UTC DateTime to Central Time
 */
export function toCT(utcDate: DateTime | Date | string | null | undefined): DateTime {
  if (!utcDate) {
    return DateTime.now().setZone(CENTRAL_TIMEZONE)
  }
  
  let dt: DateTime
  
  if (utcDate instanceof Date) {
    dt = DateTime.fromJSDate(utcDate, { zone: 'utc' })
  } else if (typeof utcDate === 'string') {
    // Parse as UTC if string
    dt = DateTime.fromISO(utcDate, { zone: 'utc' })
  } else {
    dt = utcDate
  }
  
  return dt.setZone(CENTRAL_TIMEZONE)
}

/**
 * Convert Central Time DateTime to UTC for storage
 */
export function fromCTToUTC(centralDate: DateTime | Date | string | null | undefined): DateTime {
  if (!centralDate) {
    return DateTime.utc()
  }
  
  let dt: DateTime
  
  if (centralDate instanceof Date) {
    // Treat as Central Time
    dt = DateTime.fromJSDate(centralDate, { zone: CENTRAL_TIMEZONE })
  } else if (typeof centralDate === 'string') {
    // Parse as Central Time
    dt = DateTime.fromISO(centralDate, { zone: CENTRAL_TIMEZONE })
  } else {
    dt = centralDate
  }
  
  return dt.toUTC()
}

/**
 * Parse a naive date string as Central Time
 * Useful for Google Sheets dates that have no timezone info
 */
export function parseAsCentral(dateString: string): DateTime {
  // If it looks like just a date (YYYY-MM-DD), assume Central midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return DateTime.fromISO(`${dateString}T00:00:00`, { zone: CENTRAL_TIMEZONE })
  }
  
  // If it has time info, parse as Central
  return DateTime.fromISO(dateString, { zone: CENTRAL_TIMEZONE })
}

/**
 * Get current Central Time
 */
export function nowCT(): DateTime {
  return DateTime.now().setZone(CENTRAL_TIMEZONE)
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format date/time in Central timezone with CT suffix
 */
export function formatCT(
  date: DateTime | Date | string | null | undefined, 
  format: string = 'MMM d, h:mm a'
): string {
  if (!date) return 'N/A'
  
  const centralTime = toCT(date)
  
  if (!centralTime.isValid) {
    return 'Invalid Date'
  }
  
  // Convert luxon format to date-fns style if needed
  const luxonFormat = format
    .replace(/MMM/g, 'LLL')  // Month abbreviation
    .replace(/dd/g, 'dd')    // Day with zero padding
    .replace(/d/g, 'd')      // Day without zero padding
    .replace(/yyyy/g, 'yyyy') // Full year
    .replace(/h:mm a/g, 'h:mm a') // 12-hour time
  
  return centralTime.toFormat(luxonFormat) + ' CT'
}

/**
 * Format date only in Central timezone (no CT suffix for dates)
 */
export function formatCTDate(
  date: DateTime | Date | string | null | undefined, 
  format: string = 'MMM dd, yyyy'
): string {
  if (!date) return 'N/A'
  
  const centralTime = toCT(date)
  
  if (!centralTime.isValid) {
    return 'Invalid Date'
  }
  
  const luxonFormat = format
    .replace(/MMM/g, 'LLL')
    .replace(/dd/g, 'dd')
    .replace(/d/g, 'd')
    .replace(/yyyy/g, 'yyyy')
  
  return centralTime.toFormat(luxonFormat)
}

// ============================================================================
// DATE BOUNDARY UTILITIES (for filters like "Today", "This Week")
// ============================================================================

/**
 * Get start and end of today in Central Time (as UTC for querying)
 */
export function getTodayBoundariesUTC(): { start: DateTime; end: DateTime } {
  const nowInCentral = nowCT()
  const startOfDayInCentral = nowInCentral.startOf('day')
  const endOfDayInCentral = nowInCentral.endOf('day')
  
  return {
    start: startOfDayInCentral.toUTC(),
    end: endOfDayInCentral.toUTC()
  }
}

/**
 * Get start and end of yesterday in Central Time (as UTC for querying)
 */
export function getYesterdayBoundariesUTC(): { start: DateTime; end: DateTime } {
  const nowInCentral = nowCT()
  const yesterdayInCentral = nowInCentral.minus({ days: 1 })
  const startOfDayInCentral = yesterdayInCentral.startOf('day')
  const endOfDayInCentral = yesterdayInCentral.endOf('day')
  
  return {
    start: startOfDayInCentral.toUTC(),
    end: endOfDayInCentral.toUTC()
  }
}

/**
 * Get start and end of this week in Central Time (as UTC for querying)
 */
export function getThisWeekBoundariesUTC(): { start: DateTime; end: DateTime } {
  const nowInCentral = nowCT()
  const startOfWeekInCentral = nowInCentral.startOf('week')
  const endOfWeekInCentral = nowInCentral.endOf('week')
  
  return {
    start: startOfWeekInCentral.toUTC(),
    end: endOfWeekInCentral.toUTC()
  }
}

/**
 * Get start and end of this month in Central Time (as UTC for querying)
 */
export function getThisMonthBoundariesUTC(): { start: DateTime; end: DateTime } {
  const nowInCentral = nowCT()
  const startOfMonthInCentral = nowInCentral.startOf('month')
  const endOfMonthInCentral = nowInCentral.endOf('month')
  
  return {
    start: startOfMonthInCentral.toUTC(),
    end: endOfMonthInCentral.toUTC()
  }
}

/**
 * Get start and end of this year in Central Time (as UTC for querying)
 */
export function getThisYearBoundariesUTC(): { start: DateTime; end: DateTime } {
  const nowInCentral = nowCT()
  const startOfYearInCentral = nowInCentral.startOf('year')
  const endOfYearInCentral = nowInCentral.endOf('year')
  
  return {
    start: startOfYearInCentral.toUTC(),
    end: endOfYearInCentral.toUTC()
  }
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

/**
 * Check if a date is today in Central Time
 */
export function isTodayCT(date: DateTime | Date | string | null | undefined): boolean {
  if (!date) return false
  
  const centralTime = toCT(date)
  const nowInCentral = nowCT()
  
  return centralTime.hasSame(nowInCentral, 'day')
}

/**
 * Check if a date is yesterday in Central Time
 */
export function isYesterdayCT(date: DateTime | Date | string | null | undefined): boolean {
  if (!date) return false
  
  const centralTime = toCT(date)
  const yesterdayInCentral = nowCT().minus({ days: 1 })
  
  return centralTime.hasSame(yesterdayInCentral, 'day')
}

/**
 * Check if a date is in this week in Central Time
 */
export function isThisWeekCT(date: DateTime | Date | string | null | undefined): boolean {
  if (!date) return false
  
  const centralTime = toCT(date)
  const nowInCentral = nowCT()
  
  return centralTime.hasSame(nowInCentral, 'week')
}

/**
 * Check if a date is in this month in Central Time
 */
export function isThisMonthCT(date: DateTime | Date | string | null | undefined): boolean {
  if (!date) return false
  
  const centralTime = toCT(date)
  const nowInCentral = nowCT()
  
  return centralTime.hasSame(nowInCentral, 'month')
}

/**
 * Check if a date is in this year in Central Time
 */
export function isThisYearCT(date: DateTime | Date | string | null | undefined): boolean {
  if (!date) return false
  
  const centralTime = toCT(date)
  const nowInCentral = nowCT()
  
  return centralTime.hasSame(nowInCentral, 'year')
}

// ============================================================================
// FIREBASE/STORAGE UTILITIES
// ============================================================================

/**
 * Convert a Central Time date to UTC for Firebase storage
 */
export function toFirebaseTimestamp(centralDate: DateTime | Date | string): Date {
  return fromCTToUTC(centralDate).toJSDate()
}

/**
 * Convert Firebase timestamp to Central Time DateTime
 */
export function fromFirebaseTimestamp(timestamp: any): DateTime {
  if (!timestamp) return nowCT()
  
  let jsDate: Date
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    // Firestore Timestamp
    jsDate = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    jsDate = timestamp
  } else {
    jsDate = new Date(timestamp)
  }
  
  return DateTime.fromJSDate(jsDate, { zone: 'utc' }).setZone(CENTRAL_TIMEZONE)
}

// ============================================================================
// GOOGLE SHEETS PARSING
// ============================================================================

/**
 * Parse Google Sheets date values as Central Time
 * Handles various formats from Google Sheets
 */
export function parseGoogleSheetsDate(dateValue: unknown): DateTime {
  if (!dateValue) return nowCT()
  
  if (typeof dateValue === 'string') {
    // Common Google Sheets date formats
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
      // MM/DD/YYYY format - parse as Central midnight
      const [month, day, year] = dateValue.split('/')
      return DateTime.fromObject(
        { 
          year: parseInt(year), 
          month: parseInt(month), 
          day: parseInt(day), 
          hour: 0, 
          minute: 0, 
          second: 0 
        },
        { zone: CENTRAL_TIMEZONE }
      )
    }
    
    // Try parsing as ISO or other formats, assume Central
    return parseAsCentral(dateValue)
  }
  
  if (dateValue instanceof Date) {
    // Treat as naive date, assume Central timezone
    return DateTime.fromJSDate(dateValue, { zone: CENTRAL_TIMEZONE })
  }
  
  // Fallback
  return nowCT()
}