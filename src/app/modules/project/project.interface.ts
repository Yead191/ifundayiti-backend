import { Model, Types } from 'mongoose';
import { PROJECT_STATUS, PROJECT_CATEGORIES } from './project.constants';

export type IProject = {
  applicationPeriod?: Types.ObjectId;
  name: string;
  description: string;
  location: string;

  grantAmount?: number;

  status: PROJECT_STATUS;

  category: (typeof PROJECT_CATEGORIES)[number];
  founder: string;
  year: number;
  image?: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  story?: string;

  gallery?: string[];

  featured: boolean;
};

export type ProjectModel = Model<IProject>;
