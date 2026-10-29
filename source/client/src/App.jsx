import { useState } from "react";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import MusicPlayer from "./components/layout/MusicPlayer";
import HomePage from "./pages/HomePage";
import SongsPage from "./pages/SongsPage";
import ArtistsPage from "./pages/ArtistsPage";
import AlbumsPage from "./pages/AlbumsPage";
import PlaylistsPage from "./pages/PlaylistPage";

const pageTitles = {
  home: "Trang chủ",
  songs: "Bài hát",
  artists: "Nghệ sĩ",
  albums: "Album",
  playlists: "Playlist",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [searchText, setSearchText] = useState("");

  function handleLogin(userData) {
    setUser(userData);
    setActivePage("home");
    setSearchText("");
  }

  function handleLogout() {
    setUser(null);
    setActivePage("home");
    setSearchText("");
  }

  function renderPage() {
    const pageProps = { searchText };

    switch (activePage) {
      case "songs":
        return <SongsPage {...pageProps} />;
      case "artists":
        return <ArtistsPage {...pageProps} />;
      case "albums":
        return <AlbumsPage {...pageProps} />;
      case "playlists":
        return <PlaylistsPage {...pageProps} />;
      case "home":
      default:
        return <HomePage {...pageProps} />;
    }
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-layout">
        <Header
          onSearch={setSearchText}
          userName={user.name}
          onLogout={handleLogout}
        />

        <main className="main-content">
          <section className="welcome-section">
            <span className="eyebrow">MUSIC APP</span>
            <h2>{pageTitles[activePage]}</h2>
            <p>
              Xin chào {user.name || user.email}. Tìm kiếm và khám phá thư viện
              âm nhạc của bạn.
            </p>
          </section>

          {renderPage()}
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}
