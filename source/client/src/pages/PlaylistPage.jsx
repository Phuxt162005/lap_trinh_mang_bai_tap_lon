export default function PlaylistsPage({ searchText = "" }) {
  const keyword = searchText.trim();

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{keyword ? "Tìm playlist" : "Playlist"}</h3>
          <p>
            {keyword
              ? `Từ khóa: ${keyword}`
              : "Các playlist sẽ hiển thị sau khi kết nối API."}
          </p>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          ☷
        </div>
        <h3>Chưa có dữ liệu playlist</h3>
        <p>Playlist của người dùng sẽ được tải từ backend ở bước tiếp theo.</p>
      </div>
    </section>
  );
}
