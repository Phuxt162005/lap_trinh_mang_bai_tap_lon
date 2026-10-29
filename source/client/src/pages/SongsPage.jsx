export default function SongsPage({ searchText = "" }) {
  const keyword = searchText.trim();

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{keyword ? "Tìm bài hát" : "Bài hát"}</h3>
          <p>
            {keyword
              ? `Từ khóa: ${keyword}`
              : "Danh sách bài hát sẽ hiển thị sau khi kết nối API."}
          </p>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          ♫
        </div>
        <h3>Chưa có dữ liệu bài hát</h3>
        <p>Dữ liệu bài hát sẽ được tải từ backend ở bước tiếp theo.</p>
      </div>
    </section>
  );
}
