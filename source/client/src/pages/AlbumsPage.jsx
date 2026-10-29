import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function AlbumsPage({ searchText = "", onPlaySong }) {
  const [albums, setAlbums] = useState([]);
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAlbums() {
      setLoading(true);
      setError("");
      setSelected(null);
      try {
        const q = searchText.trim();
        const data = await apiRequest(
          q ? `/albums?q=${encodeURIComponent(q)}` : "/albums",
        );
        if (!cancelled) setAlbums(data.albums || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Không thể tải album.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAlbums();
    return () => {
      cancelled = true;
    };
  }, [searchText]);

  async function viewAlbum(album) {
    setSelected(album);
    setSongs([]);
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await apiRequest(`/albums/${album.id}/songs`);
      setSongs(data.songs || []);
      setSelected(data.album || album);
    } catch (err) {
      setDetailError(err.message || "Không thể tải bài hát của album.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>
            {searchText.trim() ? "Kết quả tìm kiếm album" : "Tất cả album"}
          </h3>
          <p>{loading ? "Đang tải..." : `${albums.length} album`}</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Đang tải album...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : albums.length === 0 ? (
        <div className="empty-state">Không tìm thấy album.</div>
      ) : (
        <div className="entity-grid">
          {albums.map((album) => (
            <article className="entity-card" key={album.id}>
              {album.cover_url ? (
                <img
                  className="entity-image"
                  src={album.cover_url}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <div
                  className="entity-image entity-placeholder"
                  aria-hidden="true"
                >
                  ▣
                </div>
              )}
              <div className="entity-card-body">
                <h4>{album.title}</h4>
                <p>{album.artist_name || "Chưa rõ nghệ sĩ"}</p>
                <div className="entity-meta">
                  <span>{album.release_year || "Chưa rõ năm phát hành"}</span>
                </div>
                <button
                  className="song-play-action"
                  type="button"
                  onClick={() => viewAlbum(album)}
                >
                  Xem bài hát
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <section className="artist-detail-panel">
          <div className="section-heading">
            <div>
              <h3>{selected.title}</h3>
              <p>
                {selected.artist_name || "Chưa rõ nghệ sĩ"} · {songs.length} bài
                hát
              </p>
            </div>
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => setSelected(null)}
            >
              Đóng
            </button>
          </div>

          {detailLoading ? (
            <p>Đang tải bài hát...</p>
          ) : detailError ? (
            <p role="alert">{detailError}</p>
          ) : songs.length === 0 ? (
            <div className="empty-state">
              Album này chưa có bài hát hoặc tên album/nghệ sĩ chưa khớp với dữ
              liệu bài hát.
            </div>
          ) : (
            <div className="songs-table-wrap">
              <table className="songs-table">
                <thead>
                  <tr>
                    <th>Bài hát</th>
                    <th>Nghệ sĩ</th>
                    <th>Thời lượng</th>
                    <th>Phát</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id}>
                      <td>{song.title}</td>
                      <td>{song.artist}</td>
                      <td>
                        {song.duration_seconds == null
                          ? "--:--"
                          : `${Math.floor(song.duration_seconds / 60)}:${String(song.duration_seconds % 60).padStart(2, "0")}`}
                      </td>
                      <td>
                        <button
                          className="song-play-action"
                          type="button"
                          onClick={() => onPlaySong?.(song, songs)}
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
      )}
    </section>
  );
}
