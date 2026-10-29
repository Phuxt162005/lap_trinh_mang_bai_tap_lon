import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
    }

    if (name.length > 100 || email.length > 255) {
      return res.status(400).json({
        message: "Họ tên hoặc email vượt quá độ dài cho phép.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ." });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 8 ký tự và không vượt quá giới hạn.",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (existing.length) {
      return res.status(409).json({ message: "Email đã được đăng ký." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      [name, email, passwordHash],
    );

    return res.status(201).json({
      message: "Đăng ký thành công.",
      user: { id: result.insertId, name, email, role: "user" },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email đã được đăng ký." });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu.",
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (
      !rows.length ||
      !(await bcrypt.compare(password, rows[0].password_hash))
    ) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    const user = rows[0];

    return res.json({
      message: "Đăng nhập thành công.",
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id],
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Tài khoản không còn tồn tại." });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
