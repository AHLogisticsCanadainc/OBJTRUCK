/**
 * Cross-Tab Authentication Synchronization
 *
 * This module provides functionality to synchronize authentication state
 * across multiple browser tabs using BroadcastChannel API with localStorage fallback.
 */

// Define the types of auth events we want to synchronize
export type AuthSyncEvent =
  | { type: "SIGNED_IN"; payload: { userId: string; expiresAt: number } }
  | { type: "SIGNED_OUT" }
  | { type: "TOKEN_REFRESHED"; payload: { accessToken: string; expiresAt: number } }
  | { type: "SESSION_EXPIRED" }
  | { type: "AUTH_ERROR"; payload: { message: string } }
  | { type: "PING"; payload: { tabId: string } }
  | { type: "PONG"; payload: { tabId: string; hasAuth: boolean; isExpired?: boolean } }

// Generate a unique ID for this tab
const TAB_ID =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

// Storage keys
const STORAGE_KEY = "auth_sync_event"
const LAST_EVENT_KEY = "auth_last_event"

// Class to handle cross-tab communication
export class CrossTabAuthSync {
  private channel: BroadcastChannel | null = null
  private listeners: Array<(event: AuthSyncEvent) => void> = []
  private useLocalStorageFallback = false
  private initialized = false
  private lastEventTime = 0

