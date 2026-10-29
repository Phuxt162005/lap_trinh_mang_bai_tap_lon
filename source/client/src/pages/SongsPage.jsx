import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function formatDuration(seconds) {
  if (seconds == null) return "--:--";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SongsPage({ searchText = "", onPlaySong }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSongs() {
      setLoading(true);
      setError("");
      try {
        const q = searchText.trim();
        const path = q ? `/songs?q=${encodeURIComponent(q)}` : "/songs";
        const data = await apiRequest(path);
        if (!cancelled) setSongs(data.songs || []);
      } catch (err) {
        if (!cancelled)
          setError(err.message || "Không thể tải danh sách bài hát.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSongs();
    return () => {
      cancelled = true;
    };
  }, [searchText]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{searchText.trim() ? "Kết quả tìm kiếm" : "Tất cả bài hát"}</h3>
          <p>{loading ? "Đang tải dữ liệu..." : `${songs.length} bài hát`}</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Đang tải danh sách bài hát...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>Không thể tải bài hát</h3>
          <p>{error}</p>
        </div>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            ♫
          </div>
          <h3>
            {searchText.trim() ? "Không tìm thấy bài hát" : "Chưa có bài hát"}
          </h3>
          <p>
            {searchText.trim()
              ? "Hãy thử một từ khóa khác."
              : "Thêm dữ liệu vào bảng songs trong MySQL để hiển thị tại đây."}
          </p>
        </div>
      ) : (
        <div className="songs-table-wrap">
          <table className="songs-table">
            <thead>
              <tr>
                <th>Bài hát</th>
                <th>Nghệ sĩ</th>
                <th>Album</th>
                <th>Thời lượng</th>
                <th>Phát</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id}>
                  <td>
                    <div className="song-title-cell">
                      {song.cover_url ? (
                        <img
                          className="song-cover"
                          src={song.cover_url}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span className="song-cover song-cover-placeholder">
                          ♫
                        </span>
                      )}
                      <span>{song.title}</span>
                    </div>
                  </td>
                  <td>{song.artist}</td>
                  <td>{song.album || "Chưa có album"}</td>
                  <td>{formatDuration(song.duration_seconds)}</td>
                  <td>
                    <button
                      type="button"
                      className="song-play-action"
                      onClick={() => onPlaySong?.(song, songs)}
                      title={`Phát ${song.title}`}
                      aria-label={`Phát ${song.title}`}
                    >
                      ▶ Phát
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
