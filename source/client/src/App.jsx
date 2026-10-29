import { useEffect, useState } from "react";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import MusicPlayer from "./components/layout/MusicPlayer";
import HomePage from "./pages/HomePage";
import SongsPage from "./pages/SongsPage";
import ArtistsPage from "./pages/ArtistsPage";
import AlbumsPage from "./pages/AlbumsPage";
import PlaylistsPage from "./pages/PlaylistPage";
import {
  apiRequest,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from "./services/api";

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
  const [checkingSession, setCheckingSession] = useState(true);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const currentSong = currentIndex >= 0 ? queue[currentIndex] : null;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getAuthToken();

      if (!token) {
        if (!cancelled) setCheckingSession(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        clearAuthToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogin(userData) {
    if (userData.token) setAuthToken(userData.token);
    setUser({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
    setActivePage("home");
    setSearchText("");
  }

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    setActivePage("home");
    setSearchText("");
    setQueue([]);
    setCurrentIndex(-1);
  }

  function playSong(song, songs = []) {
    const list = Array.isArray(songs) && songs.length ? songs : [song];
    let index = list.findIndex((item) => String(item.id) === String(song.id));

    if (index < 0) {
      setQueue([song]);
      setCurrentIndex(0);
      return;
    }

    setQueue(list);
    setCurrentIndex(index);
  }

  function playNext() {
    setCurrentIndex((index) =>
      index >= 0 && index < queue.length - 1 ? index + 1 : index,
    );
  }

  function playPrevious() {
    setCurrentIndex((index) => (index > 0 ? index - 1 : index));
  }

  function renderPage() {
    const pageProps = { searchText, onPlaySong: playSong };

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

  if (checkingSession) {
    return <main className="auth-page">Đang kiểm tra phiên đăng nhập...</main>;
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

      <MusicPlayer
        currentSong={currentSong}
        onNext={playNext}
        onPrevious={playPrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </div>
  );
}
