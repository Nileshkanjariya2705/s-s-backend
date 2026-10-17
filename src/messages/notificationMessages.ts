export const SIGNUP_NOTIFICATIONS = Object.freeze({
  ADMIN_STORE_SIGNUP_EN: (id: string) => `New store has signed up with id #${id.slice(0, 8)}`,
  ADMIN_STORE_SIGNUP_AR: (id: string) => `تم التسجيل بمتجر جديد برقم ${id.slice(0, 8)}`,
  ADMIN_STORE_SIGNUP_UR: (id: string) => `نیا اسٹور آئی ڈی کے ساتھ سائن اپ کیا ہے #${id.slice(0, 8)}`,
  ADMIN_SUPPLIER_SIGNUP_EN: (id: string) => `New supplier has signed up with id #${id.slice(0, 8)}`,
  ADMIN_SUPPLIER_SIGNUP_AR: (id: string) => `تم التسجيل بمورد جديد برقم #${id.slice(0, 8)}`,
  ADMIN_SUPPLIER_SIGNUP_UR: (id: string) => `نیا سپلائر آئی ڈی کے ساتھ سائن اپ کیا ہے #${id.slice(0, 8)}`,
});
export const ORDERS_NOTIFICATIONS = Object.freeze({
  STORE_ORDER_STATUS_CHANGE_EN: (order_id: string, status: string) =>
    `Status of your order #${order_id} is changed to ${status}`,
  STORE_ORDER_STATUS_CHANGE_AR: (order_id: string, status: string) =>
    `تم تغيير حالة طلبك #${order_id.slice(0, 8)} إلى ${status}`,
  STORE_ORDER_STATUS_CHANGE_UR: (order_id: string, status: string) =>
    `آپ کے آرڈر #${order_id} کی حالت ${status} پر تبدیل کر دی گئی ہے`,

  SUPPLIER_NEW_ORDER_EN: (order_id: string, name: string) =>
    `New order #${order_id.slice(0, 8)} has been created by store ${name}`,
  SUPPLIER_NEW_ORDER_AR: (order_id: string, name: string) =>
    `تم إنشاء طلب جديد #${order_id.slice(0, 8)} من قبل متجر ${name}`,
  SUPPLIER_NEW_ORDER_UR: (order_id: string, name: string) =>
    `نیا آرڈر #${order_id} کا اشتعال ہوا ہے جسے متجر ${name} نے بنایا ہے`,

    SUPPLIER_ORDER_NEW_REPLACEMENT_REQUEST_EN:(order_id:string)=> `${order_id} Requested to replace the order`,
    SUPPLIER_ORDER_NEW_REPLACEMENT_REQUEST_AR: (order_id: string) => `${order_id} تم طلب استبدال الطلب`,
    SUPPLIER_ORDER_NEW_REPLACEMENT_REQUEST_UR: (order_id: string) => `${order_id} کواکتا پارسل تبدیل کرنے کے لیے درخواست کی گئی ہے`,

    SUPPLIER_ORDER_REPLACEMENT_APPROVAL_EN:(order_id: string) => `Your replacement order ${order_id} has been Approved by supplier`,
    SUPPLIER_ORDER_REPLACEMENT_APPROVAL_AR:(order_id:string)=>`تمت الموافقة على طلب الاستبدال الخاص بك ${order_id} من قبل المورد`,
    SUPPLIER_ORDER_REPLACEMENT_APPROVAL_UR:(order_id:string)=>`آپ کی تبدیلی کا آرڈر ${order_id} کو سپلائر نے منظور کر لیا ہے`,

    SUPPLIER_ORDER_REPLACEMENT_REJECTED_EN:(order_id: string) => `Your replacement order ${order_id} has been Rejected by supplier`,
    SUPPLIER_ORDER_REPLACEMENT_REJECTED_AR:(order_id:string)=>`لقد تم رفض طلب الاستبدال الخاص بك ${order_id} من قبل المورد`,
    SUPPLIER_ORDER_REPLACEMENT_REJECTED_UR:(order_id:string)=>`آپ کی تبدیلی کا آرڈر ${order_id} کو سپلائر نے مسترد کر دیا ہے`,

    SUPPLIER_ORDER_NEW_REFUND_REQUEST_EN:(order_id:string)=> `${order_id} Requested to refund the order`,
    SUPPLIER_ORDER_NEW_REFUND_REQUEST_AR: (order_id: string) => `${order_id} طلبت استرداد النظام`,
    SUPPLIER_ORDER_NEW_REFUND_REQUEST_UR: (order_id: string) => `${order_id} آرڈر کی واپسی کی درخواست کی۔`,

    SUPPLIER_ORDER_REFUND_APPROVAL_EN:(order_id: string) => `Your refund order ${order_id} has been Approved by supplier`,
    SUPPLIER_ORDER_REFUND_APPROVAL_AR:(order_id:string)=>`لقد تمت الموافقة على طلب استرداد المبلغ ${order_id} من قبل المورد`,
    SUPPLIER_ORDER_REFUND_APPROVAL_UR:(order_id:string)=>`آپ کے ریفنڈ آرڈر ${order_id} کو سپلائر نے منظور کر لیا ہے۔`,

    SUPPLIER_ORDER_REFUND_REJECTED_EN:(order_id: string) => `Your refund order ${order_id} has been Rejected by supplier`,
    SUPPLIER_ORDER_REFUND_REJECTED_AR:(order_id:string)=>`لقد تم رفض طلب استرداد المبلغ ${order_id} من قبل المورد`,
    SUPPLIER_ORDER_REFUND_REJECTED_UR:(order_id:string)=>`آپ کے ریفنڈ آرڈر ${order_id} کو سپلائر نے مسترد کر دیا ہے۔`,

    ADMIN_NEW_REFUND_REQUEST_EN:(order_id:string)=> `${order_id} Requested to refund the order`,
    ADMIN_NEW_REFUND_REQUEST_AR:(order_id:string)=>  `${order_id} طلبت استرداد النظام`,
    ADMIN_NEW_REFUND_REQUEST_UR:(order_id:string)=>`${order_id} آرڈر کی واپسی کی درخواست کی۔`,


});
export const SUPPORT_TICKET_NOTIFICATIONS = Object.freeze({
  SUPPORT_TICKET_REPLY_EN: (id: string) => `You have received a reply on support ticket #${id.slice(0, 8)}`,
  SUPPORT_TICKET_REPLY_AR: (id: string) => `لقد تلقيت ردًا على تذكرة الدعم #${id.slice(0, 8)}`,
  SUPPORT_TICKET_REPLY_UR: (id: string) => `آپ کو سپورٹ ٹکٹ #${id.slice(0, 8)} پر جواب مل گیا ہے`,
  SUPPORT_TICKET_CREATED_EN: (id: string) => `New support ticket #${id.slice(0, 8)} received`,
  SUPPORT_TICKET_CREATED_AR: (id: string) => `تم استلام تذكرة دعم جديدة #${id.slice(0, 8)}`,
  SUPPORT_TICKET_CREATED_UR: (id: string) => `نیا سپورٹ ٹکٹ #${id.slice(0, 8)} موصول ہوگیا ہے`,
});
export const CHAT_NOTIFICATIONS = Object.freeze({
  NEW_MESSAGE_RECEIVED_EN: (name: string) => `${name} has sent you a message`,
  NEW_MESSAGE_RECEIVED_AR: (name: string) => `${name} قام بإرسال رسالة لك`,
  NEW_MESSAGE_RECEIVED_UR: (name: string) => `${name} نے آپ کو ایک پیغام بھیجا ہے`,
});

