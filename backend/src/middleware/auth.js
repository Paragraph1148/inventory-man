import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = payload.id; // store for later use
    next();
  } catch (e) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
