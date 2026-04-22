// src/routes/lookup.js
import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import pool from "../config/db.js";
const router = express.Router();

/* GET /states – all states */
router.get("/states", requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM states ORDER BY name",
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

/* GET /cities?stateId=xx – cities filtered by state */
router.get("/cities", requireAdmin, async (req, res, next) => {
  const { stateId } = req.query;
  if (!stateId) return res.status(400).json({ msg: "stateId required" });
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM cities WHERE state_id = ? ORDER BY name",
      [stateId],
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

export default router;
