import App from '@/app';
import IndexRoute from '@routes/index.route';
import AccountRoute from './routes/Authentication/account.route';
import AdminRoute from './routes/Authentication/admin.route';
import ManageProfileRoute from './routes/ManageProfile/manageProfile.route';
import CmsRoute from './routes/Cms/cms.route';
import CmsReviewRoute from './routes/Cms/cmsReview.route';
import CmsBlogRoute from './routes/Cms/blog.route';
import CmsFaqRoute from './routes/Cms/cmsFaq.route';
import MeasurementRoute from './routes/Measurement/mesurement.route';
import StoreRoute from './routes/store/store.routes';
import CategoryRoute from './routes/Category/category.routes';
import SupplierRoute from './routes/Supplier/supplier.route';
import ProductsRoute from './routes/Products/products.route';
import SupplierProductsRoute from './routes/SupplierProduct/supplierProduct.route';
import PurchaseReqestRoute from './routes/PurchaseRequest/purchaseRequest.route';

import SupplierProductQuotesRoute from './routes/SupplierProductQuotes/supplierProductQuotes.routes';
import StaffRoute from './routes/staff/staff.route';
import RolesRoute from './routes/Roles/roles.route';
import PermissionRoute from './routes/Permission/permission.route';
import BranchesRoute from './routes/Branches/branches.route';
import OrderRoute from './routes/Orders/orders.route';
import OrderProductRoute from './routes/OrderProducts/orderProducts.route';
import PaymentDetailRoute from './routes/Payment/payment.details.routes';
import SupportTicketRoute from './routes/SupportTicket/supportTicket.routes';
import SupportTicketMessageRoute from './routes/SupportTicketMessages/supportTicketMessages.routes';
import MessageRoute from './routes/Message/message.route';
import TransactionRoute from './routes/Transaction/transaction.route';
import PurchaseRequestProductsRoutes from './routes/PurchaseRequestProducts/purchaseRequestProducts.routes';
import PurchaseHistoryRoute from './routes/purchaseHistory/purchaseHistory.routes';
import NotificationRoute from './routes/Notification/notification.route';
import NotificationRecieverRoute from './routes/NotificationReciever/notificationReciever.routes';
import AdminSettingsRoute from './routes/AdminSettings/adminSettings.route';
import ReviewsRoute from './routes/Reviews/reviews.route';
import StoreProductReviewsRoute from './routes/StoreProductReviews/storeProductReviews.route';
import SaveCardRoute from './routes/SavedCard/savedCard.route';
import OrderReplacementRoute from './routes/OrderReplacement/orderRelacement.route';
import OrderRefundRoute from './routes/OrderRefund/orderRefund.route';
import { generateStatistic } from './jobs/reportsGenration';
const cron = require('croner');

const app = new App({
  apiRoutes: [
    new IndexRoute(),
    new AccountRoute(),
    new AdminRoute(),
    new ManageProfileRoute(),
    new CmsRoute(),
    new CmsReviewRoute(),
    new CmsBlogRoute(),
    new CmsFaqRoute(),
    new MeasurementRoute(),
    new StoreRoute(),
    new CategoryRoute(),
    new SupplierRoute(),
    new ProductsRoute(),
    new SupplierProductsRoute(),
    new PurchaseReqestRoute(),
    new PurchaseRequestProductsRoutes(),
    new SupplierProductQuotesRoute(),
    new StaffRoute(),
    new RolesRoute(),
    new PermissionRoute(),
    new BranchesRoute(),
    new OrderRoute(),
    new OrderProductRoute(),
    new PaymentDetailRoute(),
    new SupportTicketRoute(),
    new SupportTicketMessageRoute(),
    new MessageRoute(),
    new TransactionRoute(),
    new PurchaseHistoryRoute(),
    new NotificationRoute(),
    new NotificationRecieverRoute(),
    new AdminSettingsRoute(),
    new ReviewsRoute(),
    new StoreProductReviewsRoute(),
    new SaveCardRoute(),
    new OrderReplacementRoute(),
    new OrderRefundRoute(),
  ],
  generalRoutes: [],
});

(async () => {
  cron('0 0 1 * *', { timezone: 'UTC' }, async () => {
    console.log('Running a task at the beginning of every month');
    try {
      await generateStatistic();
      console.log('Task completed successfully');
    } catch (error) {
      console.error('Error occurred during task execution:', error);
    }
  });
})();

app.listen();