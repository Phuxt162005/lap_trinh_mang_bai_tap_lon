import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function ArtistsPage({ searchText = "" }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadArtists() {
      setLoading(true);
      setError("");

      try {
        const q = searchText.trim();
        const path = q ? `/artists?q=${encodeURIComponent(q)}` : "/artists";
        const data = await apiRequest(path);
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

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{searchText.trim() ? "Kết quả tìm kiếm" : "Tất cả nghệ sĩ"}</h3>
          <p>{loading ? "Đang tải..." : `${artists.length} nghệ sĩ`}</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Đang tải danh sách nghệ sĩ...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>Không thể tải dữ liệu</h3>
          <p>{error}</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            ♫
          </div>
          <h3>
            {searchText.trim() ? "Không tìm thấy nghệ sĩ" : "Chưa có nghệ sĩ"}
          </h3>
          <p>Hãy thử từ khóa khác hoặc thêm dữ liệu nghệ sĩ trong MySQL.</p>
        </div>
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
                  <span>{artist.album_count} album</span>
                  <span>{artist.song_count} bài hát</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
