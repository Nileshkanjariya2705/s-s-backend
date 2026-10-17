import db from './models';
import Category from './models/category.model';
import Products from './models/products.model';
import SupplierProducts from './models/supplierProducts.model';
import Branch from './models/branches.model';
import User from './models/user.model';
import AccountUsers from './models/accountUsers.model';
import BranchUsers from './models/branchUser.model';
import SupportTicket from './models/supportTicket.model';
import PurchaseRequests from './models/purchaseRequest.model';
import PurchaseRequestProducts from './models/purchaseRequestsProduct.model';
import SupplierQuotes from './models/supplierQuotes.model';
import SupplierProductQuotes from './models/supplierProductQuotes.model';
import Orders from './models/orders.model';
import OrderProducts from './models/orderProduct.model';
import PaymentDetail from './models/paymentDetails.model';
import Roles from './models/roles.model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  try {
    await db.authenticate();
    console.log('Database connected successfully.');

    // Constants for our specific Supplier Owner
    const supplier_uuid = '9c390e88-7e5d-4d68-9419-c08c7557bb3a'; // Nilesh Owner User UUID
    const supplier_info_uuid = '79d62166-0fef-41ad-9f5c-ac10e7e4ab43'; // Nilesh Supplier Info UUID

    // Store Owner & Store Info we found in DB
    const store_owner_uuid = '01db7787-dd69-4234-8767-9a03789932f3'; // Store owner
    const store_info_uuid = 'a440d1be-cb0f-4caa-9d7d-f41c8cc5c462'; // Store Info UUID

    // Measurements available in DB
    const kg_measurement_uuid = '0620e4df-627c-4315-8f32-3ffd70aeeef2';

    // 1. Create Role for Supplier Staff if not exists
    let staffRole = await Roles.findOne({ where: { name: 'SUPPLIER_STAFF' } });
    if (!staffRole) {
      staffRole = await Roles.create({
        uuid: uuidv4(),
        name: 'SUPPLIER_STAFF',
        name_ar: 'موظف المورد',
        name_ur: 'سپلائر اسٹاف',
        slug: 'supplier_staff',
        status: 'ACTIVE'
      });
      console.log('Created Supplier Staff role.');
    } else {
      console.log('Supplier Staff role already exists.');
    }

    // 2. Create Category if not exists
    let category = await Category.findOne({ where: { name: 'Fresh Fruits & Vegetables' } });
    if (!category) {
      category = await Category.create({
        uuid: uuidv4(),
        name: 'Fresh Fruits & Vegetables',
        name_ar: 'الفواكه والخضروات الطازجة',
        name_ur: 'تازہ پھل اور سبزیاں',
        status: 'ACTIVE',
        image: ''
      });
      console.log('Created fresh produce category.');
    } else {
      console.log('Category already exists.');
    }

    // 3. Create 10 standard products
    const productNames = [
      { en: 'Fresh Red Tomatoes', ar: 'طماطم حمراء طازجة', ur: 'تازہ سرخ ٹماٹر' },
      { en: 'Organic Potatoes', ar: 'بطاطس عضوية', ur: 'نامیاتی آلو' },
      { en: 'Yellow Onions', ar: 'بصل أصفر', ur: 'پیلا پیاز' },
      { en: 'Premium Bananas', ar: 'موز ممتاز', ur: 'اعلیٰ معیار کے کیلے' },
      { en: 'Royal Gala Apples', ar: 'تفاح رويال جالا', ur: 'رائل گالا سیب' },
      { en: 'White Garlic', ar: 'ثوم أبيض', ur: 'سفید لہسن' },
      { en: 'Fresh Ginger', ar: 'زنجبيل طازج', ur: 'تازہ ادرک' },
      { en: 'Fresh Spinach', ar: 'سبانخ طازجة', ur: 'تازہ پالک' },
      { en: 'Sweet Carrots', ar: 'جزر حلو', ur: 'میٹھی گاجر' },
      { en: 'Green Broccoli', ar: 'بروكلي أخضر', ur: 'سبز بروکولی' }
    ];

    const seededProducts: Products[] = [];
    for (const name of productNames) {
      let prod = await Products.findOne({ where: { name_en: name.en } });
      if (!prod) {
        prod = await Products.create({
          uuid: uuidv4(),
          name_en: name.en,
          name_ar: name.ar,
          name_ur: name.ur,
          overview_en: `High quality ${name.en} sourced directly from farms.`,
          overview_ar: `عالية الجودة ${name.ar} من المزارع مباشرة.`,
          overview_ur: `براہ راست فارموں سے حاصل کردہ اعلیٰ معیار ${name.ur}۔`,
          description_en: `Fresh and organic ${name.en} sorted and packaged under hygiene standards.`,
          description_ar: `طازجة وعضوية ${name.ar} مرتبة ومعبأة بموجب معايير النظافة.`,
          description_ur: `تازہ اور نامیاتی ${name.ur} حفظان صحت کے اصولوں کے مطابق پیک کیا گیا۔`,
          specification_en: 'Pack of 1kg',
          specification_ar: 'عبوة 1 كجم',
          specification_ur: '1 کلو کا پیک',
          category_uuid: category.uuid,
          measurement_uuid: kg_measurement_uuid,
          images: '',
          featured_image: '',
          status: 'ACTIVE'
        });
        console.log(`Created product: ${name.en}`);
      }
      seededProducts.push(prod);
    }

    // 4. Create 10 Supplier Products
    const seededSupplierProducts: SupplierProducts[] = [];
    for (let i = 0; i < seededProducts.length; i++) {
      const prod = seededProducts[i];
      let suppProd = await SupplierProducts.findOne({
        where: {
          product_uuid: prod.uuid,
          supplier_info_uuid: supplier_info_uuid
        }
      });
      if (!suppProd) {
        const price = (10 + i * 2.5).toFixed(2);
        suppProd = await SupplierProducts.create({
          uuid: uuidv4(),
          product_uuid: prod.uuid,
          supplier_uuid: supplier_uuid,
          supplier_info_uuid: supplier_info_uuid,
          price: price,
          base_price: (parseFloat(price) * 0.9).toFixed(2),
          units: '1',
          is_purchaseable: true,
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          charges: 2.5
        });
        console.log(`Assigned ${prod.name_en} to Supplier at price SR ${price}`);
      }
      seededSupplierProducts.push(suppProd);
    }

    // 5. Create 5 Branches for Nilesh Supplier
    const seededBranches: Branch[] = [];
    const branchData = [
      { name: 'Riyadh Main Distribution Center', city: 'Riyadh', state: 'Riyadh Region', address: 'King Fahd Branch Rd, Al Muruj' },
      { name: 'Jeddah Coastal Hub', city: 'Jeddah', state: 'Makkah Province', address: 'Corniche Rd, Al Hamra' },
      { name: 'Dammam East Coast Hub', city: 'Dammam', state: 'Eastern Province', address: 'King Faisal Rd, Al Amarnah' },
      { name: 'Mecca Delivery Point', city: 'Mecca', state: 'Makkah Province', address: 'Ibrahim Al Khalil Rd, Ash Shubaikah' },
      { name: 'Medina Supply Hub', city: 'Medina', state: 'Al Madinah Province', address: 'King Abdullah Rd, Al Hada' }
    ];

    for (const b of branchData) {
      let branch = await Branch.findOne({ where: { name: b.name, entity_uuid: supplier_info_uuid } });
      if (!branch) {
        branch = await Branch.create({
          uuid: uuidv4(),
          entity_type: 'SUPPLIER',
          entity_uuid: supplier_info_uuid,
          name: b.name,
          address: b.address,
          city: b.city,
          country: 'Saudi Arabia',
          state: b.state,
          status: 'ACTIVE'
        });
        console.log(`Created branch: ${b.name}`);
      }
      seededBranches.push(branch);
    }

    // 6. Create 5 Staff members (User, AccountUser, BranchUser)
    const staffHashedPassword = await bcrypt.hash('Staff@123', 10);
    const staffData = [
      { username: 'nilesh_staff_ahmed', email: 'ahmed.staff@esparkbiz.com', phone: '+966500000001' },
      { username: 'nilesh_staff_khalid', email: 'khalid.staff@esparkbiz.com', phone: '+966500000002' },
      { username: 'nilesh_staff_sarah', email: 'sarah.staff@esparkbiz.com', phone: '+966500000003' },
      { username: 'nilesh_staff_yousef', email: 'yousef.staff@esparkbiz.com', phone: '+966500000004' },
      { username: 'nilesh_staff_fatimah', email: 'fatimah.staff@esparkbiz.com', phone: '+966500000005' }
    ];

    for (let i = 0; i < staffData.length; i++) {
      const s = staffData[i];
      let user = await User.findOne({ where: { email: s.email } });
      if (!user) {
        user = await User.create({
          uuid: uuidv4(),
          username: s.username,
          email: s.email,
          password: staffHashedPassword,
          phone: s.phone,
          is_active: true
        });

        // AccountUsers
        await AccountUsers.create({
          uuid: uuidv4(),
          entity_type: 'SUPPLIER',
          entity_uuid: supplier_info_uuid,
          user_uuid: user.uuid,
          role_uuid: staffRole.uuid
        });

        // Link to one of the seeded branches
        const branchIndex = i % seededBranches.length;
        await BranchUsers.create({
          uuid: uuidv4(),
          user_uuid: user.uuid,
          branch_uuid: seededBranches[branchIndex].uuid,
          status: 'ACTIVE'
        });

        console.log(`Created staff member: ${s.username} and linked to branch ${seededBranches[branchIndex].name}`);
      }
    }

    // 7. Create 5 Support Tickets for Supplier Nilesh
    const ticketSubjects = [
      'Delayed Commission Invoice Processing',
      'API Sync Failure with Riyadh Inventory',
      'Request to Add New Product Categories',
      'Bank Commission Transfer Mismatch',
      'Billing Dispute for Order VAT Calculations'
    ];

    for (let i = 0; i < ticketSubjects.length; i++) {
      const subject = ticketSubjects[i];
      let ticket = await SupportTicket.findOne({ where: { subject: subject, entity_uuid: supplier_info_uuid } });
      if (!ticket) {
        const statuses = ['NEW', 'OPEN'];
        const status = statuses[i % statuses.length];
        ticket = await SupportTicket.create({
          uuid: uuidv4(),
          entity_type: 'SUPPLIER_OWNER',
          entity_uuid: supplier_info_uuid,
          admin_uuid: 'f29395e1-b97d-4278-8a79-8182299cb3a7',
          subject: subject,
          ticket_number: 100000 + i,
          status: status
        });
        console.log(`Created support ticket #${100000 + i}: ${subject} (Status: ${status})`);
      }
    }

    // 8. Create 5 Purchase Requests, Quotes, and Orders to generate stats & history
    for (let i = 0; i < 5; i++) {
      const prUuid = uuidv4();
      const quoteUuid = uuidv4();
      const orderUuid = uuidv4();

      // Create Purchase Request from Store Dev Local
      const pr = await PurchaseRequests.create({
        uuid: prUuid,
        requester_uuid: store_owner_uuid,
        store_info_uuid: store_info_uuid,
        supplier_info_uuid: supplier_info_uuid,
        quotes_accepted_upto: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        offer_for_entire_request: true,
        status: 'COMPLETED',
        total_price: 1500 + i * 500,
        is_closed: true
      });

      // Create Purchase Request Products (link 2 products from our seeded list)
      const prProd1 = await PurchaseRequestProducts.create({
        uuid: uuidv4(),
        purchase_request_uuid: prUuid,
        product_uuid: seededProducts[i * 2].uuid,
        category_uuid: category.uuid,
        requested_price: parseFloat(seededSupplierProducts[i * 2].price),
        requested_quantity: 50,
        is_purchased: true
      });

      const prProd2 = await PurchaseRequestProducts.create({
        uuid: uuidv4(),
        purchase_request_uuid: prUuid,
        product_uuid: seededProducts[i * 2 + 1].uuid,
        category_uuid: category.uuid,
        requested_price: parseFloat(seededSupplierProducts[i * 2 + 1].price),
        requested_quantity: 40,
        is_purchased: true
      });

      console.log(`Created Purchase Request: ${prUuid} for Store`);

      // Create Supplier Quote
      const quote = await SupplierQuotes.create({
        uuid: quoteUuid,
        quoted_by: supplier_uuid,
        supplier_info_uuid: supplier_info_uuid,
        purchase_request_uuid: prUuid,
        is_paid: true,
        payment_method: 'BANK_TRANSFER',
        charges_and_total: pr.total_price + 15,
        charges: 15
      });

      // Create Supplier Product Quotes
      await SupplierProductQuotes.create({
        uuid: uuidv4(),
        purchase_request_products_uuid: prProd1.uuid,
        supplier_quotes_uuid: quoteUuid,
        offered_price: prProd1.requested_price,
        offered_quantity: prProd1.requested_quantity,
        is_approved: true
      });

      await SupplierProductQuotes.create({
        uuid: uuidv4(),
        purchase_request_products_uuid: prProd2.uuid,
        supplier_quotes_uuid: quoteUuid,
        offered_price: prProd2.requested_price,
        offered_quantity: prProd2.requested_quantity,
        is_approved: true
      });

      console.log(`Created Sent Quote: ${quoteUuid}`);

      // Create Order
      const statuses = ['ACCEPTED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED'];
      const orderStatus = statuses[i % statuses.length];
      const order = await Orders.create({
        uuid: orderUuid,
        created_by: store_owner_uuid,
        purchase_request_id: prUuid,
        store_info_uuid: store_info_uuid,
        supplier_info_uuid: supplier_info_uuid,
        status: orderStatus,
        payment_mode: 'BANK_TRANSFER',
        vat_percentage: 15,
        amount_without_vat: pr.total_price,
        branch_uuid: seededBranches[i % seededBranches.length].uuid
      });

      // Create Order Products
      await OrderProducts.create({
        uuid: uuidv4(),
        order_id: orderUuid,
        product_uuid: seededProducts[i * 2].uuid,
        price: prProd1.requested_price.toString(),
        quantity: prProd1.requested_quantity
      });

      await OrderProducts.create({
        uuid: uuidv4(),
        order_id: orderUuid,
        product_uuid: seededProducts[i * 2 + 1].uuid,
        price: prProd2.requested_price.toString(),
        quantity: prProd2.requested_quantity
      });

      // Create Successful Payment Details (which will make the total earnings show on Dashboard!)
      await PaymentDetail.create({
        uuid: uuidv4(),
        order_id: orderUuid,
        payment_status: 'SUCCESS',
        payment_method_type: 'BANK_TRANSFER',
        amount: pr.total_price * 1.15 // Including 15% VAT
      });

      console.log(`Created Order ${orderUuid} (Status: ${orderStatus}) with successful payment of SR ${(pr.total_price * 1.15).toFixed(2)}`);
    }

    console.log('\n======================================');
    console.log('🎉 SUCCESSFULLY SEEDED ALL DUMMY DATA 🎉');
    console.log('======================================\n');

  } catch (error) {
    console.error('Error during data seeding:', error);
  } finally {
    await db.close();
  }
}

main();
