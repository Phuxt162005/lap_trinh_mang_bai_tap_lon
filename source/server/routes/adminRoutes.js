import { Router } from "express";
import pool from "../config/database.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();
router.use(requireAuth, requireAdmin);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function optionalUrl(value) {
  const url = text(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

function handleError(error, res, next) {
  if (
    error.code === "ER_ROW_IS_REFERENCED_2" ||
    error.code === "ER_ROW_IS_REFERENCED"
  ) {
    return res.status(409).json({
      message: "Không thể xóa vì dữ liệu đang được sử dụng ở nơi khác.",
    });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Dữ liệu đã tồn tại." });
  }
  next(error);
}

// ===== BÀI HÁT =====
router.get("/songs", async (req, res, next) => {
  try {
    const [songs] = await pool.execute(
      `SELECT id, title, artist, album, duration_seconds, audio_url, cover_url, created_at
       FROM songs ORDER BY id DESC LIMIT 500`,
    );
    res.json({ songs });
  } catch (e) {
    next(e);
  }
});

router.post("/songs", async (req, res, next) => {
  try {
    const title = text(req.body.title);
    const artist = text(req.body.artist);
    const album = text(req.body.album);
    const duration =
      req.body.duration_seconds === "" || req.body.duration_seconds == null
        ? null
        : Number(req.body.duration_seconds);
    const audioUrl = optionalUrl(req.body.audio_url);
    const coverUrl = optionalUrl(req.body.cover_url);

    if (
      !title ||
      !artist ||
      title.length > 255 ||
      artist.length > 255 ||
      album.length > 255
    ) {
      return res
        .status(400)
        .json({ message: "Tên bài hát, nghệ sĩ và album không hợp lệ." });
    }
    if (duration !== null && (!Number.isInteger(duration) || duration < 0)) {
      return res
        .status(400)
        .json({ message: "Thời lượng phải là số nguyên không âm (giây)." });
    }
    if (audioUrl === undefined || coverUrl === undefined) {
      return res
        .status(400)
        .json({ message: "URL âm thanh hoặc ảnh bìa không hợp lệ." });
    }

    const [result] = await pool.execute(
      `INSERT INTO songs (title, artist, album, duration_seconds, audio_url, cover_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, artist, album || null, duration, audioUrl, coverUrl],
    );
    res.status(201).json({ message: "Đã thêm bài hát.", id: result.insertId });
  } catch (e) {
    handleError(e, res, next);
  }
});

router.put("/songs/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const title = text(req.body.title);
    const artist = text(req.body.artist);
    const album = text(req.body.album);
    const duration =
      req.body.duration_seconds === "" || req.body.duration_seconds == null
        ? null
        : Number(req.body.duration_seconds);
    const audioUrl = optionalUrl(req.body.audio_url);
    const coverUrl = optionalUrl(req.body.cover_url);

    if (!id)
      return res.status(400).json({ message: "ID bài hát không hợp lệ." });
    if (
      !title ||
      !artist ||
      title.length > 255 ||
      artist.length > 255 ||
      album.length > 255
    ) {
      return res
        .status(400)
        .json({ message: "Tên bài hát, nghệ sĩ và album không hợp lệ." });
    }
    if (duration !== null && (!Number.isInteger(duration) || duration < 0)) {
      return res
        .status(400)
        .json({ message: "Thời lượng phải là số nguyên không âm (giây)." });
    }
    if (audioUrl === undefined || coverUrl === undefined) {
      return res
        .status(400)
        .json({ message: "URL âm thanh hoặc ảnh bìa không hợp lệ." });
    }

    const [result] = await pool.execute(
      `UPDATE songs SET title=?, artist=?, album=?, duration_seconds=?, audio_url=?, cover_url=?
       WHERE id=?`,
      [title, artist, album || null, duration, audioUrl, coverUrl, id],
    );
    if (!result.affectedRows) {
      const [rows] = await pool.execute("SELECT id FROM songs WHERE id=?", [
        id,
      ]);
      if (!rows.length)
        return res.status(404).json({ message: "Không tìm thấy bài hát." });
    }
    res.json({ message: "Đã cập nhật bài hát." });
  } catch (e) {
    handleError(e, res, next);
  }
});

router.delete("/songs/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    if (!id)
      return res.status(400).json({ message: "ID bài hát không hợp lệ." });
    const [result] = await pool.execute("DELETE FROM songs WHERE id=?", [id]);
    if (!result.affectedRows)
      return res.status(404).json({ message: "Không tìm thấy bài hát." });
    res.json({ message: "Đã xóa bài hát." });
  } catch (e) {
    handleError(e, res, next);
  }
});

// ===== NGHỆ SĨ =====
router.get("/artists", async (req, res, next) => {
  try {
    const [artists] = await pool.execute(
      "SELECT id, name, bio, image_url, created_at FROM artists ORDER BY id DESC LIMIT 500",
    );
    res.json({ artists });
  } catch (e) {
    next(e);
  }
});

router.post("/artists", async (req, res, next) => {
  try {
    const name = text(req.body.name);
    const bio = text(req.body.bio);
    const imageUrl = optionalUrl(req.body.image_url);
    if (!name || name.length > 255 || bio.length > 5000) {
      return res
        .status(400)
        .json({ message: "Tên nghệ sĩ hoặc phần giới thiệu không hợp lệ." });
    }
    if (imageUrl === undefined)
      return res.status(400).json({ message: "URL ảnh không hợp lệ." });

    const [result] = await pool.execute(
      "INSERT INTO artists (name, bio, image_url) VALUES (?, ?, ?)",
      [name, bio || null, imageUrl],
    );
    res.status(201).json({ message: "Đã thêm nghệ sĩ.", id: result.insertId });
  } catch (e) {
    handleError(e, res, next);
  }
});

router.put("/artists/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const name = text(req.body.name);
    const bio = text(req.body.bio);
    const imageUrl = optionalUrl(req.body.image_url);
    if (!id)
      return res.status(400).json({ message: "ID nghệ sĩ không hợp lệ." });
    if (!name || name.length > 255 || bio.length > 5000) {
      return res
        .status(400)
        .json({ message: "Tên nghệ sĩ hoặc phần giới thiệu không hợp lệ." });
    }
    if (imageUrl === undefined)
      return res.status(400).json({ message: "URL ảnh không hợp lệ." });

    const [result] = await pool.execute(
      "UPDATE artists SET name=?, bio=?, image_url=? WHERE id=?",
      [name, bio || null, imageUrl, id],
    );
    if (!result.affectedRows) {
      const [rows] = await pool.execute("SELECT id FROM artists WHERE id=?", [
        id,
      ]);
      if (!rows.length)
        return res.status(404).json({ message: "Không tìm thấy nghệ sĩ." });
    }
    res.json({ message: "Đã cập nhật nghệ sĩ." });
  } catch (e) {
    handleError(e, res, next);
  }
});

router.delete("/artists/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    if (!id)
      return res.status(400).json({ message: "ID nghệ sĩ không hợp lệ." });
    const [result] = await pool.execute("DELETE FROM artists WHERE id=?", [id]);
    if (!result.affectedRows)
      return res.status(404).json({ message: "Không tìm thấy nghệ sĩ." });
    res.json({ message: "Đã xóa nghệ sĩ." });
  } catch (e) {
    handleError(e, res, next);
  }
});

// ===== ALBUM =====
router.get("/albums", async (req, res, next) => {
  try {
    const [albums] = await pool.execute(
      `SELECT al.id, al.title, al.artist_id, al.release_year, al.cover_url,
              a.name AS artist_name
       FROM albums al JOIN artists a ON a.id=al.artist_id
       ORDER BY al.id DESC LIMIT 500`,
    );
    res.json({ albums });
  } catch (e) {
    next(e);
  }
});

router.post("/albums", async (req, res, next) => {
  try {
    const title = text(req.body.title);
    const artistId = validId(req.body.artist_id);
    const year =
      req.body.release_year === "" || req.body.release_year == null
        ? null
        : Number(req.body.release_year);
    const coverUrl = optionalUrl(req.body.cover_url);

    if (!title || title.length > 255 || !artistId) {
      return res
        .status(400)
        .json({ message: "Tên album hoặc nghệ sĩ không hợp lệ." });
    }
    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return res
        .status(400)
        .json({ message: "Năm phát hành phải từ 1900 đến 2100." });
    }
    if (coverUrl === undefined)
      return res.status(400).json({ message: "URL ảnh bìa không hợp lệ." });

    const [artists] = await pool.execute("SELECT id FROM artists WHERE id=?", [
      artistId,
    ]);
    if (!artists.length)
      return res.status(400).json({ message: "Nghệ sĩ không tồn tại." });

    const [result] = await pool.execute(
      "INSERT INTO albums (title, artist_id, release_year, cover_url) VALUES (?, ?, ?, ?)",
      [title, artistId, year, coverUrl],
    );
    res.status(201).json({ message: "Đã thêm album.", id: result.insertId });
  } catch (e) {
    handleError(e, res, next);
  }
});

router.put("/albums/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const title = text(req.body.title);
    const artistId = validId(req.body.artist_id);
    const year =
      req.body.release_year === "" || req.body.release_year == null
        ? null
        : Number(req.body.release_year);
    const coverUrl = optionalUrl(req.body.cover_url);

    if (!id) return res.status(400).json({ message: "ID album không hợp lệ." });
    if (!title || title.length > 255 || !artistId) {
      return res
        .status(400)
        .json({ message: "Tên album hoặc nghệ sĩ không hợp lệ." });
    }
    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      return res
        .status(400)
        .json({ message: "Năm phát hành phải từ 1900 đến 2100." });
    }
    if (coverUrl === undefined)
      return res.status(400).json({ message: "URL ảnh bìa không hợp lệ." });

    const [artists] = await pool.execute("SELECT id FROM artists WHERE id=?", [
      artistId,
    ]);
    if (!artists.length)
      return res.status(400).json({ message: "Nghệ sĩ không tồn tại." });

    const [result] = await pool.execute(
      "UPDATE albums SET title=?, artist_id=?, release_year=?, cover_url=? WHERE id=?",
      [title, artistId, year, coverUrl, id],
    );
    if (!result.affectedRows) {
      const [rows] = await pool.execute("SELECT id FROM albums WHERE id=?", [
        id,
      ]);
      if (!rows.length)
        return res.status(404).json({ message: "Không tìm thấy album." });
    }
    res.json({ message: "Đã cập nhật album." });
  } catch (e) {
    handleError(e, res, next);
  }
});

router.delete("/albums/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID album không hợp lệ." });
    const [result] = await pool.execute("DELETE FROM albums WHERE id=?", [id]);
    if (!result.affectedRows)
      return res.status(404).json({ message: "Không tìm thấy album." });
    res.json({ message: "Đã xóa album." });
  } catch (e) {
    handleError(e, res, next);
  }
});

/* ===== QUẢN LÝ NGƯỜI DÙNG ===== */

// Lấy danh sách tài khoản và tìm kiếm theo tên/email.
router.get("/users", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);
    const params = [];
    let sql = `
      SELECT id, name, email, role, created_at
      FROM users
    `;

    if (q) {
      sql += " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY created_at DESC, id DESC LIMIT ?";
    params.push(limit);

    const [users] = await pool.execute(sql, params);
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// Thay đổi vai trò user/admin.
router.patch("/users/:id/role", async (req, res, next) => {
  let connection;

  try {
    const id = validId(req.params.id);
    const role = text(req.body.role);

    if (!id) {
      return res.status(400).json({ message: "ID tài khoản không hợp lệ." });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ." });
    }

    if (Number(id) === Number(req.user.id) && role !== "admin") {
      return res.status(409).json({
        message: "Không thể tự hạ quyền tài khoản đang đăng nhập.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id, role FROM users WHERE id = ? FOR UPDATE",
      [id],
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });
    }

    const target = rows[0];

    if (target.role === "admin" && role === "user") {
      const [admins] = await connection.execute(
        "SELECT id FROM users WHERE role = 'admin' FOR UPDATE",
      );

      if (admins.length <= 1) {
        await connection.rollback();
        return res.status(409).json({
          message: "Không thể hạ quyền admin cuối cùng.",
        });
      }
    }

    await connection.execute("UPDATE users SET role = ? WHERE id = ?", [
      role,
      id,
    ]);

    await connection.commit();
    res.json({ message: "Đã cập nhật vai trò tài khoản.", id, role });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    connection?.release();
  }
});

// Xóa tài khoản và playlist thuộc tài khoản đó.
router.delete("/users/:id", async (req, res, next) => {
  let connection;

  try {
    const id = validId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID tài khoản không hợp lệ." });
    }

    // Không cho admin xóa chính tài khoản đang đăng nhập.
    if (Number(id) === Number(req.user.id)) {
      return res.status(409).json({
        message: "Không thể tự xóa tài khoản đang đăng nhập.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id, role FROM users WHERE id = ? FOR UPDATE",
      [id],
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });
    }

    if (rows[0].role === "admin") {
      const [admins] = await connection.execute(
        "SELECT id FROM users WHERE role = 'admin' FOR UPDATE",
      );

      if (admins.length <= 1) {
        await connection.rollback();
        return res.status(409).json({
          message: "Không thể xóa admin cuối cùng.",
        });
      }
    }

    // Xóa các bản ghi liên kết trước khi xóa playlist.
    await connection.execute(
      `DELETE ps FROM playlist_songs ps
       INNER JOIN playlists p ON p.id = ps.playlist_id
       WHERE p.user_id = ?`,
      [id],
    );

    await connection.execute("DELETE FROM playlists WHERE user_id = ?", [id]);
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);

    await connection.commit();
    res.json({ message: "Đã xóa tài khoản và các playlist của tài khoản." });
  } catch (error) {
    if (connection) await connection.rollback();

    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        message:
          "Không thể xóa tài khoản vì dữ liệu liên quan vẫn đang được sử dụng.",
      });
    }

    next(error);
  } finally {
    connection?.release();
  }
});

export default router;
