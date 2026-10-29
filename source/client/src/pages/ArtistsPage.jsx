export default function ArtistsPage({ searchText = "" }) {
  const keyword = searchText.trim();

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{keyword ? "Tìm nghệ sĩ" : "Nghệ sĩ"}</h3>
          <p>
            {keyword
              ? `Từ khóa: ${keyword}`
              : "Danh sách nghệ sĩ sẽ hiển thị sau khi kết nối API."}
          </p>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          ♙
        </div>
        <h3>Chưa có dữ liệu nghệ sĩ</h3>
        <p>Dữ liệu nghệ sĩ sẽ được tải từ backend ở bước tiếp theo.</p>
      </div>
    </section>
  );
}
