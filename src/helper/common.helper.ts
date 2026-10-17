// =================== import packages ==================
import { Response, Express } from 'express';
import bcrypt from 'bcrypt';
import moment from 'moment';
// ======================================================
export const DEFAULT_ENVIRONMENT = 'development';
export const generalResponse = (
  response: Response,
  data: any = null,
  message: string | {} = '',
  responseType = 'success',
  toast = false,
  statusCode = 200,
) => {
  response.status(statusCode).send({
    data,
    message,
    toast,
    responseType,
  });
};

export const isNumeric = (n: any) => {
  // eslint-disable-next-line no-restricted-globals
  return n && !isNaN(parseFloat(n)) && isFinite(n);
};

export const cleanObj = (obj: { [key: string]: any }) => {
  Object.keys(obj).forEach((key: string) => {
    try {
      if (obj[key] === '') {
        obj[key] = null;
      }
      if (!isNumeric(obj[key])) {
        obj[key] = JSON.parse(obj[key]);
      }
    } catch (err) {
      // do nothing
    }
  });
  return obj;
};

export const generatePassword = () => {
  const length = 10;
  let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';

  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword: string = await bcrypt.hash(password, saltRounds);
  return {
    hashedPassword,
    password,
  };
};

export const paymentStatus=  (status: string) => {
  if (status === '000') {
    return 'Payment is Successfull';
  } else if (status === '402') {
    return 'Payment failed with with code 402, Some invalid parameter you can try again';
  } else if (status === '403') {
    return 'Payment failed with with code 403, Duplicate identifier occuured';
  } else if (status === '404') {
    return 'Payment failed with with code 404, Locked';
  } else if (status === '405') {
    return 'Payment failed with with code 405, invalid card number';
  } else if (status === '406') {
    return 'Payment failed with with code 406, card expired';
  } else if (status === '501') {
    return 'Payment failed with with code 501, Incorrect CSC/CVV';
  } else if (status === '503') {
    return 'Payment failed with with code 503, Incorrect 3D Security';
  } else if (status === '504') {
    return 'Payment failed with with code 504, Card not Enrolled';
  } else if (status === '505') {
    return 'Payment failed with with code 505, Insufficient Funds';
  } else {
    return 'Payment failed with unspecified failure';
  }
};

import { LINK_TO_ENTITY } from '@/messages/notificationMessages';
interface Notification {
  related_entity_type: string;
  related_entity_id: string;
  content_en: string;
  content_ar: string;
  content_ur: string;
  link_to_entity: string;
}
export const Create_Notification = (
  notification_type: any,
  notification_message_content: string,
  related_entity_id: string,
  related_entity_type: string,
  entity_uuid?: string,
): Notification => ({
  related_entity_type: related_entity_type,
  related_entity_id: related_entity_id,
  content_en: notification_type[`${notification_message_content}_EN`](related_entity_id, entity_uuid),
  content_ar: notification_type[`${notification_message_content}_AR`](related_entity_id, entity_uuid),
  content_ur: notification_type[`${notification_message_content}_UR`](related_entity_id, entity_uuid),
  link_to_entity: LINK_TO_ENTITY[`${related_entity_type}`](related_entity_id),
});

export const matchPassword = async (enteredPassword: string, truePassword: string) => {
  return await bcrypt.compare(enteredPassword, truePassword);
};

export const entityType = {
  SUPPLIER_OWNER: 'SUPPLIER_OWNER',
  STORE_OWNER: 'STORE_OWNER',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const formatDateString = (dateString) => {
  const date = dateString ? moment(new Date(dateString)).format('YYYY-MM-DD HH:mm:ss') : null;
  return date;
};
export const responseType = {
  SUCCESS: 'success',
  FAILURE: 'failed',
};

export const statusType = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};
