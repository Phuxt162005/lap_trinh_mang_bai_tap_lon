import { Router } from "express";
import pool from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const keyword = String(req.query.q || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

    let sql = `
      SELECT id, title, artist, album, duration_seconds, audio_url, cover_url, created_at
      FROM songs
    `;
    const params = [];

    if (keyword) {
      sql += " WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?";
      const pattern = `%${keyword}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += " ORDER BY created_at DESC, id DESC LIMIT ?";
    params.push(limit);

    const [songs] = await pool.execute(sql, params);
    res.json({ songs });
  } catch (error) {
    next(error);
  }
});

export default router;
