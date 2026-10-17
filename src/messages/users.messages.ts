export const USER_MESSAGES = Object.freeze({
  PASSWORD_UPDATED: 'Password_Updated_Toast',
  CREATE: 'User_Create_Toast',
  STAFF_CREATE: 'Staff_Create_Toast',
  CREATE_ERROR: 'Create_Error_Toast',
  UPDATE: 'Update_Toast',
  // DELETE: (ids: number[]) => `${ids?.length > 1 ? 'Selected Users' : 'User'} Deleted Successfully`,
  // DELETE_SPECIFIC: (id: number) => `${id} User Deleted Successfully`,
  // DELETE_OWNER_ERROR: (name: string) => `${name} Is Organization Owner You Can't Delete`,
  DELETE_ERROR: 'Delete_Error_Toast',
  GET: 'Get_Toast',
  GETALL: 'Get_All_Toast',
  UNIQUE_ERROR: 'Unique_Error_Toast',
  UNIQUE_EMAIL_ERROR: 'Unique_Email_Error_Toast',
  UNIQUE_USERNAME_ERROR: 'Unique_Username_Error_Toast',
  NOT_FOUND: 'Not_Found_Toast',
  NOT_FOUND_USER: 'Not_Found_User_Toast',
  // NOT_FOUND_TRANSFER: (user: string | string[]) => `${user} Transfer User Not Exist`,
  // REPORT_TO_ERROR: (user: string | string[]) => `${user} Are Get Other User Report But Their Are Not Report To Anyone`,
  CATCH_RESPONSE: 'Catch_Response_Toast',
  LOGIN: 'Login_Toast',
  USERNAME_OR_PASSWORD_DOES_NOT_MATCH: 'Username_Or_Password_Does_Not_Match_Toast',
  STORE_EXISTS: 'Store_Exists_Toast',
  SUPPLIER_EXISTS: 'Supplier_Exists_Toast',
  MAIL_SENT: 'Mail_Sent_Toast',
  PORFILE_UPDATE: 'Profile_Updated_Toast',
  DEFAULT_ADDRESS_UPDATE: 'Default_Address_Updated_Toast',
  ADDRESS_DELETED: 'Address_Deleted_Toast',
  ADDRESS_DELETE_FAILED: 'Address_Delete_Failed_Toast',
  ADDRESS_IS_DEFAULT: 'Address_Is_Default_Toast',
  ADDRESS_UPDATE_FAILED: 'Address_Update_Failed_Taost',
  ADDRESS_UPDATE_SUCCESS: 'Profile_Update_Success_Toast',
  ADDRESS_FETCHED: 'Address_Fetched_Toast',
  ADDRESS_CREATED: 'Address_Created_Toast',
  USER_DELETED: 'User_Deleted_Toast',
  USER_ASSIGNED_TO_BRANCH: 'User_Assigned_To_Branch_Toast',
  WRONG_USER_OR_PASSWORD: 'Wrong_User_Or_Password_Toast',
  USER_DOES_NOT_EXISTS: 'User_Does_Not_Exists_Toast',
  PASSWORD_DOES_NOT_MATCHED: 'Password_Does_Not_Match_Toast',
  COMPANY_INACTIVE: 'Company_Inactive_Toast',
  SOMEONE_ALREADY_REGISTERED: 'Someone_Already_Registered_Toast',
  USER_INACTIVE: 'User_Inactive_Toast',
  ADMIN_DETAILS_FETCHED: 'Admin_Details_Fetched_Toast',
  VATCHARGES_UPDATED: 'Vat_Upadated_Toast',
  VATCHARGES_GET: 'Vat_Get_Toast',
  CORRECT_MAIL: 'Correct_Mail_Toast',
  TRANSACTION_FETCHED: 'Transaction_Fetched_Toast',
  WEEKLY_GRAPH_DETAIL: 'Weekly_Graph_Detail_Toast',
  CATEGORY_GRAPH_DETAIL: 'Category_Graph_Detail_Toast',
  MAIL_SEND: 'Mail_Send_Toast',
  SUCCESS: 'Success_Toast',
  USER_EXIST: 'User_Exist_Toast',
  RECORD_EXIST: 'Record_Exist_Toast',
  REPLACEDAYS_UPDATED:"Replace_Days_Updated",
  DEFAULT_BANK_COMMISSION_UPDATED:"Default_Bank_Commmission_Updated",
  DEFAULT_ORD_COMMISSION_UPDATED:"Default_Ord_Commmission_Updated"
});
export const ADMIN_MESSAGES = Object.freeze({
  STORE_DATA_FETCHED: 'Store_Data_Fetched_Toast',
  STORE_DATA_UPDATED: 'Store_Data_Updated_Toast',
  STORE_DATA_DELETED: 'Store_Data_Deleted_Toast',
  SUPPLIER_DATA_FETCHED: 'Supplier_Data_Fetched_Toast',
});

