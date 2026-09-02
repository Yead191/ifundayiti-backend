export const PROJECT_CONSTANT = 'someValue';
export enum PROJECT_STATUS {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export const PROJECT_CATEGORIES = [
  'Food & Agriculture',
  'Clean Energy',
  'Water & Sanitation',
  'Education',
  'Healthcare',
  'Livelihood',
  'Small Business',
  'Community Development',
  'Environment',
  'Arts & Crafts',
  'Other',
] as const;
