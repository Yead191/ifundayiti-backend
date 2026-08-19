import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { AuthHelper } from '../auth/auth.helper';
import { Response } from 'express';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

const createUserToDB = async (payload: Partial<IUser>, res: Response) => {
  const isExist = await User.findOne({ email: payload.email });
  if (isExist) {
    if (isExist.status === 'blocked')
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You don’t have permission to access this content.It looks like your account has been deactivated.',
      );
    if (!isExist.verified) {
      return await AuthHelper.unverifiedAccountHandle(payload.email!, res);
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } },
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findOne({ _id: id }).populate(
    'subscription',
    // 'name start_date end_date status is_trial plan',
  );
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateData: Record<string, any> = {};

  // Root fields
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.image !== undefined) updateData.image = payload.image;
  if (payload.company !== undefined) updateData.company = payload.company;
  if (payload.interest !== undefined) updateData.interest = payload.interest;

  // Vendor Profile
  if (payload.vendorProfile) {
    Object.entries(payload.vendorProfile).forEach(([key, value]) => {
      updateData[`vendorProfile.${key}`] = value;
    });
  }
  //unlink file here
  if (payload.image && isExistUser.image !== payload.image) {
    unlinkFile(isExistUser.image!);
  }

  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );

  return updateDoc;
};

const getAllUsersFromDB = async (query: Record<string, any>) => {
  // const userQuery = new QueryBuilder(User.find({ role: { $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }, verified: true }), query).paginate().sort().search(['name', 'email']).filter().fields()
  const filter: Record<string, any> = {
    role: USER_ROLES.USER,
    verified: true,
  };

  if (query.hasSubscription === 'true') {
    filter.subscription = { $exists: true, $ne: null };
  }

  if (query.hasSubscription === 'false') {
    filter.subscription = { $in: [null, undefined] };
  }

  delete query.hasSubscription;
  const userQuery = new QueryBuilder(
    User.find(filter).populate({
      path: 'subscription',
      // select: 'name start_date end_date',
      // populate: {
      //   path: 'plan',
      //   select: 'name',
      // },
    }),
    query,
  )
    .paginate()
    .sort()
    .search(['name', 'email'])
    .filter()
    .fields();

  const [users, pagination] = await Promise.all([
    userQuery.modelQuery.lean(),
    userQuery.getPaginationInfo(),
  ]);

  return { users, pagination };
};

const getUserService = async (user: JwtPayload, id: any) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id');
  }
  console.log(id);
  let result;

  if (user.role === USER_ROLES.ADMIN) {
    result = await User.findById(id);
  } else {
    result = await User.findById(id).select(
      'name email role company interest verified status',
    );
  }

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return result;
};

// change status of user
const changeStatusOfUser = async (id: string) => {
  const isExistUser = await User.findById(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateStatus = isExistUser.status === 'active' ? 'blocked' : 'active';
  const result = await User.updateOne(
    { _id: id },
    { $set: { status: updateStatus } },
  );
  console.log(result);
  return result;
};

const deleteUserService = async (id: string) => {
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  if (isExistUser.image) {
    unlinkFile(isExistUser.image);
  }
  const result = await User.deleteOne({ _id: id });
  return result;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
  getUserService,
  changeStatusOfUser,
  deleteUserService,
};
