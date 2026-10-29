import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function SongList({ songs, onPlaySong }) {
  if (!songs.length) return <p>Chưa có bài hát thuộc mục này.</p>;

  return (
    <div className="songs-table-wrap">
      <table className="songs-table">
        <thead>
          <tr>
            <th>Bài hát</th>
            <th>Album</th>
            <th>Thời lượng</th>
            <th>Phát</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id}>
              <td>{song.title}</td>
              <td>{song.album || "Chưa có album"}</td>
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
  );
}

export default function ArtistsPage({ searchText = "", onPlaySong }) {
  const [artists, setArtists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadArtists() {
      setLoading(true);
      setError("");
      setSelected(null);
      try {
        const q = searchText.trim();
        const data = await apiRequest(
          q ? `/artists?q=${encodeURIComponent(q)}` : "/artists",
        );
        if (!cancelled) setArtists(data.artists || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Không thể tải nghệ sĩ.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadArtists();
    return () => {
      cancelled = true;
    };
  }, [searchText]);

  async function viewArtist(artist) {
    setSelected(artist);
    setSongs([]);
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await apiRequest(`/artists/${artist.id}/songs`);
      setSongs(data.songs || []);
      setSelected(data.artist || artist);
    } catch (err) {
      setDetailError(err.message || "Không thể tải bài hát của nghệ sĩ.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>
            {searchText.trim() ? "Kết quả tìm kiếm nghệ sĩ" : "Tất cả nghệ sĩ"}
          </h3>
          <p>{loading ? "Đang tải..." : `${artists.length} nghệ sĩ`}</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Đang tải nghệ sĩ...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : artists.length === 0 ? (
        <div className="empty-state">Không tìm thấy nghệ sĩ.</div>
      ) : (
        <div className="entity-grid">
          {artists.map((artist) => (
            <article className="entity-card" key={artist.id}>
              {artist.image_url ? (
                <img
                  className="entity-image"
                  src={artist.image_url}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <div
                  className="entity-image entity-placeholder"
                  aria-hidden="true"
                >
                  ♫
                </div>
              )}
              <div className="entity-card-body">
                <h4>{artist.name}</h4>
                <p>{artist.bio || "Chưa có thông tin giới thiệu."}</p>
                <div className="entity-meta">
                  <span>{artist.album_count ?? 0} album</span>
                  <span>{artist.song_count ?? 0} bài hát</span>
                </div>
                <button
                  className="song-play-action"
                  type="button"
                  onClick={() => viewArtist(artist)}
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
              <h3>Bài hát của {selected.name}</h3>
              <p>{songs.length} bài hát</p>
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
          ) : (
            <SongList songs={songs} onPlaySong={onPlaySong} />
          )}
        </section>
      )}
    </section>
  );
}
