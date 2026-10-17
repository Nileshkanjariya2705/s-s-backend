import db from './models';
import User from './models/user.model';
import AccountUsers from './models/accountUsers.model';
import SupplierInfo from './models/supplierinfo.model';
import { Op } from 'sequelize';

async function main() {
  try {
    await db.authenticate();
    console.log('Database connected.');

    const users = await User.findAll({
      where: {
        email: {
          [Op.like]: '%nilesh%'
        }
      }
    });

    console.log(`Found ${users.length} users:`);
    for (const user of users) {
      console.log('User Details:', {
        uuid: user.uuid,
        username: user.username,
        email: user.email
      });

      const accountUser = await AccountUsers.findOne({
        where: { user_uuid: user.uuid }
      });

      if (accountUser) {
        console.log('AccountUser Details:', {
          uuid: accountUser.uuid,
          user_uuid: accountUser.user_uuid,
          entity_uuid: accountUser.entity_uuid,
          role_uuid: accountUser.role_uuid
        });

        const supplierInfo = await SupplierInfo.findOne({
          where: { uuid: accountUser.entity_uuid }
        });

        if (supplierInfo) {
          console.log('SupplierInfo Details:', {
            uuid: supplierInfo.uuid,
            company_name: supplierInfo.company_name,
            cr_number: supplierInfo.cr_number
          });
        }
      }
      console.log('-----------------------------------');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

main();
