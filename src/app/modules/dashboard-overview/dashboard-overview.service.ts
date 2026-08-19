import { USER_ROLES } from '../../../enums/user';
import { Product } from '../book/book.model';

import { User } from '../user/user.model';

const getDashboardOverview = async () => {
  const [totalServices, totalUsers, approvedVendors, pendingVendors] =
    await Promise.all([
      User.countDocuments({
        role: USER_ROLES.USER,
      }),
      User.countDocuments({
        role: USER_ROLES.VENDOR,
        verified: true,
        status: 'active',
      }),
      User.countDocuments({
        role: USER_ROLES.VENDOR,
        verified: false,
        status: 'active',
      }),
      Product.countDocuments(),
    ]);

  return {
    totalServices,
    totalUsers,
    approvedVendors,
    pendingVendors,
  };
};

export const DashboardOverviewServices = {
  getDashboardOverview,
};
