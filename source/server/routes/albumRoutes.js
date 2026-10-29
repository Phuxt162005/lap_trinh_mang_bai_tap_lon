import { Router } from "express";
import pool from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);

    let sql = `
      SELECT al.id, al.title, al.artist_id, al.release_year,
             al.cover_url, al.created_at, a.name AS artist_name
      FROM albums al
      JOIN artists a ON a.id = al.artist_id
    `;
    const params = [];

    if (q) {
      sql += " WHERE al.title LIKE ? OR a.name LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY al.release_year DESC, al.title ASC LIMIT ?";
    params.push(limit);

    const [albums] = await pool.execute(sql, params);
    res.json({ albums });
  } catch (error) {
    next(error);
  }
});

router.get("/:albumId/songs", requireAuth, async (req, res, next) => {
  try {
    const albumId = Number(req.params.albumId);
    if (!Number.isSafeInteger(albumId) || albumId <= 0) {
      return res.status(400).json({ message: "ID album không hợp lệ." });
    }

    const [albums] = await pool.execute(
      `SELECT al.id, al.title, al.artist_id, al.release_year, al.cover_url,
              a.name AS artist_name
       FROM albums al
       JOIN artists a ON a.id = al.artist_id
       WHERE al.id = ? LIMIT 1`,
      [albumId],
    );
    if (!albums.length) {
      return res.status(404).json({ message: "Không tìm thấy album." });
    }

    const album = albums[0];
    const [songs] = await pool.execute(
      `SELECT id, title, artist, album, duration_seconds, audio_url, cover_url
       FROM songs
       WHERE album = ? AND artist = ?
       ORDER BY title ASC, id ASC`,
      [album.title, album.artist_name],
    );

    res.json({ album, songs });
  } catch (error) {
    next(error);
  }
});

export default router;
