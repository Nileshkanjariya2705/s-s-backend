import { PaymentDetailsController } from '@/controllers/Payment/paymentDetail.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import ChatRepo from '@/repository/Chat/chat.repository';
import ChatUserRepo from '@/repository/ChatUser/chatUser.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import ReviewsRepository from '@/repository/Reviews/reviews.repository';
import SaveCardRepo from '@/repository/SaveCard/saveCard.repository';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import {
  bankTransferValidation,
  storeBankTransferViewValidation,
} from '@/validationSchema/bankTransfer.validation.schema';
import { retriveCard } from '@/validationSchema/saveCardValidation.schema';

import { Router } from 'express';

class PaymentDetailRoute implements Routes {
  public path = '/payment';
  public router = Router();

  public paymentDetailController = new PaymentDetailsController(
    new PaymentDetailsRepo(),
    new OrderRepo(),
    new OrderProductsRepo(),
    new ChatRepo(),
    new ChatUserRepo(),
    new SupplierQuotesRepo(),
    new AccountUsersRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
    new ReviewsRepository(),
    new SaveCardRepo(),
  );
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`/transaction`).get(verifyToken, this.paymentDetailController.transactionDetails);

    this.router.route(`/weekly-top-seller`).get(verifyToken, this.paymentDetailController.weeklyTopSeller);

    this.router.route(`/category-filter`).get(verifyToken, this.paymentDetailController.categoryReport);

    this.router.route(`${this.path}/charge`).post(verifyToken, this.paymentDetailController.createCharge);

    this.router.route(`/get/payment/charges`).get(verifyToken, this.paymentDetailController.getCharge);

    // this.router.route(`/get/payment/newcharges`).get(verifyToken, this.paymentDetailController.newCharge);

    this.router.route(`/check/payment-status`).get(verifyToken, this.paymentDetailController.checkStatusByOrderId);

    this.router.route(`${this.path}/getAll`).get(verifyToken, this.paymentDetailController.getDetails);

    this.router.route(`${this.path}/getSingleDetail`).get(verifyToken, this.paymentDetailController.getSingleOrderDetail);

    this.router.route(`${this.path}/admin-order-details`).get(verifyToken, this.paymentDetailController.adminOrderDetails);

    this.router.route(`${this.path}/single-admin-order-details`).get(verifyToken, this.paymentDetailController.singleadminOrderDetails);
    
    this.router.route(`${this.path}/single-admin-refundOrder-details`).get(verifyToken, this.paymentDetailController.singleadminRefundOrderDetails);

    this.router.route(`/month-wise-data`).get(verifyToken, this.paymentDetailController.getMonthlySell);

    this.router.route(`/retrive-all-charges`).get(verifyToken, this.paymentDetailController.retriveAllCharge);

    this.router.route(`/admin/payment-details`).get(verifyToken, this.paymentDetailController.adminOrderAndPaymentDetails);

    this.router.route(`/bank-transfer`).post(
      verifyToken,
      uploadMedia.single('pdfFile'),
      (req, res, next) => {
        let key = Object.keys(req.body)[0];
        const requestedContent = JSON.parse(req.body[key]);
        const { error } = bankTransferValidation.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      this.paymentDetailController.createBanktransfer,
    );

    this.router.route(`/admin/approve-bank-payment`).post(verifyToken, this.paymentDetailController.approvePayment);
    this.router.route(`/admin/decline-bank-payment`).post(verifyToken, this.paymentDetailController.declinePayment);

    this.router.route(`/bank-transfer-list`).get(verifyToken, this.paymentDetailController.bankTransferList);

    this.router.route(`/store/bank-transfer-details`).get(
        verifyToken,
        validationMiddleware(storeBankTransferViewValidation, 'query'),
        this.paymentDetailController.bankTransferDetails,
      );

    this.router.route(`/update-receipt`).post(
      verifyToken,
      uploadMedia.single('pdfFile'),
      (req, res, next) => {
        let key = Object.keys(req.body)[0];
        const requestedContent = JSON.parse(req.body[key]);
        const { error } = storeBankTransferViewValidation.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      this.paymentDetailController.updateReceipt,
    );

    this.router.route(`/admin/bank-transfer/list`).get(
      verifyToken,
      this.paymentDetailController.adminBankTransferList,
    );

      this.router.route(`/sendConfirmationMail`).get(verifyToken,this.paymentDetailController.sendConfirmationMail);
      this.router.route(`/sendReplacementStatusMail`).get(verifyToken,this.paymentDetailController.sendReplacementStatusMail);
    this.router
      .route(`/payment/card-list`)
      .get(verifyToken, validationMiddleware(retriveCard, 'query'), this.paymentDetailController.retriveCard);

    this.router.route(`/savecard-payment`).post(verifyToken, this.paymentDetailController.payWithSaveCard);
  }
}

export default PaymentDetailRoute;
