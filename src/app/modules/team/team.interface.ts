import { Model } from 'mongoose';
export type TeamMemberCategory = 'director' | 'member' | 'volunteer';
export type TeamStatus = 'pending' | 'active' | 'rejected' | 'blocked';
export type ITeam = {
  name: string;
  title?: string;
  category: TeamMemberCategory;
  location: string;
  bio: string;
  image: string;
  focusAreas?: string[];
  status: TeamStatus;
  email: string;
  phone: string;
  linkedin?: string;
  twitter?: string;
  featured?: boolean;
  rejectionReason?: string;
};

export type TeamModel = Model<ITeam>;
