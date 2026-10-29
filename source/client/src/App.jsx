import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import MusicPlayer from "./components/layout/MusicPlayer";

const pageTitles = {
  home: "Trang chủ",
  songs: "Bài hát",
  artists: "Nghệ sĩ",
  albums: "Album",
  playlists: "Playlist",
};

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [searchText, setSearchText] = useState("");

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-layout">
        <Header onSearch={setSearchText} />

        <main className="main-content">
          <section className="welcome-section">
            <span className="eyebrow">MUSIC APP</span>
            <h2>{pageTitles[activePage]}</h2>
            <p>Tìm kiếm, khám phá và quản lý thư viện âm nhạc của bạn.</p>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <div>
                <h3>{searchText ? "Kết quả tìm kiếm" : "Khám phá âm nhạc"}</h3>
                <p>
                  {searchText
                    ? `Từ khóa: ${searchText}`
                    : "Nội dung sẽ được bổ sung ở các bước tiếp theo."}
                </p>
              </div>
            </div>

            <div className="empty-state">
              <div className="empty-icon">♫</div>
              <h3>Thư viện đang được xây dựng</h3>
              <p>
                Chúng ta sẽ bổ sung dữ liệu bài hát, nghệ sĩ, album và playlist
                sau khi hoàn thiện bố cục.
              </p>
            </div>
          </section>
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}
