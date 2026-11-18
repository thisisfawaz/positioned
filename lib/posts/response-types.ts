import type { ResponseType } from '@prisma/client'

/**
 * The ONE place response types and their labels live.
 *
 * WHO SAYS WHAT, and why it is driven by the AUTHOR's side:
 *
 *   A PROFESSIONAL posts   -> a RECRUITER responds -> "Request CV"
 *   A RECRUITER posts      -> a PROFESSIONAL responds -> "Submit CV"
 *
 * The author's side alone decides the wording, because the author chose the
 * ask. A professional is saying "ask me for my CV"; a recruiter is saying
 * "send me your CV". Getting this backwards is easy and produces the nonsense
 * of a recruiter being told to SUBMIT a CV to the professional.
 *
 * MESSAGE and APPLY only exist on one side each and do not change voice.
 *
 * If a new ResponseType is added: add it to prisma/schema.prisma, add it to
 * the right list(s) here, and give it a label for BOTH author sides.
 * The server action validates against the same lists - see
 * app/(app)/profile/work/actions.ts.
 */

export type PostSide = 'PROFESSIONAL' | 'RECRUITER'

export const PROFESSIONAL_RESPONSES: ResponseType[] = [
  'MESSAGE',
  'CV',
  'PORTFOLIO',
  'CV_AND_PORTFOLIO',
]

export const RECRUITER_RESPONSES: ResponseType[] = [
  'APPLY',
  'CV',
  'PORTFOLIO',
  'CV_AND_PORTFOLIO',
  // Message is offered on BOTH sides. On a recruiter's post it means a
  // professional can open a conversation instead of submitting documents.
  'MESSAGE',
]

export function responsesForSide(side: PostSide): ResponseType[] {
  return side === 'RECRUITER' ? RECRUITER_RESPONSES : PROFESSIONAL_RESPONSES
}

/**
 * What a post MEANS, by author side. This is what the composer offers and what
 * the card button says - both describe the ask, and the ask belongs to the
 * author's side.
 */
export const AUTHOR_SIDE_LABEL: Record<PostSide, Record<ResponseType, string>> = {
  // A professional asking recruiters for things: the recruiter REQUESTS.
  PROFESSIONAL: {
    MESSAGE: 'Message',
    CV: 'Request CV',
    PORTFOLIO: 'Request Portfolio',
    CV_AND_PORTFOLIO: 'Request CV & Portfolio',
    APPLY: 'Apply',
  },
  // A recruiter asking professionals for things: the professional SUBMITS.
  RECRUITER: {
    MESSAGE: 'Message',
    CV: 'Submit CV',
    PORTFOLIO: 'Submit Portfolio',
    CV_AND_PORTFOLIO: 'Submit CV & Portfolio',
    APPLY: 'Apply',
  },
}

/** Labels for the composer, i.e. from the author's own side. */
export function composerLabel(response: ResponseType, authorSide: PostSide): string {
  return AUTHOR_SIDE_LABEL[authorSide][response]
}

/**
 * Label for a post's CTA as seen on the card.
 *
 * THE AUTHOR'S SIDE DECIDES THE WORDING. A professional's post means a
 * recruiter should REQUEST the CV; a recruiter's post means a professional
 * should SUBMIT it. `viewerSide` is deliberately NOT used to flip the verb -
 * doing that is what produced "Submit CV" on a professional's post, telling a
 * recruiter to submit something to the person who asked for it.
 *
 * Kept as a parameter so callers do not break, and so a future rule that
 * genuinely differs by viewer has somewhere to live.
 */
export function responseLabel(
  response: ResponseType,
  authorSide: PostSide,
  _viewerSide?: PostSide
): string {
  return AUTHOR_SIDE_LABEL[authorSide][response]
}
