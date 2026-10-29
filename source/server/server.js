import express from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const port = Number(process.env.PORT || 3000);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET phải được cấu hình với ít nhất 32 ký tự.");
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy API." });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);

  res.status(500).json({
    message: "Lỗi máy chủ. Vui lòng thử lại sau.",
  });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
