import pool from "../config/database.js";

export async function requireAdmin(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT role FROM users WHERE id = ? LIMIT 1",
      [req.user.id],
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Tài khoản không còn tồn tại." });
    }

    if (rows[0].role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền quản trị." });
    }

    req.user.role = rows[0].role;
    next();
  } catch (error) {
    next(error);
  }
}