export const CMS_MESSAGES = Object.freeze({
  CMS_PAGES_FETCHED: 'Cms_Pages_Fetched_Toast',
  CMS_SPECIFIC_PAGE_FETCHED: 'Cms_Specific_Page_Fetched_Toast',
  CMS_PAGE_UPDATED: 'Cms_Page_Updated_Toast',
  CMS_BLOGS_FETCHED: 'Cms_Blogs_Fetched_Toast',
  CMS_SPECIFIC_PAGE_UPDATED: 'Cms_Specific_Page_Updated_Toast',
  CMS_UNAUTHORIZE_UPDATE_REQUEST: 'Cms_Unauthorize_Update_Request',
  CMS_REVIEW_FETCHED: 'Cms_Review_Fetched_Toast',
  SLUG_EXISTS: 'Slug_Exists_Toast',
  CMS_DATASOURCE_COUNT: 'Cms_Datasource_Count_Toast',
  CMS_UPDATE_SUCCESSFUL: 'Cms_Updated_Toast',
  CMS_DELETED_SUCCESSFUL: 'Cms_Deleted_Toast',
  CMS_CREATED_SUCCESSFUL: 'Cms_Created_Toast',
  CATEGORY_FETCHED: 'Category_Fetched_Toast',
  BLOG_IMAGE_UPLOAD: 'Blog_Image_Upload_Toast',
});

export const TOKEN_MESSAGES = Object.freeze({
  ERROR: 'Error_Toast',
  WRONG_TOKEN_ISSUE: 'Wrong_Token_Issue_Toast',
  TOKEN_INVALID: 'Token_Invalid_Toast',
});

export const CMS_BLOG_MESSAGES = Object.freeze({
  CMS_BLOG_NOT_FOUND: 'Cms_Blog_Not_Found_Toast',
});

export const CMS_CONTACT_MESSAGE = Object.freeze({
  MESSAGE_SENT: 'Message_Sent_Toast',
  FETCH_DATA: 'Fetch_Data_Toast',
  CONTACT_DELETED: 'Contact_Deleted_Toast',
});

export const FAQ_MESSAGES = Object.freeze({
  FAQ_ADDED: 'Faq_Added_Toast',
  FAQ_DATA: 'Faq_Data_Toast',
  FAQ_FETCHED: 'Faq_Fetched_Toast',
  FAQ_UPDATED: 'Faq_Updated_Toast',
  FAQ_DELETED: 'Faq_Deleted_Toast',
});

export const MESUREMENT_MESSAGES = Object.freeze({
  UNIT_ADDED: 'Unit_Added_Toast',
  UNIT_ALREADY_EXIST: 'Unit_Already_Exist_Toast',
  ALL_UNITS_FETCHED: 'All_Units_Fetched_Toast',
  UNIT_FETECHED: 'Unit_Fetched_Toast',
  UNIT_UNAUTHORIZE_UPDATE_REQUEST: 'Unit_Unauthorize_Update_Request_Toast',
  UNIT_UPDATED: 'Unit_Updated_Toast',
  UNIT_DELETED: 'Unit_Deleted_Toast',
  UNIT_ALREADY_ASSIGNED: 'Unit_Already_Assigned_Toast',
});

