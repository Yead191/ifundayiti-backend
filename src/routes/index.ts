import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { ProductRoutes, BookRoutes } from '../app/modules/product/product.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { MembershipRoutes } from '../app/modules/membership/membership.route';
import { ApplicationperiodRoutes } from '../app/modules/iFundAyiti/applicationperiod/applicationperiod.route';
import { ApplicationRoutes } from '../app/modules/iFundAyiti/application/application.route';
import { DonationRoutes } from '../app/modules/iFundAyiti/donation/donation.route';
import { ProgramFundRoutes } from '../app/modules/iFundAyiti/programFund/programFund.route';
import { DashboardOverviewRoutes } from '../app/modules/dashboard-overview/dashboard-overview.route';
import { CartRoutes } from '../app/modules/cart/cart.route';
import { TransactionRoutes } from '../app/modules/transaction/transaction.route';
import { OrderRoutes } from '../app/modules/order/order.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { DigitalRoutes } from '../app/modules/digital/digital.route';
import { TestimonialRoutes } from '../app/modules/testimonial/testimonial.route';
import { InquiryRoutes } from '../app/modules/inquiry/inquiry.route';
import { DisclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { CouponRoutes } from '../app/modules/coupon/coupon.route';
import { TeamRoutes } from '../app/modules/team/team.route';
import { ProjectRoutes } from '../app/modules/project/project.route';
import { GalleryRoutes } from '../app/modules/gallery/gallery.route';
import { ProductcategoryRoutes } from '../app/modules/productcategory/productcategory.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },

  {
    path: '/product',
    route: ProductRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/product-category',
    route: ProductcategoryRoutes,
  },
  {
    path: '/productcategory',
    route: ProductcategoryRoutes,
  },
  {
    path: '/books',
    route: BookRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/membership',
    route: MembershipRoutes,
  },
  {
    path: '/period',
    route: ApplicationperiodRoutes,
  },
  {
    path: '/application',
    route: ApplicationRoutes,
  },
  {
    path: '/donation',
    route: DonationRoutes,
  },
  {
    path: '/program-fund',
    route: ProgramFundRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardOverviewRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/transaction',
    route: TransactionRoutes,
  },
  { path: '/order', route: OrderRoutes },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/digital',
    route: DigitalRoutes,
  },
  {
    path: '/testimonial',
    route: TestimonialRoutes,
  },
  {
    path: '/inquiry',
    route: InquiryRoutes,
  },
  {
    path: '/disclaimer',
    route: DisclaimerRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path: '/coupon',
    route: CouponRoutes,
  },
  {
    path: '/team',
    route: TeamRoutes,
  },
  {
    path: '/project',
    route: ProjectRoutes,
  },
  {
    path: '/gallery',
    route: GalleryRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
