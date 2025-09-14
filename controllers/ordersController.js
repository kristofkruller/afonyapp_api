const refreshToken = require('../middleware/refreshToken');
const pool = require('./pool');

const orders = async (req, res) => {
  try {
    const decoded = req.user;
    const orders = await pool.query(`
      WITH amount_data as (
        select
          ao.id as id,
          ao.kg as amount,
          ROUND(ao."cost",0) as cost
        from afonyapp.amount_options ao
        where ao.isvalid = true 
      )
      SELECT 
        o.id,
        ad.amount,
        o.deliverytype,
        o.cdate,
        o.status,
        ad.cost
      FROM afonyapp.orders o
        INNER JOIN afonyapp.users u ON o.email = u.email
        INNER JOIN amount_data ad on o.amountid = ad.id
        WHERE o.email = $1
    `, [decoded.email]);

    if (orders.rowCount < 1) return res.status(204).json({ orders: [] }); // 204 No Content

    // refresh
    const token = refreshToken(decoded);

    // console.debug(orders.rows);
    return res.json({ orders: orders.rows, token: token });

  } catch (error) {
    console.error('orders err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (orders)' })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (id < 1 || !status) return res.status(400).json({ message: 'Hiányzó vagy hibás paraméterek' });
    const result = await pool.query(`
      UPDATE afonyapp.orders
      SET status = $2
      WHERE id = $1
    `, [id, status]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Rendelés nem található' });
    }
    return res.status(200).json({ message: 'Rendelés státusza frissítve' });
  } catch (error) {
    console.error('orders status upd err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (updateOrderStatus)' })
  }
}

const getOrderOptions = async (_, res) => {
  try {
    const amountOptions = await pool.query(`
      SELECT
        id, kg, ROUND(cost,0) as cost
      FROM afonyapp.amount_options
      WHERE isvalid = true
    `);
    if (amountOptions.rowCount === 0) {
      return res.status(404).json({ message: 'Mennyiségi adatok nem találhatóak' });
    }
    const deliveryOptions = await pool.query(`
      SELECT
        id, city, ROUND(cost,0) as cost
      FROM afonyapp.delivery_options
      WHERE isvalid = true AND id > 1
    `);
    if (deliveryOptions.rowCount === 0) {
      return res.status(404).json({ message: 'Kiszállítási adatok nem találhatóak' });
    }
    return res.status(200).json({ amount_options: amountOptions.rows, delivery_options: deliveryOptions.rows });
  } catch (error) {
    console.error('get orderoptions err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (getOrderOptions)' })
  }
}

const registerNewOrder = async (req, res) => {
  try {
    const { email } = req.user;
    const { order } = req.body;
    const register = await pool.query(`
      INSERT
      INTO afonyapp.orders (cropid, deliverytype, deliverycity, deliveryaddress, email, name, telephone, amountid, status)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [order.cropid, order.deliverytype, order.deliveryCity, order.deliveryAddress, email, order.name, order.telephone, order.amount, order.status]);
    if (register.rowCount === 0) {
      return res.status(404).json({ message: 'Database transaction unsuccessful' });
    }

    return res.status(200).json({ message: "Új rendelés sikeresen rögzítésre került" });
  } catch (error) {
    console.error('registerNewOrder err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (registerNewOrder)' })
  }
}

module.exports = {
  orders,
  updateOrderStatus,
  getOrderOptions,
  registerNewOrder,
};