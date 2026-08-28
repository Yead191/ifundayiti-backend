export const APPLICATION_STATUS = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'underReview',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FINALIST: 'finalist',
    WINNER: 'winner',
    ARCHIVED: 'archived',
} as const;


export const STATUS_TRANSITIONS = {
  // Initial intake: can fast-track reject spam, archive clearly invalid submissions,
  // or move to full review
  [APPLICATION_STATUS.SUBMITTED]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.REJECTED,  // fast-track reject for spam/ineligible
  ],

  // Under review: approve to shortlist or reject
  [APPLICATION_STATUS.UNDER_REVIEW]: [
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.REJECTED,
  ],

  // Shortlisted: can elevate to finalist or reject at this stage
  [APPLICATION_STATUS.APPROVED]: [
    APPLICATION_STATUS.FINALIST,
    APPLICATION_STATUS.REJECTED,
  ],

  // Finalist: can revert to approved if re-evaluated.
  // NOTE: WINNER is intentionally NOT listed here — winner selection
  // is a separate process via the /winner-selection/:id endpoint.
  [APPLICATION_STATUS.FINALIST]: [
    APPLICATION_STATUS.APPROVED,
  ],

  // Winner: only move to archived once grant cycle concludes
  [APPLICATION_STATUS.WINNER]: [
    APPLICATION_STATUS.ARCHIVED,
  ],

  // Rejected: archive to clean up the board
  [APPLICATION_STATUS.REJECTED]: [
    APPLICATION_STATUS.ARCHIVED,
  ],

  // Terminal state — no further transitions
  [APPLICATION_STATUS.ARCHIVED]: [],
} as const;


