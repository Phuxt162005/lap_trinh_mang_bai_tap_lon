export default function HomePage({ searchText = "" }) {
  const keyword = searchText.trim();

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <h3>{keyword ? "Kết quả tìm kiếm" : "Khám phá âm nhạc"}</h3>
          <p>
            {keyword
              ? `Từ khóa: ${keyword}`
              : "Nội dung sẽ được bổ sung khi kết nối dữ liệu."}
          </p>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-icon" aria-hidden="true">
          ♫
        </div>
        <h3>Thư viện đang được xây dựng</h3>
        <p>
          Giao diện đã được chia thành các trang riêng. Bước tiếp theo sẽ kết
          nối API để tải bài hát, nghệ sĩ, album và playlist.
        </p>
      </div>
    </section>
  );
}
