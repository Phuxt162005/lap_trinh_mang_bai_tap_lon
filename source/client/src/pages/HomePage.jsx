import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function SongCard({ song, songs, onPlaySong }) {
  return (
    <article className="entity-card home-song-card">
      {song.cover_url ? (
        <img
          className="entity-image"
          src={song.cover_url}
          alt=""
          loading="lazy"
        />
      ) : (
        <div className="entity-image entity-placeholder" aria-hidden="true">
          ♫
        </div>
      )}
      <div className="entity-card-body">
        <h4>{song.title}</h4>
        <p>{song.artist || "Chưa rõ nghệ sĩ"}</p>
        <div className="entity-meta">
          <span>{song.album || "Chưa có album"}</span>
          <button
            type="button"
            className="song-play-action"
            onClick={() => onPlaySong?.(song, songs)}
          >
            ▶ Phát
          </button>
        </div>
      </div>
    </article>
  );
}

export default function HomePage({ searchText = "", onPlaySong }) {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const keyword = searchText.trim();

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const q = keyword ? `&q=${encodeURIComponent(keyword)}` : "";
        const [songData, artistData, albumData] = await Promise.all([
          apiRequest(`/songs?limit=6${q}`),
          apiRequest(`/artists?limit=6${q}`),
          apiRequest(`/albums?limit=6${q}`),
        ]);

        if (cancelled) return;
        setSongs(songData.songs || []);
        setArtists(artistData.artists || []);
        setAlbums(albumData.albums || []);
      } catch (err) {
        if (!cancelled)
          setError(err.message || "Không thể tải dữ liệu trang chủ.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [keyword]);

  if (loading) {
    return (
      <section className="content-section">
        <div className="empty-state">
          <p>Đang tải thư viện âm nhạc...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="content-section">
        <div className="empty-state">
          <h3>Không thể tải thư viện</h3>
          <p>{error}</p>
          <button
            type="button"
            className="song-play-action"
            onClick={() => window.location.reload()}
          >
            Thử tải lại
          </button>
        </div>
      </section>
    );
  }

  const noResults = !songs.length && !artists.length && !albums.length;

  return (
    <section className="content-section home-discovery">
      {keyword ? (
        <>
          <div className="section-heading">
            <div>
              <h3>Kết quả tìm kiếm</h3>
              <p>Từ khóa: “{keyword}”</p>
            </div>
          </div>
          {noResults ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                ⌕
              </div>
              <h3>Không tìm thấy kết quả</h3>
              <p>Hãy thử tên bài hát, nghệ sĩ hoặc album khác.</p>
            </div>
          ) : (
            <>
              {songs.length > 0 && (
                <div className="home-result-section">
                  <div className="section-heading">
                    <div>
                      <h3>Bài hát</h3>
                      <p>{songs.length} kết quả</p>
                    </div>
                  </div>
                  <div className="entity-grid">
                    {songs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        songs={songs}
                        onPlaySong={onPlaySong}
                      />
                    ))}
                  </div>
                </div>
              )}
              {artists.length > 0 && (
                <div className="home-result-section">
                  <div className="section-heading">
                    <div>
                      <h3>Nghệ sĩ</h3>
                      <p>{artists.length} kết quả</p>
                    </div>
                  </div>
                  <div className="entity-grid">
                    {artists.map((artist) => (
                      <article className="entity-card" key={artist.id}>
                        {artist.image_url ? (
                          <img
                            className="entity-image"
                            src={artist.image_url}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <div className="entity-image entity-placeholder">
                            ♫
                          </div>
                        )}
                        <div className="entity-card-body">
                          <h4>{artist.name}</h4>
                          <p>{artist.bio || "Chưa có thông tin giới thiệu."}</p>
                          <div className="entity-meta">
                            <span>{artist.album_count} album</span>
                            <span>{artist.song_count} bài hát</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
              {albums.length > 0 && (
                <div className="home-result-section">
                  <div className="section-heading">
                    <div>
                      <h3>Album</h3>
                      <p>{albums.length} kết quả</p>
                    </div>
                  </div>
                  <div className="entity-grid">
                    {albums.map((album) => (
                      <article className="entity-card" key={album.id}>
                        {album.cover_url ? (
                          <img
                            className="entity-image"
                            src={album.cover_url}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <div className="entity-image entity-placeholder">
                            ▣
                          </div>
                        )}
                        <div className="entity-card-body">
                          <h4>{album.title}</h4>
                          <p>{album.artist_name || "Chưa rõ nghệ sĩ"}</p>
                          <div className="entity-meta">
                            <span>
                              {album.release_year || "Chưa rõ năm phát hành"}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className="home-intro">
            <span className="eyebrow">MUSIC DISCOVERY</span>
            <h2>Âm nhạc dành riêng cho bạn</h2>
            <p>
              Khám phá những bài hát, nghệ sĩ và album trong thư viện của bạn.
            </p>
          </div>

          <div className="section-heading home-section-heading">
            <div>
              <h3>Bài hát mới trong thư viện</h3>
              <p>{songs.length} bài hát</p>
            </div>
          </div>
          {songs.length ? (
            <div className="entity-grid">
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  songs={songs}
                  onPlaySong={onPlaySong}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Chưa có bài hát</h3>
              <p>Hãy thêm dữ liệu vào bảng songs trong MySQL.</p>
            </div>
          )}

          <div className="section-heading home-section-heading">
            <div>
              <h3>Nghệ sĩ nổi bật</h3>
              <p>{artists.length} nghệ sĩ</p>
            </div>
          </div>
          {artists.length ? (
            <div className="entity-grid">
              {artists.slice(0, 4).map((artist) => (
                <article className="entity-card" key={artist.id}>
                  {artist.image_url ? (
                    <img
                      className="entity-image"
                      src={artist.image_url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="entity-image entity-placeholder">♫</div>
                  )}
                  <div className="entity-card-body">
                    <h4>{artist.name}</h4>
                    <p>{artist.bio || "Chưa có thông tin giới thiệu."}</p>
                    <div className="entity-meta">
                      <span>{artist.album_count} album</span>
                      <span>{artist.song_count} bài hát</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="home-muted">Chưa có dữ liệu nghệ sĩ.</p>
          )}

          <div className="section-heading home-section-heading">
            <div>
              <h3>Album trong thư viện</h3>
              <p>{albums.length} album</p>
            </div>
          </div>
          {albums.length ? (
            <div className="entity-grid">
              {albums.slice(0, 4).map((album) => (
                <article className="entity-card" key={album.id}>
                  {album.cover_url ? (
                    <img
                      className="entity-image"
                      src={album.cover_url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="entity-image entity-placeholder">▣</div>
                  )}
                  <div className="entity-card-body">
                    <h4>{album.title}</h4>
                    <p>{album.artist_name || "Chưa rõ nghệ sĩ"}</p>
                    <div className="entity-meta">
                      <span>
                        {album.release_year || "Chưa rõ năm phát hành"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="home-muted">Chưa có dữ liệu album.</p>
          )}
        </>
      )}
    </section>
  );
}
