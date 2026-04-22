import express from "express";
import { signToken } from "../utils/crypto.js";
import pool from "../config/db.js";
import { comparePassword } from "../utils/crypto.js";

const router = express.Router();

/**
 * POST /admin/login
 * Body: {username, password}
 * Returns: {token}
 */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const [[admin]] = await pool.query(
      `SELECT id, password_hash FROM admins WHERE username = ?`,
      [username],
    );
    if (!admin) return res.status(401).json({ msg: "Bad credentials" });

    const ok = await comparePassword(password, admin.password_hash);
    if (!ok) return res.status(401).json({ msg: "Bad credentials" });

    const token = signToken({ id: admin.id });
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

export default router;
