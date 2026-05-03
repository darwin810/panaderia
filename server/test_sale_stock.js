require('dotenv').config();
const db = require('./config/db');
const SaleModel = require('./models/saleModel');

async function test() {
  try {
    // 1. Set stock of product 14 to 2
    await db.query('UPDATE productos SET stock = 2 WHERE id = 14');
    console.log('Stock updated to 2');
    
    // 2. Perform a sale of 2 items
    const items = [{
      producto_id: 14,
      nombre_producto: 'Agua mineral',
      cantidad: 2,
      precio_unitario: 2.00,
      subtotal: 4.00
    }];
    
    await SaleModel.create({
      usuario_id: 1,
      puesto: 'Caja 1',
      total: 4.00,
      metodo_pago: 'efectivo',
      boleta_impresa: false,
      items
    });
    
    console.log('Sale created!');
    
    // 3. Check stock
    const { rows } = await db.query('SELECT stock FROM productos WHERE id = 14');
    console.log('Stock after sale:', rows[0].stock);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
