const menus = [
  { id: "home", label: "Trang chủ", icon: "⌂" },
  { id: "songs", label: "Bài hát", icon: "♫" },
  { id: "artists", label: "Nghệ sĩ", icon: "♙" },
  { id: "albums", label: "Album", icon: "▣" },
  { id: "playlists", label: "Playlist", icon: "☷" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">♫</span>
        <span>Music App</span>
      </div>

      <div className="sidebar-section">
        <p className="section-label">THƯ VIỆN</p>

        <nav className="navigation" aria-label="Điều hướng chính">
          {menus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              className={`nav-item ${activePage === menu.id ? "active" : ""}`}
              aria-current={activePage === menu.id ? "page" : undefined}
              onClick={() => onNavigate(menu.id)}
            >
              <span className="nav-icon" aria-hidden="true">
                {menu.icon}
              </span>
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="note-icon">♫</span>
          <p>Âm nhạc dành riêng cho bạn</p>
        </div>
      </div>
    </aside>
  );
}