  constructor() {
    // Try to use BroadcastChannel API, fall back to localStorage if not available
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.channel = new BroadcastChannel("auth_sync_channel")
        console.log("🔄 Using BroadcastChannel for auth synchronization")
      } else {
        this.useLocalStorageFallback = true
        console.log("🔄 BroadcastChannel not available, using localStorage fallback")
      }
    } catch (error) {
      console.error("❌ Error initializing BroadcastChannel:", error)
      this.useLocalStorageFallback = true
    }
  }

  /**
   * Initialize the cross-tab communication
   */
  init(): void {
    if (this.initialized || typeof window === "undefined") return

    if (this.channel) {
      this.channel.onmessage = (event) => {
        this.handleIncomingEvent(event.data)
      }
    }

    if (this.useLocalStorageFallback) {
      // Set up localStorage event listener
      window.addEventListener("storage", (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const data = JSON.parse(event.newValue)
            this.handleIncomingEvent(data)
          } catch (error) {
            console.error("❌ Error parsing auth sync event:", error)
          }
        }
      })
    }

    // Announce this tab's presence
    this.broadcastEvent({
      type: "PING",
      payload: { tabId: TAB_ID },
    })

    this.initialized = true
    console.log(`✅ Auth sync initialized for tab ${TAB_ID}`)
  }

  /**
   * Clean up resources when no longer needed
   */
  cleanup(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.listeners = []
    this.initialized = false
  }

  /**
   * Subscribe to auth events
   */
  subscribe(callback: (event: AuthSyncEvent) => void): () => void {
    this.listeners.push(callback)

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  /**
   * Broadcast an auth event to other tabs
   */
  broadcastEvent(event: AuthSyncEvent): void {
    if (typeof window === "undefined") return

    try {
      // Add timestamp to prevent duplicate processing
      const eventWithTimestamp = {
        ...event,
        timestamp: Date.now(),
        sourceTabId: TAB_ID,
      }

      // Store the last event for new tabs that open
      localStorage.setItem(LAST_EVENT_KEY, JSON.stringify(eventWithTimestamp))

      if (this.channel) {
        this.channel.postMessage(eventWithTimestamp)
      }

      if (this.useLocalStorageFallback) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventWithTimestamp))
        // We need to immediately remove it to trigger another event later
        setTimeout(() => {
          localStorage.removeItem(STORAGE_KEY)
        }, 100)
      }

      console.log(`🔄 Broadcasting auth event: ${event.type}`)
    } catch (error) {
      console.error("❌ Error broadcasting auth event:", error)
    }
  }

  /**
   * Handle incoming auth events
   */
  private handleIncomingEvent(data: any): void {
    // Skip if this is our own event or if we've seen this event before
    if (data.sourceTabId === TAB_ID) return
    if (data.timestamp && data.timestamp <= this.lastEventTime) return

    this.lastEventTime = data.timestamp || Date.now()

    // Process the event
    console.log(`🔄 Received auth event from another tab: ${data.type}`)

    // If we receive a PING, respond with our auth status
    if (data.type === "PING") {
      // Check if we have auth data
      const hasAuth = typeof localStorage !== "undefined" && !!localStorage.getItem("sb-access-token")

      // Also check if the token is expired
      let isExpired = false
      if (hasAuth && typeof localStorage !== "undefined") {
        const expiryTimeStr = localStorage.getItem("supabase.auth.expiresAt")
        if (expiryTimeStr) {
          const expiryTime = Number.parseInt(expiryTimeStr, 10)
          isExpired = Date.now() > expiryTime
        }
      }

      this.broadcastEvent({
        type: "PONG",
        payload: {
          tabId: TAB_ID,
          hasAuth,
          isExpired,
        },
      })
      return
    }

    // If we receive SESSION_EXPIRED, check our own token
    if (data.type === "SESSION_EXPIRED") {
      // Check if our token is also expired
      if (typeof localStorage !== "undefined") {
        const expiryTimeStr = localStorage.getItem("supabase.auth.expiresAt")
        if (expiryTimeStr) {
          const expiryTime = Number.parseInt(expiryTimeStr, 10)
          const isExpired = Date.now() > expiryTime

          if (isExpired) {
            console.log("🔄 Our token is also expired, will handle locally")
            // Let the listeners handle this
          } else {
            console.log("🔄 Our token is still valid, ignoring expired event from other tab")
            // Optionally, we could broadcast our valid token to help other tabs
            return
          }
        }
      }
    }

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(data)
      } catch (error) {
        console.error("❌ Error in auth sync listener:", error)
      }
    })
  }

  /**
   * Check if there are other authenticated tabs
   */
  async checkForAuthenticatedTabs(): Promise<boolean> {
    return new Promise((resolve) => {
      let hasResponse = false
      let isAuthenticated = false

      // Set a timeout to resolve if no responses
      const timeout = setTimeout(() => {
        if (!hasResponse) {
          console.log("⏱️ No response from other tabs, assuming no authenticated tabs")
          resolve(false)
        }
      }, 500)

      // Listen for PONG responses
      const unsubscribe = this.subscribe((event) => {
        if (event.type === "PONG") {
          hasResponse = true
          if (event.payload.hasAuth) {
            isAuthenticated = true
            clearTimeout(timeout)
            unsubscribe()
            resolve(true)
          }
        }
      })

      // Broadcast a PING to all tabs
      this.broadcastEvent({
        type: "PING",
        payload: { tabId: TAB_ID },
      })
    })
  }

  /**
   * Get the last auth event (useful for new tabs)
   */
  getLastEvent(): AuthSyncEvent | null {
    try {
      const lastEventJson = localStorage.getItem(LAST_EVENT_KEY)
      if (lastEventJson) {
        return JSON.parse(lastEventJson)
      }
    } catch (error) {
      console.error("❌ Error getting last auth event:", error)
    }
    return null
  }

  /**
   * Check if the current tab has a valid auth token
   */
  hasValidToken(): boolean {
    try {
      if (typeof localStorage === "undefined") return false

      const token = localStorage.getItem("sb-access-token")
      if (!token) return false

      const expiryTimeStr = localStorage.getItem("supabase.auth.expiresAt")
      if (!expiryTimeStr) return false

      const expiryTime = Number.parseInt(expiryTimeStr, 10)
      return Date.now() < expiryTime
    } catch (error) {
      console.error("❌ Error checking token validity:", error)
      return false
    }
  }
}

// Create a singleton instance
export const authSync = new CrossTabAuthSync()

// Initialize on import if in browser environment
if (typeof window !== "undefined") {
  // Initialize in the next tick to avoid issues with SSR
  setTimeout(() => {
    authSync.init()
  }, 0)
}
