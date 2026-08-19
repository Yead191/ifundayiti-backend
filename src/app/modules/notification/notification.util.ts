import { Notification } from './notification.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';

export const sendNotificationToAllUsers = async ({
  title,
  message,
  path,
}: {
  title: string;
  message: string;
  path: string;
}) => {
  const io = global.socketServer;

  // Get all active users
  const users = await User.find({
    status: 'active',
    role: {
      $nin: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    },
    verified: true,
  })
    .select('_id')
    .lean()
    .exec();

  const notifications = users.map(({ _id }) => ({
    receiver: _id,
    sender: null,
    title: title,
    message: message,
    refId: _id,
    path: path,
  }));

  const result = await Notification.insertMany(notifications);
  result.map(({ _id }) => io?.emit(`getNotification::${_id}`, result));

  return result;
};
