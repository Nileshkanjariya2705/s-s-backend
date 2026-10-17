import db from './models';
import Products from './models/products.model';
import StoreInfo from './models/storesInfo.model';
import PurchaseRequests from './models/purchaseRequest.model';
import Roles from './models/roles.model';

async function main() {
  try {
    await db.authenticate();
    console.log('Database connected.');

    // 1. Roles
    const roles = await Roles.findAll();
    console.log('Available Roles:');
    roles.forEach(r => console.log(`- Role: ${r.name}, UUID: ${r.uuid}`));

    // 2. Products
    const productsCount = await Products.count();
    const products = await Products.findAll({ limit: 5 });
    console.log(`\nTotal standard products in DB: ${productsCount}`);
    console.log('Sample Products:');
    products.forEach(p => console.log(`- Product: ${p.name_en}, UUID: ${p.uuid}`));

    // 3. Store Info
    const stores = await StoreInfo.findAll({ limit: 5 });
    console.log(`\nSample Stores:`);
    stores.forEach(s => console.log(`- Store: ${s.company_name}, UUID: ${s.uuid}`));

    // 4. Purchase Requests
    const reqs = await PurchaseRequests.findAll({ limit: 5 });
    console.log(`\nSample Purchase Requests:`);
    reqs.forEach(r => console.log(`- Request: ${r.uuid}, Status: ${r.status}, Store UUID: ${r.store_info_uuid}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

main();
