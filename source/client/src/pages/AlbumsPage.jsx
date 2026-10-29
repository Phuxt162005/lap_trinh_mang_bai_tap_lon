import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function AlbumsPage({ searchText = "" }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAlbums() {
      setLoading(true);
      setError("");

      try {
        const q = searchText.trim();
        const path = q ? `/albums?q=${encodeURIComponent(q)}` : "/albums";
        const data = await apiRequest(path);
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

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{searchText.trim() ? "Kết quả tìm kiếm" : "Tất cả album"}</h3>
          <p>{loading ? "Đang tải..." : `${albums.length} album`}</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Đang tải danh sách album...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <h3>Không thể tải dữ liệu</h3>
          <p>{error}</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            ▣
          </div>
          <h3>
            {searchText.trim() ? "Không tìm thấy album" : "Chưa có album"}
          </h3>
          <p>Hãy thử từ khóa khác hoặc thêm dữ liệu album trong MySQL.</p>
        </div>
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
                <p>{album.artist_name}</p>
                <div className="entity-meta">
                  <span>{album.release_year || "Chưa rõ năm phát hành"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
