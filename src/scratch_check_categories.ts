import db from './models';
import Category from './models/category.model';
import Measurement from './models/measurement.model';

async function main() {
  try {
    await db.authenticate();
    console.log('Database connected.');

    const categories = await Category.findAll();
    console.log('Categories:');
    categories.forEach(c => console.log(`- Category: ${c.name_en}, UUID: ${c.uuid}`));

    const measurements = await Measurement.findAll();
    console.log('\nMeasurements:');
    measurements.forEach(m => console.log(`- Measurement: ${m.unit_name}, UUID: ${m.uuid}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
  }
}

main();
