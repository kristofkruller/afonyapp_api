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
          ao."cost" as cost
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

module.exports = {
  orders,
  updateOrderStatus,
};