export const CATEGORY_MESSAGES = Object.freeze({
  CATEGORY_ADDED: 'Category_Added_Toast',
  CATEGORY_DATA: 'Category_Data_Toast',
  CATEGORY_FETCHED: 'Category_Fetched_Toast',
  CATEGORY_UPDATED: 'Category_Updated_Toast',
  CATEGORY_DELETED: 'Category_Deleted_Toast',
  CATEGORY_COULD_NOT_FIND: 'Category_Could_Not_Find_Toast',
  CATEGORY_DUPLICATED: 'Category_Duplicated_Toast',
  CATEGORY_ALREADY_EXISTS: 'Category_Already_Exist_Toast',
  CATEGORY_WISE_PRODUCT: 'Category_Wise_Product_Toast',
  UPDATE_CATEGORY_INACTIVE: 'Update_Category_Inactive_Toast',
  CATEGORY_PRODUCT_INACTIVE: 'Category_Product_Inactive_Toast',
  CATEGORY_PRODUCT_DELETED: 'Category_Product_Deleted_Toast',
  CATEGORY_CAN_NOT_DELETED: 'Category_Can_Not_Deleted_Toast',
});

export const PRODUCT_MESSAGES = Object.freeze({
  PRODUCTS_ADDED: 'Product_Added_Toast',
  PRODUCTS_DATA: 'Product_Data_Toast',
  PRODUCTS_FETCHED: 'Products_Fetched_Toast',
  PRODUCTS_FETCHED_FAILED: 'Products_Fetched_Failed_Toast',
  PRODUCTS_UPDATED: 'Product_Updated_Toast',
  PRODUCTS_UPDATED_FAILED: 'Products_Updated_Failed_Toast',
  PRODUCTS_DELETED: 'Product_Deleted_Toast',
  PRODUCTS_DELETED_FAILED: 'Product_Deleted_Failed_Toast',
  PRODUCTS_COULD_NOT_FIND: 'Product_Could_Not_Find_Toast',
  PRODUCTS_DUPLICATED: 'Product_Duplicated_Toast',
  PRODUCTS_ALREADY_EXISTS: 'Product_Already_Exist_Toast',
  PRODUCTS_ADD_FAILED: 'Products_Add_Failed_Toast',
  PRODUCT_CATEGORY_INACTIVE: 'Product_Category_Inactive_Toast',
  PRODUCT_MEASUREMENT_INACTIVE: 'Product_Measurement_Inactive_Taost',
});

export const SUPPLIER_MESSAGES = Object.freeze({
  SINGLE_SUPPLIER: 'Single_Supplier_Toast',
  FAILED_SINGLE_SUPPLIER: 'Failed_Single_Supplier_Toast',
  UNAUTHORIZE_DELETE_REQUEST: 'Unauthorize_Delete_Request_Taost',
  DELETED_SUCCESSFUL: 'Supplier_Deleted_Toast',
  UPDATED_SUCCESSFUL: 'Supplier_Updated_Toast',
  DATA_FETCHED: 'Supplier_Data_Fetched_Toast',
});

export const SUPPLIER_PRODUCTS_MESSAGES = Object.freeze({
  PRODUCT_ALREADY_EXIST: 'Supplier_Product_Already_Exisit_Toast',
  PRODUCT_FETCHED: 'supplier_Product_Fetched_Toast',
  PRODUCT_ADDED: 'Supplier_Product_Added_Toast',
  CAT_WISE_PRODUCT_FETCHED: 'Cat_Wise_Product_Fetched_Toast',
  PRODUCT_DELETED: 'Supplier_Product_Deleted_Toast',
  SINGLE_PRODUCT_FETCHED: 'Single_Supplier_Product_Fetched_Toast',
  PRODUCT_UPDATED: 'Supplier_Product_Updated_Toast',
  PRODUCTS_UPDATED_FAILED: 'Supplier_Product_Update_Failed_Toast',
  PRODUCTS_FETCHED_FAILED: 'Suppier_Product_Fetched_Failed_Toast',
  SUPPLIER_PRODUCTS_NOT_FOUND: 'Supplier_Product_Not_Found_Toast',
});

