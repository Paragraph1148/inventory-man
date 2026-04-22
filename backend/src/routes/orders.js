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
  try {
    const [r] = await pool.query(
      `INSERT INTO orders (member_id,product_id,quantity,order_date)
       VALUES (?,?,?,?)`,
      [memberId, productId, quantity, orderDate],
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  const { memberId, productId, quantity, orderDate } = req.body;

  try {
    await pool.query(
      `UPDATE orders
       SET member_id=?, product_id=?, quantity=?, order_date=?
       WHERE id=?`,
      [memberId, productId, quantity, orderDate, req.params.id],
    );

    res.json({ msg: "Order updated" });
  } catch (e) {
    next(e);
  }
});

export default router;
