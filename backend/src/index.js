import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import memberRoutes from "./routes/members.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import { errorHandler } from "./middleware/errorHandler.js";
import lookupRoutes from "./routes/lookup.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies

// ---- routes -------------------------------------------------
app.use("/admin", adminRoutes);
app.use("/members", memberRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/lookup", lookupRoutes);

// ---- catch‑all 404 -----------------------------------------
app.use((req, res) => res.status(404).json({ msg: "Not found" }));

// ---- global error handler ----------------------------------
app.use(errorHandler);

// ---- start -------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
