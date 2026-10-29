export default function Header({ onSearch, userName, onLogout }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Không gian âm nhạc</h1>
        <p>Khám phá và thưởng thức những giai điệu yêu thích.</p>
      </div>

      <div className="header-actions">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Tìm bài hát, nghệ sĩ, album..."
            onChange={(event) => onSearch(event.target.value)}
            aria-label="Tìm kiếm thư viện"
          />
        </label>

        <button
          className="avatar-button"
          type="button"
          title="Đăng xuất"
          onClick={onLogout}
        >
          {(userName || "U").trim().charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
