export default function AlbumsPage({ searchText = "" }) {
  const keyword = searchText.trim();

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{keyword ? "Tìm album" : "Album"}</h3>
          <p>
            {keyword
              ? `Từ khóa: ${keyword}`
              : "Danh sách album sẽ hiển thị sau khi kết nối API."}
          </p>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          ▣
        </div>
        <h3>Chưa có dữ liệu album</h3>
        <p>Dữ liệu album sẽ được tải từ backend ở bước tiếp theo.</p>
      </div>
    </section>
  );
}
