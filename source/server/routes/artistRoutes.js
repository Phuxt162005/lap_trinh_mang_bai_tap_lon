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

router.get("/:artistId/songs", requireAuth, async (req, res, next) => {
  try {
    const artistId = Number(req.params.artistId);
    if (!Number.isSafeInteger(artistId) || artistId <= 0) {
      return res.status(400).json({ message: "ID nghệ sĩ không hợp lệ." });
    }

    const [artists] = await pool.execute(
      "SELECT id, name, bio, image_url FROM artists WHERE id = ? LIMIT 1",
      [artistId],
    );
    if (!artists.length) {
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ." });
    }

    const [songs] = await pool.execute(
      `SELECT id, title, artist, album, duration_seconds, audio_url, cover_url
       FROM songs WHERE artist = ?
       ORDER BY title ASC, id ASC`,
      [artists[0].name],
    );

    res.json({ artist: artists[0], songs });
  } catch (error) {
    next(error);
  }
});

export default router;
