import { Router } from "express";
import pool from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

async function findOwnedPlaylist(playlistId, userId) {
  const [rows] = await pool.execute(
    "SELECT id, user_id, name, description, created_at FROM playlists WHERE id = ? AND user_id = ? LIMIT 1",
    [playlistId, userId],
  );
  return rows[0] || null;
}

// Lấy playlist của người đang đăng nhập.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const [playlists] = await pool.execute(
      `SELECT p.id, p.name, p.description, p.created_at,
              COUNT(ps.song_id) AS song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC, p.id DESC`,
      [req.user.id],
    );
    res.json({ playlists });
  } catch (error) {
    next(error);
  }
});

// Tạo playlist.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();

    if (!name) {
      return res
        .status(400)
        .json({ message: "Tên playlist không được để trống." });
    }
    if (name.length > 100 || description.length > 500) {
      return res
        .status(400)
        .json({ message: "Tên hoặc mô tả playlist quá dài." });
    }

    const [result] = await pool.execute(
      "INSERT INTO playlists (user_id, name, description) VALUES (?, ?, ?)",
      [req.user.id, name, description || null],
    );

    const [rows] = await pool.execute(
      `SELECT id, name, description, created_at
       FROM playlists WHERE id = ? AND user_id = ?`,
      [result.insertId, req.user.id],
    );

    res.status(201).json({ playlist: { ...rows[0], song_count: 0 } });
  } catch (error) {
    next(error);
  }
});

// Xem các bài hát trong một playlist thuộc sở hữu của người dùng.
router.get("/:playlistId/songs", requireAuth, async (req, res, next) => {
  try {
    const playlist = await findOwnedPlaylist(
      req.params.playlistId,
      req.user.id,
    );
    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist." });
    }

    const [songs] = await pool.execute(
      `SELECT s.id, s.title, s.artist, s.album, s.duration_seconds,
              s.audio_url, s.cover_url, ps.added_at
       FROM playlist_songs ps
       JOIN songs s ON s.id = ps.song_id
       WHERE ps.playlist_id = ?
       ORDER BY ps.added_at DESC`,
      [playlist.id],
    );

    res.json({ playlist, songs });
  } catch (error) {
    next(error);
  }
});

// Thêm bài hát vào playlist.
router.post("/:playlistId/songs", requireAuth, async (req, res, next) => {
  try {
    const playlist = await findOwnedPlaylist(
      req.params.playlistId,
      req.user.id,
    );
    if (!playlist) {
      return res.status(404).json({ message: "Không tìm thấy playlist." });
    }

    const songId = Number(req.body.songId);
    if (!Number.isSafeInteger(songId) || songId <= 0) {
      return res.status(400).json({ message: "Mã bài hát không hợp lệ." });
    }

    const [songs] = await pool.execute(
      "SELECT id FROM songs WHERE id = ? LIMIT 1",
      [songId],
    );
    if (!songs.length) {
      return res.status(404).json({ message: "Không tìm thấy bài hát." });
    }

    const [existing] = await pool.execute(
      "SELECT song_id FROM playlist_songs WHERE playlist_id = ? AND song_id = ?",
      [playlist.id, songId],
    );
    if (existing.length) {
      return res.status(409).json({ message: "Bài hát đã có trong playlist." });
    }

    await pool.execute(
      "INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)",
      [playlist.id, songId],
    );

    res.status(201).json({ message: "Đã thêm bài hát vào playlist." });
  } catch (error) {
    next(error);
  }
});

// Xóa một bài hát khỏi playlist.
router.delete(
  "/:playlistId/songs/:songId",
  requireAuth,
  async (req, res, next) => {
    try {
      const playlist = await findOwnedPlaylist(
        req.params.playlistId,
        req.user.id,
      );
      if (!playlist) {
        return res.status(404).json({ message: "Không tìm thấy playlist." });
      }

      const [result] = await pool.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?",
        [playlist.id, req.params.songId],
      );

      if (!result.affectedRows) {
        return res
          .status(404)
          .json({ message: "Bài hát không có trong playlist." });
      }

      res.json({ message: "Đã xóa bài hát khỏi playlist." });
    } catch (error) {
      next(error);
    }
  },
);

// Xóa playlist của chính người dùng.
router.delete("/:playlistId", requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      "DELETE FROM playlists WHERE id = ? AND user_id = ?",
      [req.params.playlistId, req.user.id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Không tìm thấy playlist." });
    }

    res.json({ message: "Đã xóa playlist." });
  } catch (error) {
    next(error);
  }
});

export default router;
