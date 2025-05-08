// Navigation debugging utility
let navigationHistory: { path: string; timestamp: number }[] = []

export function logNavigation(path: string) {
  const timestamp = Date.now()
  navigationHistory.push({ path, timestamp })

  // Keep only the last 10 entries
  if (navigationHistory.length > 10) {
    navigationHistory = navigationHistory.slice(-10)
  }

  console.log(`Navigation to: ${path} at ${new Date(timestamp).toISOString()}`)
  console.log("Navigation history:", navigationHistory)
}

export function getNavigationHistory() {
  return [...navigationHistory]
}

export function clearNavigationHistory() {
  navigationHistory = []
}
