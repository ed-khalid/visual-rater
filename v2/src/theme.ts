/**
 * One palette for the whole app: a magazine page. Warm off-white paper, black ink for text and rules, one red for
 * emphasis; the tier and grade colours (shared/tiers.ts) are the only other colour. The same values are CSS variables
 * (index.css), which the stylesheets use; this copy is for the few places that set colours from script.
 */
export const theme = {
  paper: '#efe9de',
  paperDeep: '#e5ddcf',
  ink: '#151310',
  inkSoft: '#5f584e',
  inkFaint: '#9a9184',
  hair: 'rgba(21, 19, 16, 0.14)',
  accent: '#b3261e',
  serif: `"Newsreader Variable", Georgia, "Times New Roman", serif`,
  sans: `"Inter Variable", "Helvetica Neue", Arial, sans-serif`,
} as const
