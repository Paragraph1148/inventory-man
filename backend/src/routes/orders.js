// src/routes/orders.js
import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import pool from "../config/db.js";
const router = express.Router();

router.get("/", requireAdmin, async (req, res, next) => {
  const { memberId, productId, from, to, page = 1, limit = 30 } = req.query;
  let sql = `SELECT o.*, m.first_name, m.last_name, p.name AS product
             FROM orders o
             JOIN members m ON o.member_id=m.id
             JOIN products p ON o.product_id=p.id WHERE 1=1`;
  const params = [];

  if (memberId) {
    sql += " AND o.member_id=?";
    params.push(memberId);
  }
  if (productId) {
    sql += " AND o.product_id=?";
    params.push(productId);
  }
  if (from) {
    sql += " AND o.order_date>=?";
    params.push(from);
  }
  if (to) {
    sql += " AND o.order_date<=?";
    params.push(to);
  }

  sql += " ORDER BY o.order_date DESC LIMIT ?,?";
  params.push((page - 1) * limit, +limit);

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  const { memberId, productId, quantity, orderDate } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Try to deduct stock atomically
    const [result] = await conn.query(
      `UPDATE products
       SET stock = stock - ?
       WHERE id = ? AND stock >= ?`,
      [quantity, productId, quantity],
    );

    // 2️⃣ If no rows updated → not enough stock
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Insufficient stock",
      });
    }

    // 3️⃣ Create order
    const [order] = await conn.query(
      `INSERT INTO orders (member_id, product_id, quantity, order_date)
       VALUES (?, ?, ?, ?)`,
      [memberId, productId, quantity, orderDate],
    );

    await conn.commit();

    res.status(201).json({ id: order.insertId });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  const { memberId, productId, quantity, orderDate } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Get existing order
    const [[oldOrder]] = await conn.query(
      `SELECT quantity, product_id FROM orders WHERE id=?`,
      [req.params.id],
    );

    if (!oldOrder) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    const oldQty = oldOrder.quantity;
    const oldProductId = oldOrder.product_id;

    // -------------------------------
    // CASE: Product changed
    // -------------------------------
    if (oldProductId !== productId) {
      // Return stock to old product
      await conn.query(`UPDATE products SET stock = stock + ? WHERE id=?`, [
        oldQty,
        oldProductId,
      ]);

      // Deduct from new product (with safety)
      const [result] = await conn.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id=? AND stock >= ?`,
        [quantity, productId, quantity],
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(400).json({
          error: "Insufficient stock for new product",
        });
      }

      await conn.commit();
    } else {
      // -------------------------------
      // CASE: Same product
      // -------------------------------

      // Increase quantity → reduce stock
      // 1️⃣ Return old stock first
      await conn.query(`UPDATE products SET stock = stock + ? WHERE id=?`, [
        oldQty,
        productId,
      ]);

      // 2️⃣ Try deduct new quantity
      const [result] = await conn.query(
        `UPDATE products
   SET stock = stock - ?
   WHERE id=? AND stock >= ?`,
        [quantity, productId, quantity],
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(400).json({
          error: "Insufficient stock",
        });
      }

      // 4️⃣ Update order
      await conn.query(
        `UPDATE orders
       SET member_id=?, product_id=?, quantity=?, order_date=?
       WHERE id=?`,
        [memberId, productId, quantity, orderDate, req.params.id],
      );

      await conn.commit();

      res.json({ msg: "Order updated" });
    }
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

router.post("/reservations", requireAdmin, async (req, res, next) => {
  const { productId, quantity, memberId } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Calculate available stock
    const [[row]] = await conn.query(
      `SELECT 
     p.stock - COALESCE(SUM(r.quantity), 0) +
     COALESCE((
       SELECT quantity FROM stock_reservations 
       WHERE product_id = p.id AND member_id = ?
     ), 0) AS available
   FROM products p
   LEFT JOIN stock_reservations r 
     ON r.product_id = p.id 
     AND r.expires_at > NOW()
   WHERE p.id = ?
   GROUP BY p.id`,
      [memberId, productId],
    );

    if (!row || row.available < quantity) {
      await conn.rollback();
      return res.status(400).json({ error: "Not enough stock" });
    }

    // 2️⃣ Insert OR update reservation
    await conn.query(
      `INSERT INTO stock_reservations (product_id, member_id, quantity, expires_at)
       VALUES (?, ?, ?, NOW() + INTERVAL 5 MINUTE)
       ON DUPLICATE KEY UPDATE 
         quantity = VALUES(quantity),
         expires_at = VALUES(expires_at)`,
      [productId, memberId, quantity],
    );

    await conn.commit();

    res.json({ msg: "Reserved successfully" });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

export default router;
