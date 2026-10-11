/** "stirred-and-strong" → "Stirred and strong" */
export function titleCase(id: string): string {
  const words = id.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