// ----------------

export const PURCHASE_REQUEST_MESSAGES = Object.freeze({
  REQUEST_CREATED: 'Request_Created_Toast',
  PURCHASE_REQUEST_FETCHED: 'Purchase_Request_Fetched_Toast',
  PURCHASE_REQUEST_NOT_FETCHED: 'Purchase_Request_Not_Fetched_Toast',
  PURCHASE_REQUEST_DELETED: 'Purchase_Request_Deleted_Toast',
  PURCHASE_REQUEST_DELETED_FAILED: 'Purchase_Request_Delete_Failed_Toast',
  // EXISTING_PURCHASE_REQUEST_FETCHED: 'Existing Purchase Request Fetched Successfully!!',
  PURCHASE_REQUEST_STATUS_UPDATE_FAILED: 'Purchase_Request_Status_Update_Failed_Toast',
  PURCHASE_REQUEST_STATUS_UPDATED: 'Purchase_Request_Status_Updated_Toast',
  PURCHASE_REQUEST_QUOTE_DELETED: 'Purchase_Request_Quote_Deleted_Toast',
  PURCHASE_REQUEST_QUOTE_REJECTED: 'Purchase_Request_Quote_Rejected_Toast',
  PURCHASE_REQUEST_QUOTE_NOT_FIND: 'Purchase_Request_Quote_Not_Found_Toast',
  PURCHASE_REQUEST_FETCHED_FAILED: 'Purchase_Request_Fetch_Failed_Toast',
  PURCHASE_REQUEST_NOT_FOUND: 'Purchase_Request_Not_Found_Toast',
  PURCHASE_REQUEST_QUOTE_DELETED_FAILED: 'Purchase_Request_Quote_Deleted_Failed_Toast',
  SUPPLIER_QUOTE_NOT_FOUND: 'Supplier_Quote_Not_Found_Toast',
  PURCHASE_QUOTE_ACCEPTED: 'Purchase_Request_Quote_Accepted_Toast',
  PURCHASE_REQUEST_CREATED: 'Purchase_Request_Created_Toast',
  PURCHASE_REQUEST_UPDATED: 'Purchase_Request_Updated_Toast',
  PURCHASE_REQUEST_DETAIL_NOT_FOUND: 'Purchase_Request_Detail_Not_Found_Toast',
});

export const SUPPLIER_PRODUCT_QUOTES_MESSAGES = Object.freeze({
  QUOTES_CREATED: 'Quotes_Created_Toast',
  QUOTES_UPDATED: 'Quotes_Updated_Toast',
  PRODUCTS_FETCHED: 'Product_Fetched_Toast',
  QUOTE_DOES_NOT_FOUND: 'Quote_Does_Not_Found_Toast',
});

export const PERMISSION = Object.freeze({
  PERMISSION_FETCHED: 'Permission_Fetched_Toast',
});

export const ORDER_MESSAGES = Object.freeze({
  ORDER_CREATED: 'Order_Created_Toast',
  ORDER_UPDATED: 'Order_Updated_Toast',
  ORDER_DELETED: 'Order_Deleted_Toast',
  ORDER_FETCHED: 'Order_Fetched_Toast',
  ORDER_ADDED: 'Order_Added_Toast',
});

export const SUPPORT_TICKET = Object.freeze({
  SUPPORT_TICKET_CREATED: 'Support_Ticket_Created_Toast',
  SUPPORT_TICKET_UPDATED: 'Support_Ticket_Updated_Toast',
  SUPPORT_TICKET_DELETED: 'Support_Ticket_Deleted',
  SUPPORT_TICKET_FETCHED: 'Support_Ticket_Fetched_Toast',
  SUPPORT_TICKET_CLOSED: 'Support_Ticket_Closed_Toast',
  SUPPORT_TICKET_SEND_REPLY: 'Support_Ticket_Send_Reply_Toast',
});

