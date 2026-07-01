/** Resolve public assets correctly on localhost and GitHub Pages project subpaths. */
export function asset(path: string): string {
  const relativePath = `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
  return new URL(relativePath, document.baseURI).href
}
