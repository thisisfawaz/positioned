/**
 * Industry taxonomy for feed matching.
 *
 * Each industry maps to a set of terms covering job titles, skills, tools
 * and common spellings. Matching is intentionally fuzzy: a viewer and a post
 * connect if any of their terms resolve to the same industry.
 *
 * Adding a term is the only maintenance this needs. Keep terms lowercase.
 */

export const INDUSTRIES: Record<string, string[]> = {
  design: [
    'design', 'designer', 'ux', 'ui', 'user experience', 'user interface',
    'product designer', 'web designer', 'graphic designer', 'visual designer',
    'interaction designer', 'brand designer', 'web builder', 'webflow',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'indesign',
    'prototyping', 'wireframe', 'wireframing', 'design system', 'typography',
    'motion design', '3d design', 'creative',
  ],
  engineering: [
    'engineer', 'engineering', 'developer', 'programmer', 'software',
    'frontend', 'front-end', 'backend', 'back-end', 'fullstack', 'full-stack',
    'web developer', 'mobile developer', 'ios', 'android', 'devops', 'sre',
    'javascript', 'typescript', 'react', 'next.js', 'node', 'python', 'java',
    'golang', 'rust', 'php', 'ruby', 'c#', '.net', 'sql', 'aws', 'docker',
    'kubernetes', 'api', 'cloud', 'infrastructure', 'qa', 'testing',
    'architect', 'technical lead', 'cto',
  ],
  data: [
    'data', 'analyst', 'analytics', 'data scientist', 'data engineer',
    'machine learning', 'ml', 'ai', 'artificial intelligence', 'statistics',
    'bi', 'business intelligence', 'tableau', 'power bi', 'looker', 'pandas',
    'sql', 'etl', 'data pipeline', 'visualization',
  ],
  product: [
    'product', 'product manager', 'product owner', 'pm', 'roadmap',
    'product strategy', 'scrum', 'agile', 'backlog', 'user research',
    'discovery', 'product lead', 'head of product', 'cpo',
  ],
  marketing: [
    'marketing', 'marketer', 'growth', 'seo', 'sem', 'content marketing',
    'social media', 'brand', 'branding', 'campaign', 'advertising',
    'copywriter', 'email marketing', 'crm', 'ppc', 'digital marketing',
    'community', 'community manager', 'public relations', 'pr',
  ],
  writing: [
    'writer', 'writing', 'content', 'editor', 'copywriter', 'journalist',
    'technical writer', 'content strategist', 'proofreading', 'editorial',
    'blogging', 'storytelling',
  ],
  sales: [
    'sales', 'account executive', 'account manager', 'business development',
    'bd', 'partnerships', 'customer success', 'csm', 'revenue', 'bdr', 'sdr',
    'lead generation', 'closing',
  ],
  finance: [
    'finance', 'financial', 'accountant', 'accounting', 'bookkeeper',
    'cfo', 'controller', 'audit', 'tax', 'payroll', 'investment', 'banking',
    'financial analyst', 'budgeting', 'forecasting', 'fintech',
  ],
  operations: [
    'operations', 'ops', 'operations manager', 'logistics', 'supply chain',
    'project manager', 'program manager', 'coordinator', 'process',
    'procurement', 'administration', 'chief of staff', 'founder', 'co-founder',
    'entrepreneur', 'startup', 'business owner', 'ceo', 'managing director',
  ],
  people: [
    'hr', 'human resources', 'recruiter', 'recruiting', 'talent',
    'talent acquisition', 'people', 'people ops', 'hiring', 'onboarding',
    'learning and development', 'l&d',
  ],
  support: [
    'support', 'customer support', 'helpdesk', 'technical support',
    'customer service', 'client services', 'account support',
  ],
  legal: [
    'legal', 'lawyer', 'attorney', 'counsel', 'paralegal', 'compliance',
    'contracts', 'gdpr', 'policy',
  ],
  education: [
    'teacher', 'teaching', 'educator', 'tutor', 'trainer', 'instructor',
    'curriculum', 'e-learning', 'instructional design',
  ],
  health: [
    'health', 'healthcare', 'medical', 'nurse', 'doctor', 'clinical',
    'pharma', 'wellness', 'therapy',
  ],
}

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Resolves a single term to the set of industries it belongs to.
 * Terms match if they are contained in a taxonomy phrase or vice versa,
 * so "senior product designer" still resolves to design.
 */
function industriesForTerm(term: string, out: Set<string>) {
  const t = normalize(term)
  if (!t) return

  for (const [industry, phrases] of Object.entries(INDUSTRIES)) {
    for (const phrase of phrases) {
      if (t === phrase || t.includes(phrase) || phrase.includes(t)) {
        out.add(industry)
        break
      }
    }
  }
}

/**
 * Resolves a list of terms (skills, title, interests) to a set of industries.
 * Also collects bare tokens so callers can fall back to token overlap when
 * nothing maps to a known industry.
 */
export function resolveIndustries(terms: string[]): {
  industries: Set<string>
  tokens: Set<string>
} {
  const industries = new Set<string>()
  const tokens = new Set<string>()

  for (const term of terms) {
    if (!term) continue
    industriesForTerm(term, industries)
    for (const token of normalize(term).split(' ')) {
      if (token.length > 2) tokens.add(token)
    }
  }

  return { industries, tokens }
}

/**
 * Scores how closely a viewer profile matches a post.
 *
 * Returns 0 when there is no connection. Otherwise a positive score where
 * a shared industry outweighs a shared bare token.
 */
export function matchScore(
  viewer: { industries: Set<string>; tokens: Set<string> },
  postTerms: string[]
): number {
  const post = resolveIndustries(postTerms)

  let industryHits = 0
  for (const industry of post.industries) {
    if (viewer.industries.has(industry)) industryHits++
  }

  let tokenHits = 0
  for (const token of post.tokens) {
    if (viewer.tokens.has(token)) tokenHits++
  }

  // Industry overlap is the strong signal; tokens are a weak fallback.
  return industryHits * 10 + tokenHits
}
