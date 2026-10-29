export default function Header({ onSearch }) {
  return (
    <header className="header">
      <div className="header-title">
        <h1>Không gian âm nhạc</h1>
        <p>Khám phá và thưởng thức những giai điệu yêu thích.</p>
      </div>

      <div className="header-actions">
        <label className="search-box">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Tìm bài hát, nghệ sĩ, album..."
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>

        <button className="avatar-button" title="Tài khoản">
          U
        </button>
      </div>
    </header>
  );
}
