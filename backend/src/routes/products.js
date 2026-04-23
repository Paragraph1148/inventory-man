// src/routes/products.js
import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import pool from "../config/db.js";
const router = express.Router();

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         p.*,
         p.stock - COALESCE(SUM(r.quantity), 0) AS available_stock
       FROM products p
       LEFT JOIN stock_reservations r 
         ON r.product_id = p.id 
         AND r.expires_at > NOW()
       GROUP BY p.id
       ORDER BY p.name`,
    );

    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  const { name, unit, hsnCode, description, taxPercent, mrp, stock } = req.body;

  if (stock < 0) {
    return res.status(400).json({ error: "Stock cannot be negative" });
  }

  try {
    const [r] = await pool.query(
      `INSERT INTO products (name, unit, stock, hsn_code, description, tax_percent, mrp)
         VALUES (?,?,?,?,?,?,?)`,
      [name, unit, stock, hsnCode, description, taxPercent, mrp],
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { name, unit, hsn_code, tax_percent, mrp } = req.body;

    await pool.query(
      `UPDATE products
       SET name=?, unit=?, hsn_code=?, tax_percent=?, mrp=?
       WHERE id=?`,
      [name, unit, hsn_code, tax_percent, mrp, req.params.id],
    );

    res.json({ msg: "Updated" });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ msg: "Deleted successfully" });
  } catch (e) {
    next(e);
  }
});

export default router;
