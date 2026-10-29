import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function formatDuration(seconds) {
  if (seconds == null) return "--:--";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function PlaylistsPage({ searchText = "" }) {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [songId, setSongId] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPlaylists = useCallback(async () => {
    const data = await apiRequest("/playlists");
    setPlaylists(data.playlists || []);
    return data.playlists || [];
  }, []);

  const loadSongs = useCallback(async () => {
    const data = await apiRequest("/songs");
    setSongs(data.songs || []);
  }, []);

  const loadPlaylistSongs = useCallback(async (id) => {
    if (!id) {
      setPlaylistSongs([]);
      return;
    }

    setDetailLoading(true);
    try {
      const data = await apiRequest(`/playlists/${id}/songs`);
      setPlaylistSongs(data.songs || []);
    } catch (err) {
      setError(err.message || "Không thể tải bài hát trong playlist.");
      setPlaylistSongs([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      setError("");

      try {
        const [playlistData, songData] = await Promise.all([
          apiRequest("/playlists"),
          apiRequest("/songs"),
        ]);

        if (cancelled) return;

        const nextPlaylists = playlistData.playlists || [];
        setPlaylists(nextPlaylists);
        setSongs(songData.songs || []);
        setSelectedId((current) =>
          nextPlaylists.some((p) => String(p.id) === String(current))
            ? current
            : nextPlaylists.length
              ? String(nextPlaylists[0].id)
              : "",
        );
      } catch (err) {
        if (!cancelled)
          setError(err.message || "Không thể tải dữ liệu playlist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadPlaylistSongs(selectedId);
  }, [selectedId, loadPlaylistSongs]);

  const visiblePlaylists = playlists.filter((playlist) => {
    const q = searchText.trim().toLowerCase();
    return (
      !q ||
      playlist.name.toLowerCase().includes(q) ||
      (playlist.description || "").toLowerCase().includes(q)
    );
  });

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const data = await apiRequest("/playlists", {
        method: "POST",
        body: { name, description },
      });

      const updated = await loadPlaylists();
      setSelectedId(String(data.playlist.id));
      setName("");
      setDescription("");
      setMessage("Đã tạo playlist.");
    } catch (err) {
      setError(err.message || "Không thể tạo playlist.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAddSong(event) {
    event.preventDefault();
    if (!selectedId || !songId) return;

    setError("");
    setMessage("");
    setBusy(true);

    try {
      await apiRequest(`/playlists/${selectedId}/songs`, {
        method: "POST",
        body: { songId: Number(songId) },
      });
      await Promise.all([loadPlaylistSongs(selectedId), loadPlaylists()]);
      setSongId("");
      setMessage("Đã thêm bài hát vào playlist.");
    } catch (err) {
      setError(err.message || "Không thể thêm bài hát.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveSong(id) {
    if (!window.confirm("Bạn muốn xóa bài hát này khỏi playlist?")) return;

    setError("");
    setMessage("");
    setBusy(true);

    try {
      await apiRequest(`/playlists/${selectedId}/songs/${id}`, {
        method: "DELETE",
      });
      await Promise.all([loadPlaylistSongs(selectedId), loadPlaylists()]);
      setMessage("Đã xóa bài hát khỏi playlist.");
    } catch (err) {
      setError(err.message || "Không thể xóa bài hát.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePlaylist() {
    const current = playlists.find((p) => String(p.id) === String(selectedId));
    if (!current || !window.confirm(`Xóa playlist "${current.name}"?`)) return;

    setError("");
    setMessage("");
    setBusy(true);

    try {
      await apiRequest(`/playlists/${selectedId}`, { method: "DELETE" });
      const updated = await loadPlaylists();
      const nextId = updated.length ? String(updated[0].id) : "";
      setSelectedId(nextId);
      setPlaylistSongs([]);
      setMessage("Đã xóa playlist.");
    } catch (err) {
      setError(err.message || "Không thể xóa playlist.");
    } finally {
      setBusy(false);
    }
  }

  const selectedPlaylist = playlists.find(
    (p) => String(p.id) === String(selectedId),
  );

  if (loading) {
    return (
      <section className="content-section">
        <div className="empty-state">
          <p>Đang tải playlist...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>Thư viện playlist</h3>
          <p>{visiblePlaylists.length} playlist của bạn</p>
        </div>
      </div>

      {error && (
        <p className="playlist-notice playlist-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="playlist-notice playlist-success" role="status">
          {message}
        </p>
      )}

      <div className="playlist-layout">
        <div className="playlist-panel">
          <h3>Tạo playlist mới</h3>
          <form className="playlist-form" onSubmit={handleCreate}>
            <label>
              Tên playlist
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="Ví dụ: Nhạc thư giãn"
                required
              />
            </label>
            <label>
              Mô tả
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Mô tả playlist (không bắt buộc)"
              />
            </label>
            <button
              className="playlist-primary-button"
              disabled={busy}
              type="submit"
            >
              {busy ? "Đang xử lý..." : "＋ Tạo playlist"}
            </button>
          </form>

          <h3 className="playlist-list-title">Playlist của tôi</h3>
          {visiblePlaylists.length === 0 ? (
            <p className="playlist-muted">
              {searchText.trim()
                ? "Không tìm thấy playlist phù hợp."
                : "Bạn chưa có playlist. Hãy tạo playlist đầu tiên."}
            </p>
          ) : (
            <div className="playlist-list">
              {visiblePlaylists.map((playlist) => (
                <button
                  type="button"
                  key={playlist.id}
                  className={`playlist-list-item ${String(playlist.id) === String(selectedId) ? "active" : ""}`}
                  onClick={() => setSelectedId(String(playlist.id))}
                >
                  <span className="playlist-list-icon">☷</span>
                  <span className="playlist-list-text">
                    <strong>{playlist.name}</strong>
                    <small>{playlist.song_count} bài hát</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="playlist-panel playlist-detail">
          {!selectedPlaylist ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                ☷
              </div>
              <h3>Chưa chọn playlist</h3>
              <p>Tạo playlist mới để bắt đầu thêm bài hát.</p>
            </div>
          ) : (
            <>
              <div className="playlist-detail-heading">
                <div>
                  <span className="eyebrow">PLAYLIST CỦA BẠN</span>
                  <h3>{selectedPlaylist.name}</h3>
                  <p>{selectedPlaylist.description || "Chưa có mô tả"}</p>
                </div>
                <button
                  type="button"
                  className="playlist-danger-button"
                  disabled={busy}
                  onClick={handleDeletePlaylist}
                >
                  Xóa playlist
                </button>
              </div>

              <form className="playlist-add-form" onSubmit={handleAddSong}>
                <label htmlFor="playlist-song-select">Thêm bài hát</label>
                <div className="playlist-add-controls">
                  <select
                    id="playlist-song-select"
                    value={songId}
                    onChange={(e) => setSongId(e.target.value)}
                    required
                  >
                    <option value="">Chọn bài hát...</option>
                    {songs.map((song) => (
                      <option key={song.id} value={song.id}>
                        {song.title} — {song.artist}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="playlist-primary-button"
                    disabled={busy || !songId}
                  >
                    Thêm
                  </button>
                </div>
              </form>

              <div className="playlist-song-list">
                <h4>Bài hát trong playlist ({playlistSongs.length})</h4>
                {detailLoading ? (
                  <p className="playlist-muted">Đang tải bài hát...</p>
                ) : playlistSongs.length === 0 ? (
                  <p className="playlist-muted">
                    Playlist chưa có bài hát. Hãy chọn bài hát ở phía trên.
                  </p>
                ) : (
                  playlistSongs.map((song) => (
                    <div className="playlist-song-row" key={song.id}>
                      <span className="song-cover song-cover-placeholder">
                        ♫
                      </span>
                      <div className="playlist-song-info">
                        <strong>{song.title}</strong>
                        <span>
                          {song.artist} · {song.album || "Chưa có album"}
                        </span>
                      </div>
                      <span className="playlist-song-duration">
                        {formatDuration(song.duration_seconds)}
                      </span>
                      <button
                        type="button"
                        className="playlist-remove-button"
                        disabled={busy}
                        onClick={() => handleRemoveSong(song.id)}
                        aria-label={`Xóa ${song.title} khỏi playlist`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