export const PURCHASE_REQUEST_NOTIFICATIONS = Object.freeze({
  PURCHASE_REQUEST_EXPIRED_EN: (id: string) => `Purchase request #${id.slice(0, 8)} has expired`,
  PURCHASE_REQUEST_EXPIRED_AR: (id: string) => `انتهت طلب الشراء #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_EXPIRED_UR: (id: string) => `خریداری کی درخواست #${id.slice(0, 8)} کی میعاد ختم ہوگئی ہے`,

  PURCHASE_REQUEST_QUOTED_EN: (id: string, name: string) =>
    `#${name.slice(0, 8)} has quoted on the purchase request #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_QUOTED_AR: (id: string, name: string) =>
    `#${name.slice(0, 8)} قام بعرض سعر على طلب الشراء #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_QUOTED_UR: (id: string, name: string) =>
    `#${name.slice(0, 8)} نے خریداری کی درخواست #${id.slice(0, 8)} پر قیمت کا اعلان کیا ہے`,

  PURCHASE_REQUEST_REQUEST_QUOTE_EN: (id: string, name: string) =>
    `#${name.slice(0, 8)} has sent you a request for a quote on purchase request #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_REQUEST_QUOTE_AR: (id: string, name: string) =>
    `#${name.slice(0, 8)} قد أرسل إليك طلب للحصول على عرض سعر على طلب الشراء #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_REQUEST_QUOTE_UR: (id: string, name: string) =>
    `#${name.slice(0, 8)} نے آپ کو خریداری کی درخواست #${id.slice(0, 8)} پر ایک معاشرتی بیان کے لئے بھیج دیا ہے`,

  PURCHASE_REQUEST_QUOTE_REJECTED_EN: (id: string, name: string) =>
    `${name} has rejected your quote for purchase request #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_QUOTE_REJECTED_AR: (id: string, name: string) =>
    `رفض ${name} عرض الأسعار الخاص بك لطلب الشراء #${id.slice(0, 8)}`,
  PURCHASE_REQUEST_QUOTE_REJECTED_UR: (id: string, name: string) =>
    `${name} نے آپ کی خریداری کی درخواست کے لئے آپ کی پیشکش کو مسترد کر دیا ہے #${id.slice(0, 8)}`,

  PURCHASE_REQUEST_CLOSED_EN: (id: string) => `Purchase request #${id.slice(0, 8)} closed`,
  PURCHASE_REQUEST_CLOSED_AR: (id: string) => `طلب الشراء ${id.slice(0, 8)} مغلق`,
  PURCHASE_REQUEST_CLOSED_UR: (id: string) => `خریداری کی درخواست  #${id.slice(0, 8)} بند`,
});

