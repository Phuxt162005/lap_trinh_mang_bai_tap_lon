import { Router } from "express";
import pool from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

    let sql = `
      SELECT a.id, a.name, a.bio, a.image_url, a.created_at,
             COUNT(DISTINCT al.id) AS album_count,
             COUNT(DISTINCT s.id) AS song_count
      FROM artists a
      LEFT JOIN albums al ON al.artist_id = a.id
      LEFT JOIN songs s ON s.artist = a.name
    `;
    const params = [];

    if (q) {
      sql += " WHERE a.name LIKE ? OR a.bio LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " GROUP BY a.id ORDER BY a.name ASC LIMIT ?";
    params.push(limit);

    const [artists] = await pool.execute(sql, params);
    res.json({ artists });
  } catch (error) {
    next(error);
  }
});

export default router;
