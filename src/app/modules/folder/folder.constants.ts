export const FOLDER_CATEGORIES = [
  'Community Outreach',
  'Grant Programs',
  'Education',
  'Food & Agriculture',
  'Healthcare',
  'Community Development',
  'Entrepreneurship',
  'Environment',
  'Events',
  'Volunteering',
  'Success Stories',
  'Other',
] as const;

export enum FOLDER_STATUS {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export const folderSearchableFields = [
  'name',
  'description',
  'category',
  'location',
];
