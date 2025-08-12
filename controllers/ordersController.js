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

    // console.debug(orders.rows);
    return res.json({ orders: orders.rows });

  } catch (error) {
    console.error('orders err: ', error);
    return res.status(500).json({ message: 'Szerverhiba (orders)' })
  }
}

module.exports = orders;