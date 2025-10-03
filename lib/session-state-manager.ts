/**
 * Session State Manager
 * Handles saving and restoring user's session state (URL, filters, page number, etc.)
 */

interface SessionState {
  url: string
  filters?: Record<string, any>
  page?: number
  sort?: string
  timestamp: string
}

const SESSION_STATE_KEY = 'session_state_backup'

/**
 * Save current session state to localStorage
 */
export function saveSessionState(state: Partial<SessionState>) {
  try {
    const sessionState: SessionState = {
      url: state.url || window.location.pathname + window.location.search,
      filters: state.filters,
      page: state.page,
      sort: state.sort,
      timestamp: new Date().toISOString()
    }

    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify(sessionState))
    console.log('✅ Session state saved:', sessionState)
  } catch (error) {
    console.error('❌ Failed to save session state:', error)
  }
}

/**
 * Get saved session state from localStorage
 */
export function getSessionState(): SessionState | null {
  try {
    const saved = localStorage.getItem(SESSION_STATE_KEY)
    if (!saved) return null

    const state = JSON.parse(saved) as SessionState

    // Check if state is not too old (max 1 hour)
    const savedTime = new Date(state.timestamp).getTime()
    const now = new Date().getTime()
    const hourInMs = 60 * 60 * 1000

    if (now - savedTime > hourInMs) {
      console.log('⏰ Session state expired (>1 hour old), clearing...')
      clearSessionState()
      return null
    }

    return state
  } catch (error) {
    console.error('❌ Failed to get session state:', error)
    return null
  }
}

/**
 * Clear saved session state
 */
export function clearSessionState() {
  try {
    localStorage.removeItem(SESSION_STATE_KEY)
    console.log('🗑️ Session state cleared')
  } catch (error) {
    console.error('❌ Failed to clear session state:', error)
  }
}

/**
 * Check if there's a saved session state to restore
 */
export function hasSavedSessionState(): boolean {
  return getSessionState() !== null
}
