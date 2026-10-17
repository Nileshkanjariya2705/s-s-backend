// =================== import packages ====================
import * as path from 'path';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { MAIL_FROM, MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, SERVER_URL } from '@/config';
// const filePath = path.join(__dirname, '../views');
export const sendMail = async (
  to: string[],
  subject: string,
  templateName: string,
  replacement?: object,
  _attachments?: any,
  _cc?: string[],
  _bcc?: string[],
) => {
  try {
    const newReplacement = { ...replacement, SERVER_URL };
    let filePath = '';
    if (templateName) {
      filePath = path.join(__dirname, `../templates/${templateName}.ejs`);
    } else {
      filePath = path.join(__dirname, '../templates/index.ejs');
    }
    const result = await ejs.renderFile(filePath, newReplacement);
    let transport = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      auth: {
        user: MAIL_FROM,
        pass: MAIL_PASSWORD,
      },
    });
    let mailOptions = {};
    if (_attachments) {
      mailOptions = {
        from: MAIL_FROM,
        to: to,
        subject,
        html: result,
        attachments: [
          {
            filename: _attachments,
            path: path.join(__dirname, `../../public/pdf/${_attachments}`),
            encoding: 'base64',
          },
        ],
      };
    } else {
      mailOptions = {
        from: MAIL_FROM,
        to: to,
        subject,
        html: result,
      };
    }

    try {
      await transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          return error.message;
        } else {
          return 'Mail Sent';
        }
      });
    } catch (err) {
      return err.message;
    }
  } catch (error) {
    throw new Error(error);
  }
};
