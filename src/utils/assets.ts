/** Resolve public assets correctly on localhost and GitHub Pages project subpaths. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