export const PAYMENT_NOTIFICATIONS = Object.freeze({
  NEW_PAYMENT_APPROVAL_RECEIVED_EN: (name: string, orderId: string) =>
    `${name} has sent an approval for the payment receipt for order #${orderId.slice(0, 8)}.`,
  NEW_PAYMENT_APPROVAL_RECEIVED_AR: (name: string, orderId: string) =>
    `أرسل ${name} موافقة على إيصال الدفع للطلب #${orderId.slice(0, 8)}`,
  NEW_PAYMENT_APPROVAL_RECEIVED_UR: (name: string, orderId: string) =>
    `${name} نے آرڈر #${orderId.slice(0, 8)} کے لیے ادائیگی کی رسید کی منظوری بھیج دی ہے۔`,

  PAYMENT_APPROVED_EN: (id: string) => `Admin has approved your payment for (Bank Transfer) Purchase Request #${id.slice(0, 8)}`,
  PAYMENT_APPROVED_AR: (id: string) => `لقد وافق المشرف على دفعتك مقابل طلب الشراء #${id.slice(0, 8)}`,
  PAYMENT_APPROVED_UR: (id: string) =>
    `ایڈمن نے خریداری کی درخواست #${id.slice(0, 8)} کے لیے آپ کی ادائیگی کی منظوری دے دی ہے۔`,
  PAYMENT_DECLINE_EN: (id: string) => `Admin has declined your payment for Purchase Request #${id.slice(0, 8)}`,
  PAYMENT_DECLINE_AR: (id: string) => `لقد وافق المشرف على دفعتك مقابل طلب الشراء #${id.slice(0, 8)}`,
  PAYMENT_DECLINE_UR: (id: string) =>
    `ایڈمن نے خریداری کی درخواست #${id.slice(0, 8)} کے لیے آپ کی ادائیگی کی منظوری دے دی ہے۔`,
});

export const LINK_TO_ENTITY = Object.freeze({
  PURCHASE_REQUEST: (id: string) => `PURCHASE_REQUEST:${id}`,
  PURCHASE_REQUEST_CLOSED: (id: string) => `PURCHASE_REQUEST_CLOSED:${id}`,
  PURCHASE_REQUEST_REJECT: (id: string) => `PURCHASE_REQUEST_REJECT:${id}`,
  ORDERS: (id: string) => `ORDER:${id}`,
  NEW_ORDER_REPLACEMENT:(id:string)=>`NEW_ORDER_REPLACEMENT:${id}`,
  ORDER_REPLACEMENT_APPROVAL:(id:string)=>`ORDER_REPLACEMENT_APPROVAL:${id}`,
  ORDER_REPLACEMENT_REJECT:(id:string)=>`ORDER_REPLACEMENT_REJECT:${id}`,
  NEW_ORDER_REFUND:(id:string)=>`NEW_ORDER_REFUND:${id}`,
  ORDER_REFUND_APPROVAL:(id:string)=>`ORDER_REFUND_APPROVAL:${id}`,
  ORDER_REFUND_REJECT:(id:string)=>`ORDER_REFUND_REJECT:${id}`,
  SUPPORT_TICKET: (id: string) => `SUPPORT_TICKET:${id}`,
  CHAT: (id: string) => `CHAT:${id}`,
  STORE_USER: (id: string) => `STORE_USER:${id}`,
  SUPPLIER_USER: (id: string) => `SUPPLIER_USER:${id}`,
  PAYMENT_APPROVAL: (id: string) => `PAYMENT_APPROVAL:${id}`,
});