export const CHAT_MESSAGES = Object.freeze({
  CHAT_CREATED: 'Chat_Created_Toast',
  CHAT_FETCHED: 'Chat_Fetched_Toast',
  ORDER_NOT_FOUND: 'Order_Not_Found',
});

export const PaymentCharge = Object.freeze({
  PaymentChargeCREATED: 'PaymentCharge_Created_Toast',
  PaymentChargeUPDATED: 'PaymentCharge_Updated_Toast',
  PaymentChargeDELETED: 'PaymentCharge_Deleted_Toast',
  PaymentChargeFETCHED: 'PaymentCharge_Fetched_Toast',
  Payment_FAILED: 'Payement_Failed_Toast',
  PAYMENT_DETAILS_NOT_FIND: 'Payment_Details_Not_Found_Toast',
});

export const TRANSACTION_MESSAGES = Object.freeze({
  GENERAL_COUNT_REPORT_FETCH: 'General_Count_Report_Fetch_Toast',
});

export const STORE_MESSSAGES = Object.freeze({
  STORE_NOT_EXIST: 'Store_Not_Exisit_Toast',
  DATA_FETCHED_SUCCESSFULLY: 'Store_Data_Fetched_Toast',
  NOT_FIND_PRODUCT: 'Not_Find_Product_Toast',
  STORE_EXISTS: 'Store_Already_Exists_Toast',
});

export const REVIEWS_MESSAGES = Object.freeze({
  REVIEWS_FETCHED: 'Reviews_Fetched_Toast',
  REVIEWS_ADDED: 'Reviews_Added_Toast',
  REVIEWS_UPDATED: 'Reviews_Updated_Toast',
});

export const STAFF_MESSAGES = Object.freeze({
  ROLE_ADDED: 'Role_Added_Toast',
  ROLE_UPDATED: 'Role_Updated_Toast',
  STAFF_MEMBER_ADDED: 'Staff_Member_Added_Toast',
  STAFF_MEMBER_UPDATED: 'Staff_Member_Updated_Toast',
  STAFF_MEMBER_DELETED: 'Staff_Member_Deleted_Toast',
  ROLE_DELETED: 'Role_Deleted_Toast',
  ROLE_ALREADY_EXISTS: 'Role_Already_Exists_Toast',
  ALREADY_ASSIGNED: 'Role_Already_Assigned_Toast',
  IBAN_NUMBER: 'IBAN_Number_Toast',
  DATA_FETCHED: 'Data_Fetched_Toast',
  UNABLE_DELETE: 'Unable_To_Delete_User_Toast',
  STAFF_MEMBER_FETCHED: 'Staff_Member_Fetched_Toast',
});

export const SAVE_CARD_MESSAGES = Object.freeze({
  CARD_ADDED: 'Card_Added_Toast',
  CARD_FETCHED: 'Card_Fetched_Toast',
  CARD_UPDATED: 'Card_Updated_Toast',
  CARD_DELETED: 'Card_Deleted_Toast',
  UNIQUE_CARD_ERROR: 'Unique_Card_Error_Toast',
  CARD_DOES_NOT_BELONGS_TO_CUSTOMER: 'Card_Does_Not_Belongs_To_Customer_Toast',
  FAILED_CARD_DELETE: 'Failed_Card_Delete_Toast',
});

export const NOTIFICATION_MESSSAGES = Object.freeze({
  NOTIFICATION_DELETED: 'Notification_Deleted_Toast',
});

export const BRANCHES_MESSAGES = Object.freeze({
  BRANCH_FETCHED: 'Branch_Fetched_Toast',
  BRANCH_CREATED: 'Branch_Created_Toast',
  BRANCH_UPDATED: 'Branch_Updated_Toast',
  BRANCH_DELETED: 'Branch_Deleted_Toast',
  BRANCH_EXISTS: 'Branch_Exists_Toast',
});
