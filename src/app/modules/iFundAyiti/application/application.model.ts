import { Schema, model } from 'mongoose';
import { IApplication, ApplicationModel } from './application.interface';

const PersonalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    }
  },
  {
    _id: false,
  }
);
const ContactSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);
const IdentificationSchema = new Schema(
  {
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },
    passport: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);
const GrantSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    fundUsage: {
      type: String,
      required: true,
    },
    expectedImpact: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);
const BackgroundSchema = new Schema(
  {
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    financialBackground: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);
const DocumentSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const applicationSchema = new Schema<IApplication, ApplicationModel>({
  applicationPeriod: {
    type: Schema.Types.ObjectId,
    ref: 'Applicationperiod',
    required: true,
    index: true,
  },

  personal: {
    type: PersonalSchema,
    required: true,
  },

  contact: {
    type: ContactSchema,
    required: true,
  },

  identification: {
    type: IdentificationSchema,
    required: true,
  },

  grant: {
    type: GrantSchema,
    required: true,
  },

  background: {
    type: BackgroundSchema,
    required: true,
  },

  documents: {
    type: [DocumentSchema],
    default: [],
  },

  status: {
    type: String,
    enum: [
      'submitted',
      'underReview',
      'approved',
      'rejected',
      'finalist',
      'winner',
      'archived',
    ],
    default: 'submitted',
    index: true,
  },

  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  reviewedAt: {
    type: Date,
  },

  rejectionReason: {
    type: String,
    trim: true,
  },
  successStory: {
    type: String,
    trim: true,
    required: false
  },
  fundedAmount: {
    type: Number,
    required: false,
    default: 0,
  },
},
  {
    timestamps: true,
  }
);
//dashboard filtering

applicationSchema.index({
  applicationPeriod: 1,
  status: 1
})

// Tracking
applicationSchema.index({
  'contact.email': 1,
  'personal.dob': 1,
});

// Admin search
applicationSchema.index({
  'personal.name': 'text',
  'grant.projectName': 'text',
  'contact.email': 'text',
});

export const Application = model<IApplication, ApplicationModel>('Application', applicationSchema);
